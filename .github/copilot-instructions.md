# GitHub Copilot Instructions

This is the **NoirCheck** project, a digital content authenticity verification platform that combats misinformation using blockchain and zkTLS technology.

## Project Context

NoirCheck allows creators to register their original content on blockchain and consumers to verify the authenticity of any digital content. The project is divided into:

### Backend (Python + FastAPI)
- Located in `/backend/`
- RESTful API for content management
- Simulated integration with XION zkTLS
- SQLite database with SQLAlchemy
- Hash, file, and blockchain services

### Frontend (Flutter)
- Located in `/frontend/`
- Cross-platform mobile application
- Modern interface with dark theme
- State management with Riverpod
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
- **MVVM** architecture with services
- Reusable widgets in `/widgets/`
- Navigation with named routes

## Main Features

1. **Content Registration**: Creators upload original content and register it on blockchain
2. **Content Verification**: Users verify the authenticity of any file
3. **Identity Management**: Integration with XION zkTLS for secure verification
4. **History and Statistics**: Local storage of user activity

## Key Technologies

- **Python 3.11+** with FastAPI, SQLAlchemy, Cryptography
- **Flutter 3.0+** with Riverpod, Material Design
- **XION SDK** for blockchain and zkTLS (simulated)
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
