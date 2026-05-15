import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart' as models;
import '../../core/providers.dart';
import 'widgets/korean_address_form.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _postal = TextEditingController();
  final _address1 = TextEditingController();
  final _address2 = TextEditingController();
  bool _loading = false;
  String? _error;
  // Whether the user has picked an address via DaumPostcode
  bool _addressPicked = false;

  @override
  void dispose() {
    _name.dispose(); _phone.dispose(); _postal.dispose(); _address1.dispose(); _address2.dispose();
    super.dispose();
  }

  Future<void> _pickAddress() async {
    final result = await showModalBottomSheet<KoreanAddress>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const KoreanAddressSheet(),
    );
    if (result != null && mounted) {
      setState(() {
        _postal.text = result.postalCode;
        _address1.text = result.address1;
        _addressPicked = true;
        _address2.clear();
      });
      // Focus the apt/unit field after picking
      FocusScope.of(context).nextFocus();
    }
  }

  Future<void> _pay() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    final cart = ref.read(cartProvider);
    if (cart.isEmpty) {
      setState(() { _loading = false; _error = 'Cart is empty'; });
      return;
    }

    final supabase = ref.read(supabaseProvider);

    final address = models.Address(
      recipientName: _name.text.trim(),
      phone: _phone.text.trim(),
      postalCode: _postal.text.trim(),
      address1: _address1.text.trim(),
      address2: _address2.text.trim().isEmpty ? null : _address2.text.trim(),
    );

    try {
      // 1. Create order + PaymentIntent on the server.
      final res = await supabase.functions.invoke(
        'create-payment-intent',
        body: {
          'items': cart.map((c) => c.toEdgeFunctionItem()).toList(),
          'address': address.toJson(),
        },
      );
      final data = (res.data as Map).cast<String, dynamic>();
      if (data['error'] != null) throw Exception(data['error']);

      final clientSecret = data['client_secret'] as String;
      final orderNo = data['order_no'] as String;

      // 2. Present Stripe payment sheet.
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Lumi Tea',
          style: ThemeMode.system,
        ),
      );
      await Stripe.instance.presentPaymentSheet();

      // 3. Stripe webhook will mark the order paid on the backend.
      if (!mounted) return;
      ref.read(cartProvider.notifier).clear();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Order $orderNo placed!')));
      context.go('/orders');
    } on StripeException catch (e) {
      setState(() => _error = e.error.localizedMessage ?? 'Payment cancelled');
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final controller = ref.read(cartProvider.notifier);
    final krw = NumberFormat.currency(locale: 'ko_KR', symbol: '₩', decimalDigits: 0);
    final subtotal = controller.subtotal;
    final shipping = subtotal >= 50000 ? 0 : 3000;
    final total = subtotal + shipping;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Shipping address', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 16),
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Recipient name'),
                validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                decoration: const InputDecoration(labelText: 'Phone', hintText: '010-1234-5678'),
                keyboardType: TextInputType.phone,
                validator: (v) => (v == null || v.length < 8) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              // Korean address picker — opens Daum Postcode in a bottom sheet
              FormField<bool>(
                validator: (_) => _addressPicked ? null : '주소를 검색해 주세요',
                builder: (field) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _pickAddress,
                      icon: const Icon(Icons.search),
                      label: Text(_addressPicked ? '주소 변경' : '주소 검색 (우편번호)'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                      ),
                    ),
                    if (_addressPicked) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.secondaryContainer,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              _postal.text,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Theme.of(context).colorScheme.onSecondaryContainer,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_address1.text)),
                        ],
                      ),
                    ],
                    if (field.hasError)
                      Padding(
                        padding: const EdgeInsets.only(top: 6, left: 12),
                        child: Text(
                          field.errorText!,
                          style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _address2,
                decoration: const InputDecoration(
                  labelText: '상세 주소 (동/호수)',
                  hintText: '예: 101동 1204호',
                ),
              ),
              const SizedBox(height: 24),
              Text('Order summary', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 12),
              for (final i in cart) ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(i.name),
                subtitle: Text('×${i.quantity}'),
                trailing: Text(krw.format(i.price * i.quantity)),
              ),
              const Divider(),
              _line('Subtotal', krw.format(subtotal)),
              _line('Shipping', shipping == 0 ? 'Free' : krw.format(shipping)),
              _line('Total', krw.format(total), bold: true),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _loading ? null : _pay,
                icon: const Icon(Icons.lock_outline),
                label: Text(_loading ? 'Processing...' : 'Pay ${krw.format(total)}'),
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
