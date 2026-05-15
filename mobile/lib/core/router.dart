import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/admin/admin_page.dart';
import '../features/auth/login_page.dart';
import '../features/auth/register_page.dart';
import '../features/auth/verify_email_page.dart';
import '../features/catalog/catalog_shell.dart';
import '../features/catalog/gift_sets_page.dart';
import '../features/catalog/product_detail_page.dart';
import '../features/cart/cart_page.dart';
import '../features/checkout/checkout_page.dart';
import '../features/orders/order_detail_page.dart';
import '../features/orders/orders_page.dart';
import '../features/profile/profile_page.dart';
import '../features/promotions/promotions_page.dart';
import 'providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(ref),
    redirect: (context, state) {
      final loggedIn = auth.isAuthenticated;
      final goingToAuth = state.matchedLocation.startsWith('/auth');
      final needsAuth = state.matchedLocation == '/checkout' ||
          state.matchedLocation == '/orders' ||
          state.matchedLocation.startsWith('/orders/') ||
          state.matchedLocation == '/admin';

      if (!loggedIn && needsAuth) return '/auth/login';
      if (loggedIn && goingToAuth) return '/';
      // Non-admin trying to reach admin page
      if (state.matchedLocation == '/admin' && loggedIn && !auth.isAdmin) return '/';
      return null;
    },
    routes: [
      // ── Bottom-nav shell ────────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => CatalogShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'catalog',
            builder: (_, __) => const CatalogShellHome(),
          ),
          GoRoute(
            path: '/promotions',
            name: 'promotions',
            builder: (_, __) => const PromotionsPage(),
          ),
          GoRoute(
            path: '/cart',
            name: 'cart',
            builder: (_, __) => const CartPage(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (_, __) => const ProfilePage(),
          ),
        ],
      ),

      // ── Catalog extras ──────────────────────────────────────────────────
      GoRoute(
        path: '/product/:id',
        name: 'product',
        builder: (_, s) =>
            ProductDetailPage(productId: int.parse(s.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/gift-sets',
        name: 'giftSets',
        builder: (_, __) => const GiftSetsPage(),
      ),

      // ── Orders ─────────────────────────────────────────────────────────
      GoRoute(
        path: '/orders',
        name: 'orders',
        builder: (_, __) => const OrdersPage(),
      ),
      GoRoute(
        path: '/orders/:id',
        name: 'orderDetail',
        builder: (_, s) => OrderDetailPage(orderId: s.pathParameters['id']!),
      ),

      // ── Checkout ────────────────────────────────────────────────────────
      GoRoute(
        path: '/checkout',
        name: 'checkout',
        builder: (_, __) => const CheckoutPage(),
      ),

      // ── Admin ───────────────────────────────────────────────────────────
      GoRoute(
        path: '/admin',
        name: 'admin',
        builder: (_, __) => const AdminPage(),
      ),

      // ── Auth ────────────────────────────────────────────────────────────
      GoRoute(path: '/auth/login',    builder: (_, __) => const LoginPage()),
      GoRoute(path: '/auth/register', builder: (_, __) => const RegisterPage()),
      GoRoute(
        path: '/auth/verify',
        builder: (_, s) =>
            VerifyEmailPage(email: s.uri.queryParameters['email'] ?? ''),
      ),
    ],
  );
});

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Ref ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}
