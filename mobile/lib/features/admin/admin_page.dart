// Admin page — Orders, Products, Gift Sets, Promotions.
// Same code runs on iOS, Android, macOS, Windows, Linux (Flutter Desktop).

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';
import 'item_edit_sheet.dart';

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
    _tabs = TabController(length: 4, vsync: this);
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
        title: Row(
          children: const [
            Icon(Icons.admin_panel_settings_outlined,
                color: Colors.deepPurple, size: 22),
            SizedBox(width: 8),
            Text('Admin'),
          ],
        ),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.receipt_long_outlined), text: 'Orders'),
            Tab(icon: Icon(Icons.local_florist_outlined), text: 'Products'),
            Tab(icon: Icon(Icons.card_giftcard_outlined), text: 'Gift Sets'),
            Tab(icon: Icon(Icons.local_offer_outlined), text: 'Promotions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _OrdersTab(),
          _ProductsTab(),
          _GiftSetsTab(),
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

  Future<void> _updateStatus(
    BuildContext context,
    String status, {
    String? tracking,
    String? carrier,
    String? note,
  }) async {
    try {
      final res = await Supabase.instance.client.functions.invoke(
        'send-order-status-update',
        body: {
          'order_id': order.id,
          'status': status,
          if (tracking != null && tracking.isNotEmpty) 'tracking_code': tracking,
          if (carrier != null && carrier.isNotEmpty) 'carrier': carrier,
          if (note != null && note.isNotEmpty) 'note': note,
        },
      );
      final ok = (res.data as Map?)?['ok'] == true;
      final emailed = (res.data as Map?)?['emailed'] == true;
      onRefresh();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              ok
                  ? '${order.orderNo} → $status${emailed ? ' (email sent)' : ''}'
                  : 'Update failed',
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _promptShipped(BuildContext context) async {
    final trackingCtrl = TextEditingController();
    final carrierCtrl = TextEditingController(text: 'CJ대한통운');
    final result = await showDialog<Map<String, String>?>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Mark as shipped'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: trackingCtrl,
              decoration: const InputDecoration(
                labelText: 'Tracking code',
                hintText: '123456789012',
                border: OutlineInputBorder(),
              ),
              autofocus: true,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: carrierCtrl,
              decoration: const InputDecoration(
                labelText: 'Carrier',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, null), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, {
              'tracking': trackingCtrl.text.trim(),
              'carrier': carrierCtrl.text.trim(),
            }),
            child: const Text('Ship & email customer'),
          ),
        ],
      ),
    );
    if (result == null) return;
    if (!context.mounted) return;
    await _updateStatus(
      context,
      'shipped',
      tracking: result['tracking'],
      carrier: result['carrier'],
    );
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
    final (bg, fg) =
        palette[order.status] ?? (Colors.grey.shade100, Colors.grey.shade700);

    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(order.orderNo,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                      color: bg, borderRadius: BorderRadius.circular(10)),
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
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.6)),
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
                    onTap: () => _promptShipped(context),
                  ),
                if (order.status == 'shipped')
                  _ActionChip(
                    label: 'Mark delivered',
                    icon: Icons.check_circle_outline,
                    color: Colors.green,
                    onTap: () => _updateStatus(context, 'delivered'),
                  ),
                if (order.status == 'pending' || order.status == 'paid')
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

// ─── Products tab ───────────────────────────────────────────────────────────

