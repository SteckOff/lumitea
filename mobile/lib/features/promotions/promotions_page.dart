import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme.dart';

class PromotionsPage extends ConsumerWidget {
  const PromotionsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final promosAsync = ref.watch(promotionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Promotions')),
      body: promosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (promos) {
          if (promos.isEmpty) {
            return const Center(child: Text('No active promotions'));
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(promotionsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: promos.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final p = promos[i];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (p.imageUrl != null)
                        AspectRatio(
                          aspectRatio: 16 / 9,
                          child: CachedNetworkImage(
                            imageUrl: p.imageUrl!,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(color: LumiColors.pinkSoft.withValues(alpha: 0.3)),
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (p.discountPct != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: LumiColors.pink,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text('-${p.discountPct}%',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                              ),
                            const SizedBox(height: 8),
                            Text(p.title, style: Theme.of(context).textTheme.headlineMedium),
                            const SizedBox(height: 8),
                            Text(p.body),
                          ],
                        ),
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
