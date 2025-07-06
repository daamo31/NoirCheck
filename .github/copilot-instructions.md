# Instrucciones para GitHub Copilot

Este es el proyecto **NoirCheck**, una plataforma de verificación de autenticidad de contenido digital que combate la desinformación utilizando tecnología blockchain y zkTLS.

## Contexto del Proyecto

NoirCheck permite a los creadores registrar su contenido original en blockchain y a los consumidores verificar la autenticidad de cualquier contenido digital. El proyecto está dividido en:

### Backend (Python + FastAPI)
- Ubicado en `/backend/`
- API RESTful para manejo de contenido
- Integración simulada con XION zkTLS
- Base de datos SQLite con SQLAlchemy
- Servicios de hash, archivos y blockchain

### Frontend (Flutter)
- Ubicado en `/frontend/`
- Aplicación móvil multiplataforma
- Interfaz moderna con tema oscuro
- Gestión de estado con Riverpod
- Integración de cámara y galería

## Patrones y Convenciones

### Backend Python
- Usa **FastAPI** para APIs REST
- **SQLAlchemy** para ORM
- **Pydantic** para validación de datos
- Estructura en servicios modulares
- Manejo de errores consistente

### Frontend Flutter
- **Material Design 3** con tema personalizado
- **Riverpod** para gestión de estado
- Arquitectura **MVVM** con servicios
- Widgets reutilizables en `/widgets/`
- Navegación con rutas nombradas

## Funcionalidades Principales

1. **Registro de Contenido**: Los creadores suben contenido original y lo registran en blockchain
2. **Verificación de Contenido**: Los usuarios verifican la autenticidad de cualquier archivo
3. **Gestión de Identidad**: Integración con XION zkTLS para verificación segura
4. **Historial y Estadísticas**: Almacenamiento local de actividad del usuario

## Tecnologías Clave

- **Python 3.11+** con FastAPI, SQLAlchemy, Cryptography
- **Flutter 3.0+** con Riverpod, Material Design
- **XION SDK** para blockchain y zkTLS (simulado)
- **SQLite** para persistencia local
- **Hash SHA-256** para identificación de contenido

## Guías de Desarrollo

### Al trabajar con el backend:
- Sigue la estructura de servicios modulares
- Usa type hints en Python
- Implementa manejo de errores adecuado
- Documenta endpoints con docstrings

### Al trabajar con Flutter:
- Mantén la consistencia del tema oscuro
- Usa widgets reutilizables
- Implementa loading states para operaciones asíncronas
- Sigue las convenciones de Material Design

### Seguridad y Privacidad:
- Nunca expongas claves privadas
- Valida todos los inputs del usuario
- Usa HTTPS en producción
- Respeta la privacidad del usuario

## Arquitectura de Verificación

El flujo de verificación incluye:
1. Cálculo de hash del contenido
2. Consulta en blockchain via XION
3. Verificación de fuente web (opcional)
4. Análisis de modificaciones
5. Generación de resultado con nivel de confianza

Cuando generes código, ten en cuenta este contexto y mantén la consistencia con los patrones establecidos.
