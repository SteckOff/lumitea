import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final controller = ref.read(cartProvider.notifier);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final auth = ref.watch(authProvider);

    if (cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Your bag')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.shopping_bag_outlined, size: 64, color: LumiColors.pinkSoft),
              const SizedBox(height: 12),
              const Text('Your bag is empty'),
              const SizedBox(height: 8),
              FilledButton(onPressed: () => context.go('/'), child: const Text('Browse tea')),
            ],
          ),
        ),
      );
    }

    final subtotal = controller.subtotal;
    final shipping = subtotal >= 50000 ? 0 : 3000;
    final total = subtotal + shipping;

    return Scaffold(
      appBar: AppBar(title: const Text('Your bag')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: cart.length,
        separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (_, i) {
          final item = cart[i];
          return Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: item.imageUrl,
                  width: 72, height: 72, fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(width: 72, height: 72, color: LumiColors.pinkSoft),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                         style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(krw.format(item.price), style: const TextStyle(color: LumiColors.pink)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () => controller.updateQty(item.key, item.quantity - 1),
                        ),
                        Text('${item.quantity}', style: const TextStyle(fontSize: 16)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () => controller.updateQty(item.key, item.quantity + 1),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.delete_outline),
                          onPressed: () => controller.remove(item.key),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _line('Subtotal', krw.format(subtotal)),
              _line('Shipping', shipping == 0 ? 'Free' : krw.format(shipping)),
              const Divider(),
              _line('Total', krw.format(total), bold: true),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => context.push(auth.isAuthenticated ? '/checkout' : '/auth/login'),
                child: Text(auth.isAuthenticated ? 'Checkout' : 'Sign in to checkout'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _line(String l, String v, {bool bold = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(l, style: TextStyle(fontWeight: bold ? FontWeight.w700 : null, fontSize: bold ? 18 : null)),
            Text(v, style: TextStyle(fontWeight: bold ? FontWeight.w700 : null, fontSize: bold ? 18 : null)),
          ],
        ),
      );
}
