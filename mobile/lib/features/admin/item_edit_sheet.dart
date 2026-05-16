// Shared bottom-sheet form for editing/creating Products and GiftSets.

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'image_picker_field.dart';

enum ItemKind { product, giftSet }

class ItemEditSheet extends StatefulWidget {
  final ItemKind kind;
  final Map<String, dynamic>? initial;
  final VoidCallback onSaved;

  const ItemEditSheet({
    super.key,
    required this.kind,
    required this.initial,
    required this.onSaved,
  });

  @override
  State<ItemEditSheet> createState() => _ItemEditSheetState();
}

class _ItemEditSheetState extends State<ItemEditSheet> {
  late final Map<String, TextEditingController> _ctrls;
  late String _imageUrl;
  late String _category;
  late bool _bestseller;
  late bool _isNew;
  late bool _isActive;
  bool _saving = false;

  static const _categories = ['oolong', 'black', 'green', 'white', 'wellness'];

  bool get _isProduct => widget.kind == ItemKind.product;
  bool get _isCreate => widget.initial == null;

  @override
  void initState() {
    super.initState();
    final i = widget.initial ?? const {};
    _ctrls = {
      'slug':           TextEditingController(text: '${i['slug'] ?? ''}'),
      'name':           TextEditingController(text: '${i['name'] ?? ''}'),
      'name_ko':        TextEditingController(text: '${i['name_ko'] ?? ''}'),
      'name_ru':        TextEditingController(text: '${i['name_ru'] ?? ''}'),
      'description':    TextEditingController(text: '${i['description'] ?? ''}'),
      'description_ko': TextEditingController(text: '${i['description_ko'] ?? ''}'),
      'description_ru': TextEditingController(text: '${i['description_ru'] ?? ''}'),
      'price':          TextEditingController(text: '${i['price'] ?? ''}'),
      'original_price': TextEditingController(text: '${i['original_price'] ?? ''}'),
      'weight':         TextEditingController(text: '${i['weight'] ?? '100g'}'),
      'stock':          TextEditingController(text: '${i['stock'] ?? 0}'),
      'includes':       TextEditingController(
        text: (i['includes'] is List)
            ? (i['includes'] as List).join(', ')
            : '',
      ),
    };
    _imageUrl = (i['image_url'] as String?) ?? '';
    _category = (i['category'] as String?) ?? 'oolong';
    _bestseller = (i['bestseller'] as bool?) ?? false;
    _isNew = (i['is_new'] as bool?) ?? false;
    _isActive = (i['is_active'] as bool?) ?? true;
  }

  @override
  void dispose() {
    for (final c in _ctrls.values) {
      c.dispose();
    }
    super.dispose();
  }

  int? _intOrNull(String key) {
    final v = _ctrls[key]?.text.trim();
    if (v == null || v.isEmpty) return null;
    return int.tryParse(v);
  }

  int _intOrZero(String key) => _intOrNull(key) ?? 0;

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final table = _isProduct ? 'products' : 'gift_sets';
      final payload = <String, dynamic>{
        'slug': _ctrls['slug']!.text.trim(),
        'name': _ctrls['name']!.text.trim(),
        'name_ko': _ctrls['name_ko']!.text.trim(),
        'name_ru': _ctrls['name_ru']!.text.trim(),
        'description': _ctrls['description']!.text.trim(),
        'description_ko': _ctrls['description_ko']!.text.trim(),
        'description_ru': _ctrls['description_ru']!.text.trim(),
        'price': _intOrZero('price'),
        'original_price': _intOrNull('original_price'),
        'image_url': _imageUrl.trim(),
        'stock': _intOrZero('stock'),
        'bestseller': _bestseller,
        'is_active': _isActive,
      };
      if (_isProduct) {
        payload['category'] = _category;
        payload['weight'] = _ctrls['weight']!.text.trim();
        payload['is_new'] = _isNew;
      } else {
        final inc = _ctrls['includes']!
            .text
            .split(',')
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .toList();
        payload['includes'] = inc;
      }

      if (_isCreate) {
        await Supabase.instance.client.from(table).insert(payload);
      } else {
        await Supabase.instance.client
            .from(table)
            .update(payload)
            .eq('id', widget.initial!['id']);
      }
      if (!mounted) return;
      widget.onSaved();
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Saved ✓')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Save failed: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete?'),
        content: const Text('This will remove the item. Continue?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final table = _isProduct ? 'products' : 'gift_sets';
      await Supabase.instance.client.from(table).delete().eq('id', widget.initial!['id']);
      if (!mounted) return;
      widget.onSaved();
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Delete failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Widget _field(String label, String key,
      {int maxLines = 1, TextInputType? type, String? hint}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: _ctrls[key],
        maxLines: maxLines,
        keyboardType: type,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          border: const OutlineInputBorder(),
          isDense: true,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scroll) => SingleChildScrollView(
          controller: scroll,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(
                _isCreate
                    ? (_isProduct ? 'New product' : 'New gift set')
                    : (_isProduct ? 'Edit product' : 'Edit gift set'),
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
              ),
              const SizedBox(height: 12),

              ImagePickerField(
                label: 'Main image',
                initialUrl: _imageUrl,
                bucket: 'product-images',
                pathPrefix: _isProduct ? 'products' : 'gift-sets',
                onChanged: (u) => setState(() => _imageUrl = u),
              ),
              const SizedBox(height: 12),

              _field('Slug (url, unique)', 'slug', hint: 'oolong-supreme'),
              _field('Name (EN)', 'name'),
              _field('Name (KO)', 'name_ko'),
              _field('Name (RU)', 'name_ru'),

              if (_isProduct) ...[
                DropdownButtonFormField<String>(
                  value: _categories.contains(_category) ? _category : _categories.first,
                  decoration: const InputDecoration(
                    labelText: 'Category',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  items: _categories
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setState(() => _category = v ?? _category),
                ),
                const SizedBox(height: 10),
                _field('Weight', 'weight', hint: '100g'),
              ],

              _field('Description (EN)', 'description', maxLines: 3),
              _field('Description (KO)', 'description_ko', maxLines: 3),
              _field('Description (RU)', 'description_ru', maxLines: 3),

              if (!_isProduct)
                _field('Includes (comma-separated)', 'includes',
                    maxLines: 2, hint: 'Oolong, Black Tea, Cup'),

              Row(children: [
                Expanded(
                  child: _field('Price (₩)', 'price',
                      type: TextInputType.number, hint: '25000'),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _field('Original price (₩)', 'original_price',
                      type: TextInputType.number, hint: 'optional'),
                ),
              ]),
              _field('Stock', 'stock', type: TextInputType.number),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Bestseller'),
                value: _bestseller,
                onChanged: (v) => setState(() => _bestseller = v),
              ),
              if (_isProduct)
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('New'),
                  value: _isNew,
                  onChanged: (v) => setState(() => _isNew = v),
                ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Active (visible in shop)'),
                value: _isActive,
                onChanged: (v) => setState(() => _isActive = v),
              ),

              const SizedBox(height: 12),
              Row(children: [
                if (!_isCreate)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _saving ? null : _delete,
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      label: const Text('Delete', style: TextStyle(color: Colors.red)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red),
                      ),
                    ),
                  ),
                if (!_isCreate) const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: _saving
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.save),
                    label: Text(_saving ? 'Saving…' : 'Save'),
                  ),
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
