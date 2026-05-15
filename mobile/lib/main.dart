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

  await Notifications.init();

  runApp(const ProviderScope(child: LumiTeaApp()));
}

class LumiTeaApp extends ConsumerWidget {
  const LumiTeaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
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
