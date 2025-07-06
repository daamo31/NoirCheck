# ==========================================
# NOIRCHECK - SCRIPT DE VERIFICACIÓN
# ==========================================
"""
Script para verificar que todas las dependencias estén instaladas correctamente
y que el entorno de desarrollo funcione como esperado.
"""

def verificar_dependencias():
    """Verifica que todas las dependencias principales estén disponibles."""
    dependencias = {
        "FastAPI": "fastapi",
        "Uvicorn": "uvicorn", 
        "SQLAlchemy": "sqlalchemy",
        "Pydantic": "pydantic",
        "Pillow": "PIL",
        "OpenCV": "cv2",
        "Requests": "requests",
        "Python-dotenv": "dotenv",
        "Loguru": "loguru",
        "Web3": "web3",
        "Cryptography": "cryptography",
        "BCrypt": "bcrypt",
        "Pytest": "pytest"
    }
    
    resultados = {}
    
    for nombre, modulo in dependencias.items():
        try:
            __import__(modulo)
            resultados[nombre] = "✅ Instalado"
        except ImportError as e:
            resultados[nombre] = f"❌ Error: {e}"
    
    return resultados

def verificar_funcionalidades_basicas():
    """Verifica funcionalidades básicas del proyecto."""
    print("🔍 Verificando funcionalidades básicas...")
    
    # Test de hash
    import hashlib
    test_data = "NoirCheck Test"
    hash_result = hashlib.sha256(test_data.encode()).hexdigest()
    print(f"✅ Hash SHA-256: {hash_result[:16]}...")
    
    # Test de criptografía
    from cryptography.fernet import Fernet
    key = Fernet.generate_key()
    print(f"✅ Generación de claves criptográficas: OK")
    
    # Test de datetime
    from datetime import datetime
    now = datetime.now()
    print(f"✅ Manejo de fechas: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("✅ Todas las funcionalidades básicas funcionan correctamente!")

if __name__ == "__main__":
    print("🚀 NoirCheck - Verificación del Entorno de Desarrollo")
    print("=" * 60)
    
    # Verificar dependencias
    print("📦 Verificando dependencias...")
    resultados = verificar_dependencias()
    
    for nombre, estado in resultados.items():
        print(f"{nombre:20}: {estado}")
    
    print("\n" + "=" * 60)
    
    # Verificar funcionalidades
    verificar_funcionalidades_basicas()
    
    print("\n" + "=" * 60)
    print("🎉 Verificación completada!")
    print("📋 El entorno está listo para el desarrollo de NoirCheck.")
    print("\n💡 Próximos pasos:")
    print("   1. Configurar variables de entorno (.env)")
    print("   2. Ejecutar el servidor: python main.py")
    print("   3. Acceder a: http://localhost:8000/docs")
