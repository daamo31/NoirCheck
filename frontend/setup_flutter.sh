#!/bin/bash

# ==========================================
# NOIRCHECK FLUTTER SETUP SCRIPT
# ==========================================

echo "🚀 Configurando entorno Flutter para NoirCheck..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si Flutter está instalado
if command -v flutter &> /dev/null; then
    echo -e "${GREEN}✅ Flutter ya está instalado${NC}"
    flutter --version
else
    echo -e "${YELLOW}📦 Flutter no está instalado. Instalando...${NC}"
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}🍎 Detectado: macOS${NC}"
        
        # Verificar si Homebrew está instalado
        if command -v brew &> /dev/null; then
            echo -e "${BLUE}🍺 Instalando Flutter via Homebrew...${NC}"
            brew install --cask flutter
        else
            echo -e "${YELLOW}⚠️  Homebrew no está instalado${NC}"
            echo -e "${BLUE}📋 Para instalar Flutter manualmente:${NC}"
            echo "1. Visita: https://docs.flutter.dev/get-started/install/macos"
            echo "2. Descarga Flutter SDK"
            echo "3. Extrae en ~/development/"
            echo "4. Agrega al PATH: export PATH=\"\$PATH:\$HOME/development/flutter/bin\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${BLUE}🐧 Detectado: Linux${NC}"
        echo -e "${YELLOW}📋 Para instalar Flutter en Linux:${NC}"
        echo "1. wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz"
        echo "2. tar xf flutter_linux_3.16.0-stable.tar.xz"
        echo "3. export PATH=\"\$PATH:\`pwd\`/flutter/bin\""
        exit 1
    else
        echo -e "${RED}❌ Sistema operativo no soportado por este script${NC}"
        echo "Visita: https://docs.flutter.dev/get-started/install"
        exit 1
    fi
fi

echo -e "${BLUE}🔍 Verificando configuración de Flutter...${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "pubspec.yaml" ]; then
    echo -e "${RED}❌ No se encontró pubspec.yaml. Asegúrate de estar en el directorio frontend/${NC}"
    exit 1
fi

# Verificar doctor de Flutter
echo -e "${BLUE}🩺 Ejecutando Flutter Doctor...${NC}"
flutter doctor

# Verificar si hay problemas críticos
if ! flutter doctor | grep -q "No issues found!"; then
    echo -e "${YELLOW}⚠️  Flutter Doctor encontró algunos problemas${NC}"
    echo -e "${BLUE}💡 Puedes continuar, pero es recomendable resolver los problemas${NC}"
    read -p "¿Deseas continuar? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Limpiar cache de Flutter
echo -e "${BLUE}🧹 Limpiando cache de Flutter...${NC}"
flutter clean

# Obtener dependencias
echo -e "${BLUE}📦 Obteniendo dependencias de Flutter...${NC}"
flutter pub get

# Verificar que las dependencias se instalaron correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

# Verificar capacidad de build
echo -e "${BLUE}🔨 Verificando capacidad de build...${NC}"
flutter build apk --debug --no-sound-null-safety 2>/dev/null || echo -e "${YELLOW}⚠️  Build test no completado (normal si no hay dispositivos Android configurados)${NC}"

echo -e "${GREEN}🎉 Configuración de Flutter completada!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "1. Conectar un dispositivo o iniciar un emulador"
echo "2. Ejecutar: flutter run"
echo "3. Para desarrollo web: flutter run -d web"
echo "4. Para hot reload: r (en el terminal de flutter run)"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo "- flutter doctor: Verificar configuración"
echo "- flutter devices: Ver dispositivos disponibles"
echo "- flutter emulators: Ver emuladores disponibles"
echo "- flutter pub get: Instalar dependencias"
echo "- flutter clean: Limpiar cache"
echo ""
echo -e "${GREEN}✨ NoirCheck Frontend está listo para desarrollo!${NC}"
