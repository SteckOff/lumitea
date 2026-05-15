import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final dateFmt = DateFormat('y-MM-dd HH:mm');

    return Scaffold(
      appBar: AppBar(title: const Text('My orders')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (orders) {
          if (orders.isEmpty) return const Center(child: Text('No orders yet'));
          return RefreshIndicator(
            onRefresh: () => ref.refresh(myOrdersProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (_, i) {
                final o = orders[i];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(o.orderNo, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${dateFmt.format(o.createdAt.toLocal())} · ${o.items.length} item(s)'),
                  trailing: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(krw.format(o.total), style: const TextStyle(fontWeight: FontWeight.w700)),
                      Chip(
                        label: Text(o.status, style: const TextStyle(fontSize: 10)),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
