@echo off
REM ==========================================
REM NOIRCHECK BACKEND SETUP SCRIPT (Windows)
REM ==========================================

echo 🚀 Configurando entorno NoirCheck Backend...

REM Verificar Python
echo 📋 Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no está instalado o no está en PATH.
    echo Por favor instala Python 3.11 o superior desde python.org
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% encontrado

REM Verificar si estamos en el directorio correcto
if not exist "requirements.txt" (
    echo ❌ No se encontró requirements.txt. Asegúrate de estar en el directorio backend\
    pause
    exit /b 1
)

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
    echo ✅ Entorno virtual creado
) else (
    echo ✅ Entorno virtual ya existe
)

REM Activar entorno virtual
echo 🔄 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Actualizar pip
echo ⬆️ Actualizando pip...
python -m pip install --upgrade pip

REM Instalar dependencias principales
echo 📥 Instalando dependencias principales...
pip install -r requirements.txt

REM Preguntar si instalar dependencias de desarrollo
set /p install_dev="¿Instalar dependencias de desarrollo? (y/N): "
if /i "%install_dev%"=="y" (
    echo 📥 Instalando dependencias de desarrollo...
    pip install -r requirements-dev.txt
    echo ✅ Dependencias de desarrollo instaladas
)

REM Crear directorios necesarios
echo 📁 Creando directorios necesarios...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "storage" mkdir storage

REM Crear archivo .env si no existe
if not exist ".env" (
    echo ⚙️ Creando archivo .env...
    echo # NoirCheck Backend Configuration > .env
    echo DATABASE_URL=sqlite:///./noircheck.db >> .env
    echo SECRET_KEY=your_secret_key_here_change_in_production >> .env
    echo XION_API_KEY=your_xion_api_key_here >> .env
    echo DEBUG=True >> .env
    echo LOG_LEVEL=INFO >> .env
    echo UPLOAD_DIR=./uploads >> .env
    echo MAX_FILE_SIZE=104857600 >> .env
    echo ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,bmp,webp,tiff,mp4,avi,mov,mkv,webm,pdf,txt,doc,docx >> .env
    echo ✅ Archivo .env creado (configura las variables antes de usar)
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 🎉 ¡Configuración completada!
echo.
echo 📋 Próximos pasos:
echo 1. Activa el entorno virtual: venv\Scripts\activate.bat
echo 2. Configura las variables en .env
echo 3. Ejecuta la aplicación: python main.py
echo.
echo 🔧 Comandos útiles:
echo - Ejecutar tests: pytest
echo - Formatear código: black .
echo - Verificar tipos: mypy .
echo - Linting: flake8 .
echo.
echo 📚 La aplicación estará disponible en: http://localhost:8000
echo 📊 Documentación de API: http://localhost:8000/docs
echo.
pause
