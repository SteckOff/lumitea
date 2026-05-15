// Korean address picker using Daum Postcode Service embedded in a WebView.
// Docs: https://postcode.map.daum.net/guide
//
// Usage:
//   final result = await showModalBottomSheet<KoreanAddress>(
//     context: context,
//     isScrollControlled: true,
//     builder: (_) => const KoreanAddressSheet(),
//   );
//   if (result != null) { ... }

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// The data returned after the user picks an address.
class KoreanAddress {
  final String postalCode;
  final String address1; // road address (도로명)
  const KoreanAddress({required this.postalCode, required this.address1});
}

/// A full-screen bottom sheet containing the Daum Postcode WebView.
class KoreanAddressSheet extends StatefulWidget {
  const KoreanAddressSheet({super.key});

  @override
  State<KoreanAddressSheet> createState() => _KoreanAddressSheetState();
}

class _KoreanAddressSheetState extends State<KoreanAddressSheet> {
  late final WebViewController _ctrl;
  bool _loading = true;

  // Inline HTML — no external host needed, avoids CORS issues.
  static const String _html = '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
  </style>
</head>
<body>
<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
<script>
  new daum.Postcode({
    oncomplete: function(data) {
      var addr = data.roadAddress || data.autoRoadAddress || data.jibunAddress;
      var zip  = data.zonecode;
      // Post message back to Flutter
      window.flutter_inappwebview_channel && window.flutter_inappwebview_channel.postMessage(
        JSON.stringify({ zip: zip, addr: addr })
      );
      // fallback for webview_flutter
      if (window.DartBridge) {
        window.DartBridge.postMessage(JSON.stringify({ zip: zip, addr: addr }));
      }
    },
    width: '100%',
    height: '100%',
    animation: true,
  }).open();
</script>
</body>
</html>
''';

  @override
  void initState() {
    super.initState();
    _ctrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) => setState(() => _loading = false),
      ))
      ..addJavaScriptChannel(
        'DartBridge',
        onMessageReceived: (msg) => _onMessage(msg.message),
      )
      ..loadHtmlString(_html, baseUrl: 'https://postcode.map.daum.net');
  }

  void _onMessage(String raw) {
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final zip  = map['zip']  as String? ?? '';
      final addr = map['addr'] as String? ?? '';
      if (zip.isNotEmpty && addr.isNotEmpty && mounted) {
        Navigator.of(context).pop(KoreanAddress(postalCode: zip, address1: addr));
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.85,
        child: Column(
          children: [
            // Drag handle + title
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const SizedBox(width: 16),
                      const Text('주소 검색',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: Stack(
                children: [
                  WebViewWidget(controller: _ctrl),
                  if (_loading)
                    const Center(child: CircularProgressIndicator()),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
