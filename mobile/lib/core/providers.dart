// Riverpod providers — single file for the MVP to keep things compact.
// Split into per-feature files once they grow.

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'models.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) => Supabase.instance.client);

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------
class AuthState {
  final User? user;
  final Map<String, dynamic>? profile;
  final bool loading;
  const AuthState({this.user, this.profile, this.loading = false});

  bool get isAuthenticated => user != null;
  bool get isAdmin => profile?['is_admin'] == true;
}

class AuthController extends Notifier<AuthState> {
  late final SupabaseClient _supabase;

  @override
  AuthState build() {
    _supabase = ref.read(supabaseProvider);
    final session = _supabase.auth.currentSession;
    _supabase.auth.onAuthStateChange.listen((event) async {
      final u = event.session?.user;
      final p = u != null ? await _fetchProfile(u.id) : null;
      state = AuthState(user: u, profile: p);
    });
    if (session?.user != null) {
      _fetchProfile(session!.user.id).then((p) {
        state = AuthState(user: session.user, profile: p);
      });
    }
    return AuthState(user: session?.user);
  }

  Future<Map<String, dynamic>?> _fetchProfile(String userId) async {
    final r = await _supabase.from('profiles').select().eq('id', userId).maybeSingle();
    return r;
  }

  Future<String?> signIn(String email, String password) async {
    try {
      await _supabase.auth.signInWithPassword(email: email, password: password);
      return null;
    } on AuthException catch (e) {
      return e.message;
    }
  }

  Future<String?> signUp({
    required String email,
    required String password,
    required String name,
    required String phone,
  }) async {
    try {
      await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'name': name, 'phone': phone},
      );
      return null;
    } on AuthException catch (e) {
      return e.message;
    }
  }

  Future<bool> verifyEmail(String email, String code) async {
    try {
      await _supabase.auth.verifyOTP(email: email, token: code, type: OtpType.email);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> resendCode(String email) async {
    try {
      await _supabase.auth.resend(type: OtpType.signup, email: email);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email,
          redirectTo: 'kr.lumitea://reset-password');
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> signOut() async => _supabase.auth.signOut();
}

final authProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);

// -----------------------------------------------------------------------------
// Catalog
// -----------------------------------------------------------------------------
final productsProvider = FutureProvider.autoDispose<List<Product>>((ref) async {
  final s = ref.read(supabaseProvider);
  final data = await s
      .from('products')
      .select()
      .eq('is_active', true)
      .order('bestseller', ascending: false)
      .order('id');
  return (data as List).map((j) => Product.fromJson(j as Map<String, dynamic>)).toList();
});

final giftSetsProvider = FutureProvider.autoDispose<List<GiftSet>>((ref) async {
  final s = ref.read(supabaseProvider);
  final data = await s
      .from('gift_sets')
      .select()
      .eq('is_active', true)
      .order('bestseller', ascending: false)
      .order('id');
  return (data as List).map((j) => GiftSet.fromJson(j as Map<String, dynamic>)).toList();
});

final productByIdProvider = FutureProvider.autoDispose.family<Product?, int>((ref, id) async {
  final s = ref.read(supabaseProvider);
  final data = await s.from('products').select().eq('id', id).maybeSingle();
  return data == null ? null : Product.fromJson(data);
});

// -----------------------------------------------------------------------------
// Cart (local + auto-persist)
// -----------------------------------------------------------------------------
class CartController extends Notifier<List<CartItem>> {
  static const _prefsKey = 'lumi_cart_v1';

  @override
  List<CartItem> build() {
    _restore();
    return const [];
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null) return;
    try {
      final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      state = list
          .map((j) => CartItem(
                type: j['type'] == 'product' ? CartItemType.product : CartItemType.giftSet,
                itemId: j['item_id'] as int,
                name: j['name'] as String,
                price: j['price'] as int,
                imageUrl: j['image_url'] as String,
                quantity: j['quantity'] as int,
              ))
          .toList();
    } catch (e) {
      if (kDebugMode) print('cart restore failed: $e');
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _prefsKey,
      jsonEncode(state
          .map((c) => {
                'type': c.type.name,
                'item_id': c.itemId,
                'name': c.name,
                'price': c.price,
                'image_url': c.imageUrl,
                'quantity': c.quantity,
              })
          .toList()),
    );
  }

  void add(CartItem item) {
    final idx = state.indexWhere((c) => c.key == item.key);
    if (idx == -1) {
      state = [...state, item];
    } else {
      state = [
        for (final c in state)
          c.key == item.key ? c.copyWith(quantity: c.quantity + item.quantity) : c,
      ];
    }
    _persist();
  }

  void updateQty(String key, int qty) {
    state = [
      for (final c in state)
        if (c.key == key) c.copyWith(quantity: qty) else c,
    ].where((c) => c.quantity > 0).toList();
    _persist();
  }

  void remove(String key) {
    state = state.where((c) => c.key != key).toList();
    _persist();
  }

  void clear() {
    state = const [];
    _persist();
  }

  int get subtotal => state.fold(0, (s, c) => s + c.price * c.quantity);
}

final cartProvider = NotifierProvider<CartController, List<CartItem>>(CartController.new);

// -----------------------------------------------------------------------------
// Orders (mine)
// -----------------------------------------------------------------------------
final myOrdersProvider = FutureProvider.autoDispose<List<Order>>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return [];
  final s = ref.read(supabaseProvider);
  final data = await s
      .from('orders')
      .select()
      .eq('user_id', auth.user!.id)
      .order('created_at', ascending: false);
  return (data as List).map((j) => Order.fromJson(j as Map<String, dynamic>)).toList();
});

// -----------------------------------------------------------------------------
// Orders — single order by id
// -----------------------------------------------------------------------------
final orderByIdProvider = FutureProvider.autoDispose.family<Order?, String>((ref, id) async {
  final s = ref.read(supabaseProvider);
  final data = await s.from('orders').select().eq('id', id).maybeSingle();
  return data == null ? null : Order.fromJson(data as Map<String, dynamic>);
});

// All orders — admin only
final allOrdersProvider = FutureProvider.autoDispose<List<Order>>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAdmin) return [];
  final s = ref.read(supabaseProvider);
  final data = await s
      .from('orders')
      .select()
      .order('created_at', ascending: false)
      .limit(200);
  return (data as List).map((j) => Order.fromJson(j as Map<String, dynamic>)).toList();
});

// -----------------------------------------------------------------------------
// Promotions (live feed)
// -----------------------------------------------------------------------------
final promotionsProvider = FutureProvider.autoDispose<List<Promotion>>((ref) async {
  final s = ref.read(supabaseProvider);
  final data = await s
      .from('promotions')
      .select()
      .eq('is_active', true)
      .order('starts_at', ascending: false);
  return (data as List).map((j) => Promotion.fromJson(j as Map<String, dynamic>)).toList();
});

// -----------------------------------------------------------------------------
// Locale (simple — UI-only, no full intl yet)
// -----------------------------------------------------------------------------
final localeProvider = NotifierProvider<LocaleController, String>(LocaleController.new);

class LocaleController extends Notifier<String> {
  @override
  String build() => 'en';
  void set(String locale) => state = locale;
}
