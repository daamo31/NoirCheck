# ==========================================
# NOIRCHECK FRONTEND - VERIFICACIÓN DE DEPENDENCIAS
# ==========================================
"""
Script para verificar que las dependencias del frontend estén correctamente configuradas
"""

import subprocess
import sys
import os

def ejecutar_comando(comando, descripcion):
    """Ejecuta un comando y devuelve el resultado."""
    print(f"🔍 {descripcion}...")
    try:
        resultado = subprocess.run(comando, shell=True, capture_output=True, text=True, cwd='/Users/daniel/Desktop/NoirsCheck/frontend')
        if resultado.returncode == 0:
            print(f"✅ {descripcion}: OK")
            return True, resultado.stdout
        else:
            print(f"❌ {descripcion}: Error")
            print(f"   Error: {resultado.stderr}")
            return False, resultado.stderr
    except Exception as e:
        print(f"❌ {descripcion}: Excepción - {e}")
        return False, str(e)

def verificar_flutter():
    """Verifica la instalación de Flutter."""
    print("📱 VERIFICANDO FLUTTER")
    print("=" * 40)
    
    # Verificar Flutter
    success, output = ejecutar_comando("flutter --version", "Versión de Flutter")
    if success:
        print(f"   {output.split()[1]}")
    
    # Verificar Dart
    success, output = ejecutar_comando("dart --version", "Versión de Dart")
    if success:
        print(f"   Dart {output.split()[3]}")
    
    return success

def verificar_dependencias():
    """Verifica las dependencias del proyecto."""
    print("\n📦 VERIFICANDO DEPENDENCIAS")
    print("=" * 40)
    
    # Verificar pubspec.yaml
    if os.path.exists('/Users/daniel/Desktop/NoirsCheck/frontend/pubspec.yaml'):
        print("✅ pubspec.yaml: Encontrado")
    else:
        print("❌ pubspec.yaml: No encontrado")
        return False
    
    # Verificar que las dependencias estén instaladas
    success, output = ejecutar_comando("flutter pub deps", "Estado de dependencias")
    
    # Verificar packages específicos importantes
    dependencias_clave = [
        "flutter",
        "cupertino_icons", 
        "material_design_icons_flutter",
        "http",
        "dio",
        "provider",
        "riverpod",
        "flutter_riverpod",
        "file_picker",
        "image_picker",
        "crypto",
        "shared_preferences"
    ]
    
    print("\n🔍 Dependencias clave:")
    for dep in dependencias_clave:
        if dep in output.lower():
            print(f"   ✅ {dep}")
        else:
            print(f"   ❌ {dep}")
    
    return success

def verificar_dispositivos():
    """Verifica dispositivos disponibles."""
    print("\n📱 VERIFICANDO DISPOSITIVOS")
    print("=" * 40)
    
    success, output = ejecutar_comando("flutter devices", "Dispositivos disponibles")
    if success and output:
        lines = output.split('\n')
        device_count = 0
        for line in lines:
            if '•' in line and ('chrome' in line.lower() or 'web' in line.lower() or 'macos' in line.lower()):
                print(f"   ✅ {line.strip()}")
                device_count += 1
        
        if device_count > 0:
            print(f"\n✅ {device_count} dispositivo(s) disponible(s) para desarrollo")
            return True
        else:
            print("❌ No hay dispositivos disponibles")
            return False
    
    return False

def verificar_compilacion():
    """Verifica que el proyecto pueda compilar."""
    print("\n🔨 VERIFICANDO COMPILACIÓN")
    print("=" * 40)
    
    # Verificar análisis de código
    success, output = ejecutar_comando("flutter analyze", "Análisis de código")
    
    if success:
        if "No issues found!" in output:
            print("✅ Análisis de código: Sin problemas")
        else:
            print("⚠️  Análisis de código: Algunos warnings (normal)")
    
    return success

def generar_reporte():
    """Genera un reporte final."""
    print("\n" + "=" * 60)
    print("📋 REPORTE FINAL - NOIRCHECK FRONTEND")
    print("=" * 60)
    
    # Verificar cada componente
    flutter_ok = verificar_flutter()
    deps_ok = verificar_dependencias()
    devices_ok = verificar_dispositivos()
    compile_ok = verificar_compilacion()
    
    print("\n📊 RESUMEN:")
    print(f"   Flutter instalado: {'✅' if flutter_ok else '❌'}")
    print(f"   Dependencias: {'✅' if deps_ok else '❌'}")
    print(f"   Dispositivos: {'✅' if devices_ok else '❌'}")
    print(f"   Compilación: {'✅' if compile_ok else '❌'}")
    
    if all([flutter_ok, deps_ok, devices_ok]):
        print("\n🎉 ¡EL FRONTEND ESTÁ LISTO PARA DESARROLLO!")
        print("\n💡 Próximos pasos:")
        print("   1. cd /Users/daniel/Desktop/NoirsCheck/frontend")
        print("   2. flutter run -d web")
        print("   3. Abrir: http://localhost:5000")
        print("\n🔧 Comandos útiles:")
        print("   - flutter run -d web: Ejecutar en navegador")
        print("   - flutter hot reload: r (en terminal activo)")
        print("   - flutter hot restart: R (en terminal activo)")
        print("   - flutter clean: Limpiar cache")
        return True
    else:
        print("\n⚠️  Hay algunos problemas que resolver:")
        if not flutter_ok:
            print("   - Reinstalar Flutter")
        if not deps_ok:
            print("   - Ejecutar: flutter pub get")
        if not devices_ok:
            print("   - Verificar dispositivos: flutter devices")
        if not compile_ok:
            print("   - Revisar errores: flutter analyze")
        return False

if __name__ == "__main__":
    print("🚀 NoirCheck Frontend - Verificación de Entorno")
    print("=" * 60)
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists('/Users/daniel/Desktop/NoirsCheck/frontend'):
        print("❌ Error: Directorio del frontend no encontrado")
        sys.exit(1)
    
    # Generar reporte completo
    exito = generar_reporte()
    
    if exito:
        sys.exit(0)
    else:
        sys.exit(1)
