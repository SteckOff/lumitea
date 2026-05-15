import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';

class OrderDetailPage extends ConsumerWidget {
  final String orderId;
  const OrderDetailPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderByIdProvider(orderId));
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final dateFmt = DateFormat('y-MM-dd HH:mm');

    return Scaffold(
      appBar: AppBar(title: const Text('Order details')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (order) {
          if (order == null) return const Center(child: Text('Order not found'));
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // ─── Header ────────────────────────────────────────────────
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              order.orderNo,
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
                            ),
                          ),
                          _StatusChip(order.status),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dateFmt.format(order.createdAt.toLocal()),
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                      if (order.userEmail != null) ...[
                        const SizedBox(height: 4),
                        Text(order.userEmail!,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                              fontSize: 13,
                            )),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ─── Items ─────────────────────────────────────────────────
              Text('Items', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              ...order.parsedItems.map((item) => _ItemTile(item: item, krw: krw)),
              const SizedBox(height: 8),
              const Divider(),

              // ─── Price breakdown ───────────────────────────────────────
              _PriceLine('Subtotal', krw.format(order.subtotal)),
              _PriceLine(
                'Shipping',
                order.shipping == 0 ? 'Free' : krw.format(order.shipping),
              ),
              if (order.discount > 0)
                _PriceLine('Discount', '−${krw.format(order.discount)}',
                    color: Colors.green.shade700),
              const Divider(),
              _PriceLine('Total', krw.format(order.total), bold: true),
              const SizedBox(height: 20),

              // ─── Delivery address ──────────────────────────────────────
              Text('Delivery address', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.addressSnapshot['recipient_name'] as String? ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      ),
                      const SizedBox(height: 4),
                      Text(order.addressSnapshot['phone'] as String? ?? ''),
                      const SizedBox(height: 4),
                      Text(
                        '[${order.addressSnapshot['postal_code'] ?? ''}] '
                        '${order.addressSnapshot['address1'] ?? ''}'
                        '${(order.addressSnapshot['address2'] as String?)?.isNotEmpty == true ? ' ${order.addressSnapshot['address2']}' : ''}',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }
}

// ─── Reusable widgets ─────────────────────────────────────────────────────────

class _ItemTile extends StatelessWidget {
  final OrderItem item;
  final NumberFormat krw;
  const _ItemTile({required this.item, required this.krw});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: item.imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: item.imageUrl,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => _placeholder(),
                    errorWidget: (_, __, ___) => _placeholder(),
                  )
                : _placeholder(),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.nameSnapshot,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text('×${item.quantity}',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
              ],
            ),
          ),
          Text(
            krw.format(item.priceAtPurchase * item.quantity),
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _placeholder() => Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: LumiColors.pinkSoft.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.local_cafe_outlined, color: LumiColors.pink, size: 24),
      );
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip(this.status);

  @override
  Widget build(BuildContext context) {
    final Map<String, (Color, Color)> palette = {
      'pending':   (Colors.orange.shade100, Colors.orange.shade800),
      'paid':      (Colors.green.shade100,  Colors.green.shade800),
      'shipped':   (Colors.blue.shade100,   Colors.blue.shade800),
      'delivered': (Colors.grey.shade200,   Colors.grey.shade700),
      'cancelled': (Colors.red.shade100,    Colors.red.shade800),
      'refunded':  (Colors.purple.shade100, Colors.purple.shade800),
    };
    final (bg, fg) = palette[status] ?? (Colors.grey.shade200, Colors.grey.shade700);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Text(status,
          style: TextStyle(color: fg, fontWeight: FontWeight.w600, fontSize: 12)),
    );
  }
}

class _PriceLine extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? color;
  const _PriceLine(this.label, this.value, {this.bold = false, this.color});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: TextStyle(
                    fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                    fontSize: bold ? 17 : 14)),
            Text(value,
                style: TextStyle(
                    fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                    fontSize: bold ? 17 : 14,
                    color: color)),
          ],
        ),
      );
}
