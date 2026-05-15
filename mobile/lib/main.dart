import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config.dart';
import 'core/router.dart';
import 'core/theme.dart';
import 'core/notifications.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );

  Stripe.publishableKey = AppConfig.stripePublishableKey;
  Stripe.merchantIdentifier = 'merchant.kr.lumitea';
  await Stripe.instance.applySettings();

  // Notifications.init() needs the router for deeplink navigation.
  // We initialise it lazily inside LumiTeaApp after the router is available.

  runApp(const ProviderScope(child: LumiTeaApp()));
}

class LumiTeaApp extends ConsumerStatefulWidget {
  const LumiTeaApp({super.key});

  @override
  ConsumerState<LumiTeaApp> createState() => _LumiTeaAppState();
}

class _LumiTeaAppState extends ConsumerState<LumiTeaApp> {
  bool _notificationsInited = false;

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    // Init push notifications once the router is ready.
    if (!_notificationsInited) {
      _notificationsInited = true;
      Notifications.init(router: router);
    }

    return MaterialApp.router(
      title: 'Lumi Tea',
      debugShowCheckedModeBanner: false,
      theme: LumiTheme.light,
      darkTheme: LumiTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      locale: const Locale('en'),
      supportedLocales: const [
        Locale('en'),
        Locale('ko'),
        Locale('ru'),
      ],
    );
  }
}

