// FCM bootstrap. Registers the device, writes the token to public.fcm_tokens,
// and handles foreground/background tap → deeplink routing.

import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Top-level handler required by Firebase for background messages.
@pragma('vm:entry-point')
Future<void> _bgHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

class Notifications {
  static final _local = FlutterLocalNotificationsPlugin();
  static const _channelId = 'promotions';

  // Call once from main.dart — after Supabase & router are ready.
  static Future<void> init({required GoRouter router}) async {
    try {
      await Firebase.initializeApp();
    } catch (_) {
      // google-services.json missing — push is optional in dev.
      return;
    }

    FirebaseMessaging.onBackgroundMessage(_bgHandler);

    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(alert: true, badge: true, sound: true);

    // ── Local notification plugin ──────────────────────────────────────
    await _local.initialize(
      InitializationSettings(
        android: const AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: const DarwinInitializationSettings(),
      ),
      onDidReceiveNotificationResponse: (details) {
        final payload = details.payload;
        if (payload != null && payload.startsWith('/')) {
          router.push(payload);
        }
      },
    );

    // Create Android notification channel
    await _local
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            'Lumi Tea promotions',
            description: 'New promotions and seasonal offers',
            importance: Importance.high,
          ),
        );

    // ── Token registration ─────────────────────────────────────────────
    final token = await messaging.getToken();
    if (token != null) await _saveToken(token);
    messaging.onTokenRefresh.listen(_saveToken);

    // ── Foreground: show local notification ───────────────────────────
    FirebaseMessaging.onMessage.listen((m) {
      final n = m.notification;
      if (n == null) return;
      final deeplink = m.data['deeplink'] as String?;
      _local.show(
        m.hashCode,
        n.title,
        n.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            _channelId,
            'Lumi Tea promotions',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: const DarwinNotificationDetails(),
        ),
        payload: deeplink, // used by onDidReceiveNotificationResponse
      );
    });

    // ── Background tap: user tapped notification while app was in bg ──
    FirebaseMessaging.onMessageOpenedApp.listen((m) {
      final deeplink = m.data['deeplink'] as String?;
      if (deeplink != null && deeplink.startsWith('/')) {
        router.push(deeplink);
      }
    });

    // ── Cold start: app launched from a terminated state via notification
    final initial = await messaging.getInitialMessage();
    if (initial != null) {
      final deeplink = initial.data['deeplink'] as String?;
      if (deeplink != null && deeplink.startsWith('/')) {
        // Small delay so the router is fully initialised before navigating.
        Future.delayed(const Duration(milliseconds: 500), () {
          router.push(deeplink);
        });
      }
    }
  }

  static Future<void> _saveToken(String token) async {
    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    final platform = Platform.isIOS ? 'ios' : 'android';
    await supabase.from('fcm_tokens').upsert(
      {
        'token': token,
        'platform': platform,
        'user_id': user?.id,
        'last_active_at': DateTime.now().toIso8601String(),
      },
      onConflict: 'token',
    );
  }
}
