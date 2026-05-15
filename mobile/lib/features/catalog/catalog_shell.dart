import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';

class CatalogShell extends ConsumerWidget {
  final Widget child;
  const CatalogShell({super.key, required this.child});

  static int _indexFor(String loc) {
    if (loc.startsWith('/promotions')) return 1;
    if (loc.startsWith('/cart')) return 2;
    if (loc.startsWith('/profile')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final loc = GoRouterState.of(context).matchedLocation;
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indexFor(loc),
        onDestinationSelected: (i) {
          switch (i) {
            case 0: context.go('/'); break;
            case 1: context.go('/promotions'); break;
            case 2: context.go('/cart'); break;
            case 3: context.go('/profile'); break;
          }
        },
        destinations: [
          const NavigationDestination(icon: Icon(Icons.local_cafe_outlined), selectedIcon: Icon(Icons.local_cafe), label: 'Tea'),
          const NavigationDestination(icon: Icon(Icons.local_offer_outlined), selectedIcon: Icon(Icons.local_offer), label: 'Offers'),
          NavigationDestination(
            icon: Badge(
              label: Text('${cart.length}'),
              isLabelVisible: cart.isNotEmpty,
              child: const Icon(Icons.shopping_bag_outlined),
            ),
            selectedIcon: const Icon(Icons.shopping_bag),
            label: 'Bag',
          ),
          const NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class CatalogShellHome extends ConsumerWidget {
  const CatalogShellHome({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final locale = ref.watch(localeProvider);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: false,
            floating: true,
            title: const Text('Lumi Tea'),
            actions: [
              IconButton(
                icon: const Icon(Icons.language),
                onPressed: () => _pickLocale(context, ref),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _greet(locale),
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _sub(locale),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          products.when(
            loading: () => const SliverToBoxAdapter(
              child: Padding(padding: EdgeInsets.all(48), child: Center(child: CircularProgressIndicator())),
            ),
            error: (e, _) => SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.all(16), child: Text('$e'))),
            data: (items) => SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.68,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, i) => _ProductCard(product: items[i], locale: locale, krw: krw),
                  childCount: items.length,
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }

  String _greet(String l) => l == 'ko' ? '안녕하세요' : l == 'ru' ? 'Здравствуйте' : 'Hello';
  String _sub(String l) => l == 'ko' ? '오늘은 어떤 차로 시작할까요?' : l == 'ru' ? 'С какого чая начнём день?' : 'What tea today?';

  void _pickLocale(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final l in const [('en', 'English'), ('ko', '한국어'), ('ru', 'Русский')])
            ListTile(
              title: Text(l.$2),
              onTap: () { ref.read(localeProvider.notifier).set(l.$1); Navigator.pop(context); },
            ),
        ],
      ),
    );
  }
}

class _ProductCard extends ConsumerWidget {
  final Product product;
  final String locale;
  final NumberFormat krw;
  const _ProductCard({required this.product, required this.locale, required this.krw});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () => context.push('/product/${product.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: CachedNetworkImage(
                      imageUrl: product.imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: LumiColors.pinkSoft.withValues(alpha: 0.3)),
                      errorWidget: (_, __, ___) => Container(color: LumiColors.pinkSoft.withValues(alpha: 0.3)),
                    ),
                  ),
                  if (product.bestseller)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: LumiColors.pink,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('Bestseller',
                          style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.localizedName(locale),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product.weight,
                    style: TextStyle(
                      fontSize: 11,
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    krw.format(product.price),
                    style: const TextStyle(color: LumiColors.pink, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
