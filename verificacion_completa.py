#!/usr/bin/env python3
"""
Script de verificación final de NoirCheck
Verifica que tanto backend como frontend estén correctamente configurados.
"""

import subprocess
import sys
import os
import requests
import time
from pathlib import Path

def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

def check_command(command, description):
    """Verifica que un comando esté disponible."""
    try:
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_success(f"{description} disponible")
            return True
        else:
            print_error(f"{description} no disponible")
            return False
    except Exception as e:
        print_error(f"Error verificando {description}: {e}")
        return False

def check_python_packages():
    """Verifica las dependencias Python del backend."""
    print_header("VERIFICACIÓN BACKEND (Python)")
    
    # Verificar Python
    if not check_command("python --version", "Python"):
        return False
    
    # Verificar pip
    if not check_command("pip --version", "pip"):
        return False
    
    # Paquetes requeridos
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'cryptography',
        'requests'
    ]
    
    print_info("Verificando paquetes Python...")
    all_ok = True
    
    for package in required_packages:
        try:
            result = subprocess.run(
                [sys.executable, "-c", f"import {package}; print(f'{package} OK')"],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                print_success(f"Paquete {package} instalado")
            else:
                print_error(f"Paquete {package} no encontrado")
                all_ok = False
        except Exception as e:
            print_error(f"Error verificando {package}: {e}")
            all_ok = False
    
    return all_ok

def check_flutter():
    """Verifica Flutter y sus dependencias."""
    print_header("VERIFICACIÓN FRONTEND (Flutter)")
    
    # Verificar Flutter
    if not check_command("flutter --version", "Flutter SDK"):
        return False
    
    # Verificar flutter doctor
    print_info("Ejecutando flutter doctor...")
    try:
        result = subprocess.run(["flutter", "doctor"], capture_output=True, text=True)
        if "No issues found!" in result.stdout or "doctor found issues" not in result.stdout.lower():
            print_success("Flutter doctor OK")
        else:
            print_error("Flutter doctor encontró problemas")
            print(result.stdout)
    except Exception as e:
        print_error(f"Error ejecutando flutter doctor: {e}")
        return False
    
    # Verificar dependencias del proyecto
    frontend_path = Path("frontend")
    if frontend_path.exists():
        print_info("Verificando dependencias Flutter...")
        try:
            result = subprocess.run(
                ["flutter", "pub", "deps"],
                cwd=frontend_path,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print_success("Dependencias Flutter OK")
            else:
                print_error("Error en dependencias Flutter")
                return False
        except Exception as e:
            print_error(f"Error verificando dependencias: {e}")
            return False
    
    return True

def check_flutter_analyze():
    """Ejecuta flutter analyze para verificar errores de código."""
    print_header("ANÁLISIS DE CÓDIGO FLUTTER")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print_error("Directorio frontend no encontrado")
        return False
    
    try:
        result = subprocess.run(
            ["flutter", "analyze"],
            cwd=frontend_path,
            capture_output=True,
            text=True
        )
        
        # Verificar si hay errores críticos (no warnings)
        output_lines = result.stdout.split('\n')
        error_lines = [line for line in output_lines if 'error •' in line]
        
        if len(error_lines) == 0:
            print_success("Análisis de código OK - Sin errores críticos")
            
            # Contar warnings
            issues_line = [line for line in output_lines if "issues found" in line]
            if issues_line:
                print_info(f"Resultado: {issues_line[0].strip()}")
            
            return True
        else:
            print_error(f"Análisis encontró {len(error_lines)} errores críticos")
            for error in error_lines[:5]:  # Mostrar solo los primeros 5
                print(f"  {error}")
            return False
            
    except Exception as e:
        print_error(f"Error ejecutando flutter analyze: {e}")
        return False

def check_web_server():
    """Verifica si el servidor web de Flutter está corriendo."""
    print_header("VERIFICACIÓN SERVIDOR WEB")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print_success("Servidor Flutter web corriendo en http://localhost:3000")
            return True
        else:
            print_error(f"Servidor responde con código {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_info("Servidor web no está corriendo. Para iniciarlo ejecuta:")
        print("   cd frontend && flutter run -d web-server --web-port=3000")
        return False
    except Exception as e:
        print_error(f"Error verificando servidor web: {e}")
        return False

def check_project_structure():
    """Verifica la estructura del proyecto."""
    print_header("VERIFICACIÓN ESTRUCTURA DEL PROYECTO")
    
    expected_structure = {
        "backend": [
            "requirements.txt",
            "requirements-dev.txt", 
            "setup.sh",
            "setup.bat",
            "verificar_entorno.py"
        ],
        "frontend": [
            "pubspec.yaml",
            "setup_flutter.sh",
            "verificar_frontend.py",
            "lib/main.dart"
        ],
        ".": [
            ".gitignore",
            "CONFIGURACION_FINALIZADA.md"
        ]
    }
    
    all_ok = True
    
    for directory, files in expected_structure.items():
        base_path = Path(directory) if directory != "." else Path(".")
        
        if not base_path.exists() and directory != ".":
            print_error(f"Directorio {directory} no encontrado")
            all_ok = False
            continue
            
        for file in files:
            file_path = base_path / file
            if file_path.exists():
                print_success(f"Archivo {file_path} encontrado")
            else:
                print_error(f"Archivo {file_path} no encontrado")
                all_ok = False
    
    return all_ok

def main():
    """Función principal de verificación."""
    print_header("VERIFICACIÓN COMPLETA DE NOIRCHECK")
    print("Este script verifica que el proyecto esté correctamente configurado.")
    
    # Lista de verificaciones
    checks = [
        ("Estructura del proyecto", check_project_structure),
        ("Backend Python", check_python_packages),
        ("Frontend Flutter", check_flutter),
        ("Análisis de código", check_flutter_analyze),
        ("Servidor web", check_web_server)
    ]
    
    results = {}
    
    for check_name, check_function in checks:
        try:
            results[check_name] = check_function()
        except KeyboardInterrupt:
            print("\n\nVerificación interrumpida por el usuario.")
            sys.exit(1)
        except Exception as e:
            print_error(f"Error inesperado en {check_name}: {e}")
            results[check_name] = False
    
    # Resumen final
    print_header("RESUMEN DE VERIFICACIÓN")
    
    total_checks = len(results)
    passed_checks = sum(1 for result in results.values() if result)
    
    for check_name, result in results.items():
        status = "✅ ÉXITO" if result else "❌ FALLO"
        print(f"{status}: {check_name}")
    
    print(f"\nResultado: {passed_checks}/{total_checks} verificaciones exitosas")
    
    if passed_checks == total_checks:
        print_success("🎉 ¡NoirCheck está completamente configurado y listo!")
        print_info("Puedes comenzar el desarrollo ejecutando:")
        print("   Backend: cd backend && python -m uvicorn main:app --reload")
        print("   Frontend: cd frontend && flutter run -d web-server --web-port=3000")
    else:
        print_error("Algunas verificaciones fallaron. Revisa los errores arriba.")
        sys.exit(1)

if __name__ == "__main__":
    main()
