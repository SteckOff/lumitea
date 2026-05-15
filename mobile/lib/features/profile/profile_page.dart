import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profile')),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_outline, size: 64),
                const SizedBox(height: 12),
                const Text('Sign in to access your orders and saved addresses'),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => context.push('/auth/login'),
                  child: const Text('Sign in'),
                ),
                TextButton(
                  onPressed: () => context.push('/auth/register'),
                  child: const Text('Create account'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final email = auth.user!.email ?? '';
    final name = (auth.profile?['name'] as String?) ?? auth.user!.userMetadata?['name'] as String? ?? '';
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SafeArea(
        child: ListView(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  CircleAvatar(radius: 28, child: Text((name.isNotEmpty ? name[0] : email[0]).toUpperCase())),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name.isEmpty ? email : name,
                          style: Theme.of(context).textTheme.headlineMedium),
                      Text(email, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.receipt_long_outlined),
              title: const Text('My orders'),
              onTap: () => context.push('/orders'),
            ),
            ListTile(
              leading: const Icon(Icons.local_offer_outlined),
              title: const Text('Promotions'),
              onTap: () => context.push('/promotions'),
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('Language'),
              trailing: Text(locale.toUpperCase()),
              onTap: () {
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
              },
            ),
            if (auth.isAdmin)
              ListTile(
                leading: const Icon(Icons.admin_panel_settings_outlined, color: Colors.deepPurple),
                title: const Text('Admin'),
                subtitle: const Text('Manage products, orders, promotions'),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Admin screens coming in next iteration')),
                  );
                },
              ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Sign out'),
              onTap: () async {
                await ref.read(authProvider.notifier).signOut();
                if (context.mounted) context.go('/');
              },
            ),
          ],
        ),
      ),
    );
  }
}