class _ProductsTab extends ConsumerWidget {
  const _ProductsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(adminProductsProvider);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openSheet(context, ref, null),
        icon: const Icon(Icons.add),
        label: const Text('New product'),
        backgroundColor: LumiColors.pink,
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('No products yet'));
          return RefreshIndicator(
            onRefresh: () => ref.refresh(adminProductsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final p = items[i];
                return _AdminListTile(
                  imageUrl: p.imageUrl,
                  title: p.name,
                  subtitle: '${p.category} · ${p.weight} · stock: ${p.stock}',
                  price: p.price,
                  isActive: !p.outOfStock,
                  onTap: () => _openSheet(context, ref, _productToMap(p)),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Map<String, dynamic> _productToMap(Product p) => {
        'id': p.id,
        'slug': p.slug,
        'name': p.name,
        'name_ko': p.nameKo,
        'name_ru': p.nameRu,
        'category': p.category,
        'description': p.description,
        'description_ko': p.descriptionKo,
        'description_ru': p.descriptionRu,
        'price': p.price,
        'original_price': p.originalPrice,
        'image_url': p.imageUrl,
        'weight': p.weight,
        'stock': p.stock,
        'bestseller': p.bestseller,
        'is_new': p.isNew,
        'is_active': !p.outOfStock,
      };

  void _openSheet(BuildContext context, WidgetRef ref, Map<String, dynamic>? initial) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      builder: (_) => ItemEditSheet(
        kind: ItemKind.product,
        initial: initial,
        onSaved: () {
          ref.invalidate(adminProductsProvider);
          ref.invalidate(productsProvider);
        },
      ),
    );
  }
}

// ─── Gift Sets tab ───────────────────────────────────────────────────────────

class _GiftSetsTab extends ConsumerWidget {
  const _GiftSetsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(adminGiftSetsProvider);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openSheet(context, ref, null),
        icon: const Icon(Icons.add),
        label: const Text('New gift set'),
        backgroundColor: LumiColors.pink,
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('No gift sets yet'));
          return RefreshIndicator(
            onRefresh: () => ref.refresh(adminGiftSetsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final g = items[i];
                return _AdminListTile(
                  imageUrl: g.imageUrl,
                  title: g.name,
                  subtitle: '${g.includes.length} items · stock: ${g.stock}',
                  price: g.price,
                  isActive: !g.outOfStock,
                  onTap: () => _openSheet(context, ref, _toMap(g)),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Map<String, dynamic> _toMap(GiftSet g) => {
        'id': g.id,
        'name': g.name,
        'name_ko': g.nameKo,
        'name_ru': g.nameRu,
        'description': g.description,
        'price': g.price,
        'original_price': g.originalPrice,
        'includes': g.includes,
        'image_url': g.imageUrl,
        'bestseller': g.bestseller,
        'stock': g.stock,
        'is_active': !g.outOfStock,
      };

  void _openSheet(BuildContext context, WidgetRef ref, Map<String, dynamic>? initial) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      builder: (_) => ItemEditSheet(
        kind: ItemKind.giftSet,
        initial: initial,
        onSaved: () {
          ref.invalidate(adminGiftSetsProvider);
          ref.invalidate(giftSetsProvider);
        },
      ),
    );
  }
}

class _AdminListTile extends StatelessWidget {
  final String imageUrl;
  final String title;
  final String subtitle;
  final int price;
  final bool isActive;
  final VoidCallback onTap;
  const _AdminListTile({
    required this.imageUrl,
    required this.title,
    required this.subtitle,
    required this.price,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    return ListTile(
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: imageUrl.isEmpty
            ? Container(width: 48, height: 48, color: Colors.grey.shade200)
            : CachedNetworkImage(
                imageUrl: imageUrl,
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) =>
                    Container(width: 48, height: 48, color: Colors.grey.shade200),
              ),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(title,
                style: TextStyle(
                    fontWeight: FontWeight.w600,
                    decoration: isActive ? null : TextDecoration.lineThrough)),
          ),
          if (!isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('inactive', style: TextStyle(fontSize: 10)),
            ),
        ],
      ),
      subtitle: Text(subtitle),
      trailing: Text(krw.format(price),
          style: const TextStyle(fontWeight: FontWeight.w700)),
      onTap: onTap,
    );
  }
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
              children: const [
                Text('No active promotions'),
                SizedBox(height: 16),
                Text('Create promotions in the web admin panel',
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
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 12)),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(widget.promo.body,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.7))),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sending ? null : _sendPush,
              icon: _sending
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
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
