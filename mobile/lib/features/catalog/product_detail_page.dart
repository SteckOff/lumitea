import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final int productId;
  const ProductDetailPage({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  int _qty = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productByIdProvider(widget.productId));
    final locale = ref.watch(localeProvider);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);

    return productAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(appBar: AppBar(), body: Center(child: Text('$e'))),
      data: (p) {
        if (p == null) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Not found')));
        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: CachedNetworkImage(
                    imageUrl: p.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(color: LumiColors.pinkSoft),
                    errorWidget: (_, __, ___) => Container(color: LumiColors.pinkSoft),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p.localizedName(locale), style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 4),
                      Text(p.weight, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 6, runSpacing: 6,
                        children: p.localizedTags(locale).map((t) => Chip(label: Text(t))).toList(),
                      ),
                      const SizedBox(height: 20),
                      Text(krw.format(p.price),
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: LumiColors.pink)),
                      const SizedBox(height: 20),
                      Text(p.localizedDescription(locale), style: const TextStyle(height: 1.5)),
                      const SizedBox(height: 24),
                      if (p.outOfStock)
                        const Text('Out of stock', style: TextStyle(color: Colors.red))
                      else
                        Row(
                          children: [
                            const Text('Quantity: '),
                            IconButton(onPressed: () => setState(() => _qty = (_qty - 1).clamp(1, p.stock)), icon: const Icon(Icons.remove_circle_outline)),
                            Text('$_qty', style: const TextStyle(fontSize: 18)),
                            IconButton(onPressed: () => setState(() => _qty = (_qty + 1).clamp(1, p.stock)), icon: const Icon(Icons.add_circle_outline)),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: FilledButton.icon(
                onPressed: p.outOfStock ? null : () {
                  ref.read(cartProvider.notifier).add(CartItem(
                    type: CartItemType.product,
                    itemId: p.id,
                    name: p.name,
                    price: p.price,
                    imageUrl: p.imageUrl,
                    quantity: _qty,
                  ));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to bag')));
                },
                icon: const Icon(Icons.shopping_bag_outlined),
                label: Text(p.outOfStock ? 'Out of stock' : 'Add to bag — ${krw.format(p.price * _qty)}'),
              ),
            ),
          ),
        );
      },
    );
  }
}
