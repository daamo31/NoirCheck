# 📱 NoirCheck Mobile App

> **React Native + Expo application with full XION Abstraxion integration for digital content authenticity verification**

[![React Native](https://img.shields.io/badge/React%20Native-0.79+-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0+-000000.svg)](https://expo.dev/)
[![XION](https://img.shields.io/badge/XION-Blockchain-orange.svg)](https://xion.network/)
[![Abstraxion](https://img.shields.io/badge/Abstraxion-SDK-purple.svg)](https://abstraxion.burnt.labs/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Características Principales

### 🔐 Autenticación Completa
- **Abstraxion Integration**: Creación de cuentas XION sin fricción
- **Registro de usuarios**: Email + contraseña con validación
- **Persistencia de sesión**: Mantiene usuarios autenticados
- **Gestión de wallets**: Integración nativa con XION blockchain

### 📸 Registro de Contenido
- **Captura de cámara**: Tomar fotos directamente desde la app
- **Selección de galería**: Importar imágenes existentes
- **Hash SHA-256**: Cálculo seguro de hashes con crypto-js
- **Registro blockchain**: Almacenamiento permanente en XION
- **Metadatos enriquecidos**: Información completa del archivo

### 🔍 Verificación de Autenticidad
- **Selección de archivos**: Verificar cualquier imagen
- **Análisis de integridad**: Detección de modificaciones
- **Consulta blockchain**: Verificación en tiempo real contra XION
- **Niveles de confianza**: Sistema de scoring de autenticidad
- **Histórico de verificaciones**: Registro completo de actividad

### 📊 Dashboard Personal
- **Estadísticas en tiempo real**: Contadores de actividad
- **Histórico de actividad**: Lista completa de acciones
- **Estado de wallet**: Información de conexión XION
- **Navegación fluida**: Tabs inferiores para fácil acceso

## 🔧 Instalación y Setup

### Prerrequisitos
- **Node.js** 18+ con npm
- **Expo CLI**: `npm install -g @expo/cli`
- **Dispositivo físico** o **emulador** (iOS Simulator/Android Emulator)

### Instalación
```bash
cd mobile
npm install --legacy-peer-deps
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npx expo start

# Específico para plataforma
npx expo start --ios
npx expo start --android
npx expo start --web

# Limpiar cache
npx expo start --clear
```

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
