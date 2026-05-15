import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';

class GiftSetsPage extends ConsumerWidget {
  const GiftSetsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final setsAsync = ref.watch(giftSetsProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Gift Sets')),
      body: setsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (sets) {
          if (sets.isEmpty) {
            return const Center(child: Text('No gift sets available'));
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(giftSetsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: sets.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (_, i) => _GiftSetCard(set: sets[i], locale: locale),
            ),
          );
        },
      ),
    );
  }
}

class _GiftSetCard extends ConsumerWidget {
  final GiftSet set;
  final String locale;
  const _GiftSetCard({required this.set, required this.locale});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final cart = ref.read(cartProvider.notifier);

    final name = locale == 'ko'
        ? set.nameKo.isNotEmpty ? set.nameKo : set.name
        : locale == 'ru'
            ? set.nameRu.isNotEmpty ? set.nameRu : set.name
            : set.name;

    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Image
          AspectRatio(
            aspectRatio: 16 / 9,
            child: set.imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: set.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (_, __) =>
                        Container(color: LumiColors.pinkSoft.withValues(alpha: 0.3)),
                    errorWidget: (_, __, ___) =>
                        Container(color: LumiColors.pinkSoft.withValues(alpha: 0.3),
                            child: const Icon(Icons.card_giftcard, size: 48, color: LumiColors.pink)),
                  )
                : Container(
                    color: LumiColors.pinkSoft.withValues(alpha: 0.3),
                    child: const Icon(Icons.card_giftcard, size: 48, color: LumiColors.pink),
                  ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badges
                Row(
                  children: [
                    if (set.bestseller)
                      _Badge('Bestseller', LumiColors.pink),
                    if (set.originalPrice != null) ...[
                      if (set.bestseller) const SizedBox(width: 6),
                      _Badge(
                        '−${((1 - set.price / set.originalPrice!) * 100).round()}%',
                        Colors.green.shade700,
                      ),
                    ],
                  ],
                ),
                if (set.bestseller || set.originalPrice != null)
                  const SizedBox(height: 8),

                // Name
                Text(name, style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 6),

                // Includes
                if (set.includes.isNotEmpty) ...[
                  Text(
                    set.includes.map((e) => '• $e').join('\n'),
                    style: TextStyle(
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Price row + Add to cart
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          krw.format(set.price),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 20,
                            color: LumiColors.pink,
                          ),
                        ),
                        if (set.originalPrice != null)
                          Text(
                            krw.format(set.originalPrice),
                            style: TextStyle(
                              decoration: TextDecoration.lineThrough,
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurface
                                  .withValues(alpha: 0.45),
                              fontSize: 13,
                            ),
                          ),
                      ],
                    ),
                    const Spacer(),
                    if (set.outOfStock)
                      const Chip(label: Text('Sold out'))
                    else
                      FilledButton.icon(
                        onPressed: () {
                          cart.add(CartItem(
                            type: CartItemType.giftSet,
                            itemId: set.id,
                            name: name,
                            price: set.price,
                            imageUrl: set.imageUrl,
                            quantity: 1,
                          ));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('$name added to bag'),
                              action: SnackBarAction(
                                label: 'View bag',
                                onPressed: () => context.go('/cart'),
                              ),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                        label: const Text('Add to bag'),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  const _Badge(this.text, this.color);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(text,
            style: const TextStyle(
                color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
      );
}
