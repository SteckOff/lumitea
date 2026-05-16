// Reusable image picker: paste a URL OR upload a file to Supabase Storage.
// Works on mobile (iOS/Android) and desktop (macOS/Windows/Linux).

import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ImagePickerField extends StatefulWidget {
  final String label;
  final String? initialUrl;
  final String bucket;            // Supabase Storage bucket name
  final String pathPrefix;        // e.g. "products" or "gift-sets"
  final ValueChanged<String> onChanged;

  const ImagePickerField({
    super.key,
    required this.label,
    required this.initialUrl,
    required this.bucket,
    required this.pathPrefix,
    required this.onChanged,
  });

  @override
  State<ImagePickerField> createState() => _ImagePickerFieldState();
}

class _ImagePickerFieldState extends State<ImagePickerField> {
  late final TextEditingController _ctrl;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.initialUrl ?? '');
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _pickAndUpload() async {
    final res = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    if (res == null || res.files.isEmpty) return;
    final file = res.files.first;
    final Uint8List? bytes = file.bytes;
    if (bytes == null) return;

    setState(() => _uploading = true);
    try {
      final ext = (file.extension ?? 'jpg').toLowerCase();
      final filename =
          '${widget.pathPrefix}/${DateTime.now().millisecondsSinceEpoch}.$ext';
      await Supabase.instance.client.storage.from(widget.bucket).uploadBinary(
            filename,
            bytes,
            fileOptions: FileOptions(
              contentType: 'image/$ext',
              upsert: true,
            ),
          );
      final url =
          Supabase.instance.client.storage.from(widget.bucket).getPublicUrl(filename);
      _ctrl.text = url;
      widget.onChanged(url);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Uploaded ✓')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final url = _ctrl.text.trim();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Row(
          children: [
            if (url.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImage(
                  imageUrl: url,
                  width: 56,
                  height: 56,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) =>
                      Container(width: 56, height: 56, color: Colors.grey.shade200),
                ),
              )
            else
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.image_outlined, color: Colors.grey),
              ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _ctrl,
                decoration: const InputDecoration(
                  isDense: true,
                  hintText: 'https://… or upload',
                  border: OutlineInputBorder(),
                ),
                onChanged: widget.onChanged,
              ),
            ),
            const SizedBox(width: 8),
            FilledButton.icon(
              onPressed: _uploading ? null : _pickAndUpload,
              icon: _uploading
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.upload, size: 16),
              label: Text(_uploading ? '...' : 'Upload'),
            ),
          ],
        ),
      ],
    );
  }
}
