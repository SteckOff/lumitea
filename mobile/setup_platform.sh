#!/usr/bin/env bash
# Запускать из папки mobile/ на машине с установленным Flutter (>= 3.24)
# Создаёт android/ ios/ и прочие платформенные папки без затрагивания lib/

set -e
cd "$(dirname "$0")"

echo "==> flutter create . --org kr.lumitea --project-name lumitea"
flutter create . --org kr.lumitea --project-name lumitea

echo ""
echo "==> Следующие шаги:"
echo ""
echo "1. Firebase — скачай google-services.json из Firebase Console и положи в:"
echo "   mobile/android/app/google-services.json"
echo "   (iOS: mobile/ios/Runner/GoogleService-Info.plist)"
echo ""
echo "2. FlutterFire — запусти автонастройку:"
echo "   dart pub global activate flutterfire_cli"
echo "   flutterfire configure --project=lumitea-XXXXX"
echo ""
echo "3. Иконки и сплэш — положи логотип 1024x1024 в assets/images/logo.png, затем:"
echo "   dart run flutter_launcher_icons"
echo "   dart run flutter_native_splash:create"
echo ""
echo "4. Запустить на эмуляторе:"
echo "   flutter run"
echo ""
echo "5. Release-сборка (после keystore setup):"
echo "   flutter build appbundle --release"
echo ""
echo "==> Готово!"
