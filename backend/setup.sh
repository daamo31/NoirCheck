#!/bin/bash

# ==========================================
# NOIRCHECK BACKEND SETUP SCRIPT
# ==========================================

echo "🚀 Configurando entorno NoirCheck Backend..."

# Verificar Python
echo "📋 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.11 o superior."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION encontrado"

# Verificar si estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo "❌ No se encontró requirements.txt. Asegúrate de estar en el directorio backend/"
    exit 1
fi

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
else
    echo "✅ Entorno virtual ya existe"
fi

# Activar entorno virtual
echo "🔄 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "⬆️ Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias principales
echo "📥 Instalando dependencias principales..."
pip install -r requirements.txt

# Preguntar si instalar dependencias de desarrollo
read -p "¿Instalar dependencias de desarrollo? (y/N): " install_dev
if [[ $install_dev =~ ^[Yy]$ ]]; then
    echo "📥 Instalando dependencias de desarrollo..."
    pip install -r requirements-dev.txt
    echo "✅ Dependencias de desarrollo instaladas"
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p uploads
mkdir -p logs
mkdir -p storage

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "⚙️ Creando archivo .env..."
    cat > .env << EOL
# NoirCheck Backend Configuration
DATABASE_URL=sqlite:///./noircheck.db
SECRET_KEY=your_secret_key_here_change_in_production
XION_API_KEY=your_xion_api_key_here
DEBUG=True
LOG_LEVEL=INFO
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,bmp,webp,tiff,mp4,avi,mov,mkv,webm,pdf,txt,doc,docx
EOL
    echo "✅ Archivo .env creado (configura las variables antes de usar)"
else
    echo "✅ Archivo .env ya existe"
fi

# Inicializar base de datos
echo "🗄️ Inicializando base de datos..."
python -c "
from models.database import init_db
init_db()
print('Base de datos inicializada')
" 2>/dev/null || echo "⚠️ No se pudo inicializar la base de datos automáticamente"

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Activa el entorno virtual: source venv/bin/activate"
echo "2. Configura las variables en .env"
echo "3. Ejecuta la aplicación: python main.py"
echo ""
echo "🔧 Comandos útiles:"
echo "- Ejecutar tests: pytest"
echo "- Formatear código: black ."
echo "- Verificar tipos: mypy ."
echo "- Linting: flake8 ."
echo ""
echo "📚 La aplicación estará disponible en: http://localhost:8000"
echo "📊 Documentación de API: http://localhost:8000/docs"
