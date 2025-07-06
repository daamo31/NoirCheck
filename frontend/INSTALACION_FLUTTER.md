# ==========================================
# GUÍA DE INSTALACIÓN DE FLUTTER - NOIRCHECK
# ==========================================

## 🍎 Instalación en macOS

### Opción 1: Homebrew (Recomendado)

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Flutter
brew install --cask flutter

# Verificar instalación
flutter --version
flutter doctor
```

### Opción 2: Manual

1. **Descargar Flutter SDK**:
   - Visita: https://docs.flutter.dev/get-started/install/macos
   - Descarga el archivo ZIP de Flutter para macOS

2. **Extraer Flutter**:
   ```bash
   cd ~/development
   unzip ~/Downloads/flutter_macos_3.16.0-stable.zip
   ```

3. **Agregar al PATH**:
   ```bash
   echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Verificar instalación**:
   ```bash
   flutter --version
   flutter doctor
   ```

## 🔧 Configuración Adicional

### Xcode (para iOS)
```bash
# Instalar Xcode desde App Store
# Aceptar licencias
sudo xcodebuild -license

# Instalar herramientas de línea de comandos
sudo xcode-select --install

# Configurar simulador
open -a Simulator
```

### Android Studio (para Android)
1. Descargar e instalar Android Studio
2. Instalar Android SDK
3. Crear un Android Virtual Device (AVD)

### VS Code (Editor recomendado)
```bash
# Instalar VS Code
brew install --cask visual-studio-code

# Extensiones importantes:
# - Flutter
# - Dart
# - Flutter Intl
```

## 📱 Verificar Dispositivos

```bash
# Ver dispositivos conectados
flutter devices

# Ver emuladores disponibles
flutter emulators

# Iniciar emulador
flutter emulators --launch <emulator_id>
```

## 🚀 Ejecutar NoirCheck

```bash
# Navegar al directorio del frontend
cd /Users/daniel/Desktop/NoirsCheck/frontend

# Ejecutar el script de setup
./setup_flutter.sh

# O manualmente:
flutter pub get
flutter run
```

## 🐛 Solución de Problemas Comunes

### Flutter Doctor Issues

1. **cmdline-tools component is missing**:
   ```bash
   flutter doctor --android-licenses
   ```

2. **Xcode not properly configured**:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```

3. **CocoaPods not installed**:
   ```bash
   sudo gem install cocoapods
   ```

### Errores de Build

1. **Limpiar cache**:
   ```bash
   flutter clean
   flutter pub get
   ```

2. **Problemas con iOS**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Problemas con permisos**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## 📋 Dependencias de NoirCheck

El archivo `pubspec.yaml` incluye:

### UI y Navegación
- `cupertino_icons`: Iconos de iOS
- `material_design_icons_flutter`: Iconos Material Design

### Networking
- `http`: Cliente HTTP básico
- `dio`: Cliente HTTP avanzado

### State Management
- `provider`: Gestión de estado simple
- `riverpod`: Gestión de estado reactiva
- `flutter_riverpod`: Riverpod para Flutter

### File Handling
- `file_picker`: Selector de archivos
- `image_picker`: Selector de imágenes
- `path_provider`: Rutas del sistema
- `camera`: Control de cámara

### Otros
- `crypto`: Funciones criptográficas
- `shared_preferences`: Almacenamiento local
- `qr_flutter`: Generación de códigos QR
- `permission_handler`: Manejo de permisos

## ✅ Verificación Final

Una vez instalado Flutter, ejecuta:

```bash
cd /Users/daniel/Desktop/NoirsCheck/frontend
./setup_flutter.sh
```

Este script verificará:
- ✅ Instalación de Flutter
- ✅ Configuración del entorno
- ✅ Instalación de dependencias
- ✅ Capacidad de build

---

**¿Necesitas ayuda?** Revisa la documentación oficial: https://docs.flutter.dev/
