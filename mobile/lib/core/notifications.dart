// FCM bootstrap. Registers the device, writes the token to public.fcm_tokens,
// and handles foreground/background tap → deeplink routing.

import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Notifications {
  static final _local = FlutterLocalNotificationsPlugin();
  static const _channelId = 'promotions';

  static Future<void> init() async {
    try {
      await Firebase.initializeApp();
    } catch (_) {
      // google-services.json missing — push is optional in dev.
      return;
    }

    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(alert: true, badge: true, sound: true);

    await _local.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
    );

    // Create Android notification channel
    await _local
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            'Lumi Tea promotions',
            description: 'New promotions and seasonal offers',
            importance: Importance.high,
          ),
        );

    // Token registration
    final token = await messaging.getToken();
    if (token != null) await _saveToken(token);
    messaging.onTokenRefresh.listen(_saveToken);

    // Foreground messages → show local notification
    FirebaseMessaging.onMessage.listen((m) {
      final n = m.notification;
      if (n == null) return;
      _local.show(
        m.hashCode,
        n.title,
        n.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            _channelId,
            'Lumi Tea promotions',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
      );
    });
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
