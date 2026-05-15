import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';

class VerifyEmailPage extends ConsumerStatefulWidget {
  final String email;
  const VerifyEmailPage({super.key, required this.email});

  @override
  ConsumerState<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends ConsumerState<VerifyEmailPage> {
  final _code = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _verify() async {
    setState(() { _loading = true; _error = null; });
    final ok = await ref.read(authProvider.notifier).verifyEmail(widget.email, _code.text.trim());
    if (!mounted) return;
    setState(() => _loading = false);
    if (ok) {
      context.go('/');
    } else {
      setState(() => _error = 'Invalid code');
    }
  }

  Future<void> _resend() async {
    final ok = await ref.read(authProvider.notifier).resendCode(widget.email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ok ? 'Code resent' : 'Failed to resend')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Verify your email', style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text('Enter the 6-digit code sent to ${widget.email}',
                  style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
              const SizedBox(height: 24),
              TextField(
                controller: _code,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 26, letterSpacing: 8, fontWeight: FontWeight.w600),
                decoration: const InputDecoration(hintText: '000000'),
              ),
              if (_error != null) ...[const SizedBox(height: 8), Text(_error!, style: const TextStyle(color: Colors.red))],
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _loading ? null : _verify,
                child: _loading
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Verify'),
              ),
              TextButton(onPressed: _resend, child: const Text('Resend code')),
            ],
          ),
        ),
      ),
    );
  }
}
