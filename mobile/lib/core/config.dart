// Build-time configuration injected via --dart-define on the flutter build/run command.
// Example:
//   flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co \
//               --dart-define=SUPABASE_ANON_KEY=eyJ... \
//               --dart-define=STRIPE_PK=pk_test_...

class AppConfig {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const stripePublishableKey = String.fromEnvironment('STRIPE_PK');
  static const productImagesBucket = 'product-images';

  static void assertConfigured() {
    assert(supabaseUrl.isNotEmpty, 'SUPABASE_URL not set (use --dart-define)');
    assert(supabaseAnonKey.isNotEmpty, 'SUPABASE_ANON_KEY not set');
  }
}
