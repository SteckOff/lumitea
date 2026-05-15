// Admin-only page. Only reachable when AuthState.isAdmin == true.
// Shows: all orders with status controls, and a push-promotion button per promotion.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';

class AdminPage extends ConsumerStatefulWidget {
  const AdminPage({super.key});

  @override
  ConsumerState<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends ConsumerState<AdminPage>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    if (!auth.isAdmin) {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: const Center(child: Text('Access denied')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          const Icon(Icons.admin_panel_settings_outlined, color: Colors.deepPurple, size: 22),
          const SizedBox(width: 8),
          const Text('Admin'),
        ]),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(icon: Icon(Icons.receipt_long_outlined), text: 'Orders'),
            Tab(icon: Icon(Icons.local_offer_outlined), text: 'Promotions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _OrdersTab(),
          _PromotionsTab(),
        ],
      ),
    );
  }
}

// ─── Orders tab ──────────────────────────────────────────────────────────────

class _OrdersTab extends ConsumerWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(allOrdersProvider);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final dateFmt = DateFormat('MM-dd HH:mm');

    return ordersAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (orders) {
        if (orders.isEmpty) {
          return const Center(child: Text('No orders yet'));
        }
        return RefreshIndicator(
          onRefresh: () => ref.refresh(allOrdersProvider.future),
          child: ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _OrderCard(
              order: orders[i],
              krw: krw,
              dateFmt: dateFmt,
              onRefresh: () => ref.invalidate(allOrdersProvider),
            ),
          ),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final NumberFormat krw;
  final DateFormat dateFmt;
  final VoidCallback onRefresh;
  const _OrderCard({
    required this.order,
    required this.krw,
    required this.dateFmt,
    required this.onRefresh,
  });

  Future<void> _updateStatus(BuildContext context, String status) async {
    await Supabase.instance.client
        .from('orders')
        .update({'status': status})
        .eq('order_no', order.orderNo);
    onRefresh();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${order.orderNo} → $status')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final Map<String, (Color, Color)> palette = {
      'pending':   (Colors.orange.shade50,  Colors.orange.shade800),
      'paid':      (Colors.green.shade50,   Colors.green.shade800),
      'shipped':   (Colors.blue.shade50,    Colors.blue.shade800),
      'delivered': (Colors.grey.shade100,   Colors.grey.shade700),
      'cancelled': (Colors.red.shade50,     Colors.red.shade800),
      'refunded':  (Colors.purple.shade50,  Colors.purple.shade800),
    };
    final (bg, fg) = palette[order.status] ?? (Colors.grey.shade100, Colors.grey.shade700);

    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                Expanded(
                  child: Text(order.orderNo,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration:
                      BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
                  child: Text(order.status,
                      style: TextStyle(
                          color: fg, fontWeight: FontWeight.w600, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${dateFmt.format(order.createdAt.toLocal())}  ·  '
              '${order.parsedItems.length} item(s)  ·  ${krw.format(order.total)}',
              style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
            ),
            if (order.userEmail != null) ...[
              const SizedBox(height: 2),
              Text(order.userEmail!,
                  style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withValues(alpha: 0.5))),
            ],
            const SizedBox(height: 10),
            // Action buttons
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _ActionChip(
                  label: 'Details',
                  icon: Icons.open_in_new,
                  onTap: () => context.push('/orders/${order.id}'),
                ),
                if (order.status == 'paid')
                  _ActionChip(
                    label: 'Mark shipped',
                    icon: Icons.local_shipping_outlined,
                    color: Colors.blue,
                    onTap: () => _updateStatus(context, 'shipped'),
                  ),
                if (order.status == 'shipped')
                  _ActionChip(
                    label: 'Mark delivered',
                    icon: Icons.check_circle_outline,
                    color: Colors.green,
                    onTap: () => _updateStatus(context, 'delivered'),
                  ),
                if (order.status == 'pending')
                  _ActionChip(
                    label: 'Cancel',
                    icon: Icons.cancel_outlined,
                    color: Colors.red,
                    onTap: () => _updateStatus(context, 'cancelled'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _ActionChip({
    required this.label,
    required this.icon,
    this.color = LumiColors.pink,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => ActionChip(
        avatar: Icon(icon, size: 14, color: color),
        label: Text(label, style: TextStyle(color: color, fontSize: 12)),
        side: BorderSide(color: color.withValues(alpha: 0.4)),
        backgroundColor: color.withValues(alpha: 0.06),
        visualDensity: VisualDensity.compact,
        onPressed: onTap,
      );
}

// ─── Promotions tab ───────────────────────────────────────────────────────────

class _PromotionsTab extends ConsumerWidget {
  const _PromotionsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final promosAsync = ref.watch(promotionsProvider);

    return promosAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (promos) {
        if (promos.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('No active promotions'),
                const SizedBox(height: 16),
                const Text('Create promotions in the web admin panel',
                    style: TextStyle(fontSize: 13), textAlign: TextAlign.center),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () => ref.refresh(promotionsProvider.future),
          child: ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: promos.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _PromoCard(promo: promos[i]),
          ),
        );
      },
    );
  }
}

class _PromoCard extends ConsumerStatefulWidget {
  final Promotion promo;
  const _PromoCard({required this.promo});

  @override
  ConsumerState<_PromoCard> createState() => _PromoCardState();
}

class _PromoCardState extends ConsumerState<_PromoCard> {
  bool _sending = false;

  Future<void> _sendPush() async {
    setState(() => _sending = true);
    try {
      final res = await Supabase.instance.client.functions.invoke(
        'send-promotion-push',
        body: {'promotion_id': widget.promo.id},
      );
      final data = (res.data as Map?)?.cast<String, dynamic>() ?? {};
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(data['message'] as String? ?? 'Push sent!'),
      ));
      ref.invalidate(promotionsProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(widget.promo.title,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
                if (widget.promo.discountPct != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                        color: LumiColors.pink, borderRadius: BorderRadius.circular(12)),
                    child: Text('−${widget.promo.discountPct}%',
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(widget.promo.body,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7))),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sending ? null : _sendPush,
              icon: _sending
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.notifications_active_outlined, size: 18),
              label: Text(_sending ? 'Sending…' : 'Send push to all users'),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                minimumSize: const Size(double.infinity, 40),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
