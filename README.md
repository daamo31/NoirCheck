# NoirCheck - Plataforma de Verificación de Autenticidad Digital

NoirCheck es una aplicación innovadora diseñada para combatir la desinformación y la falsificación de contenido digital. Utiliza tecnología blockchain y zkTLS para crear un ecosistema de confianza donde creadores y consumidores pueden verificar la autenticidad del contenido digital.

## 🚀 Características Principales

### Para Creadores
- **Registro de Contenido Original**: Sube y autentica tu contenido original en blockchain
- **Verificación de Identidad**: Integración con XION zkTLS para verificación segura
- **Sello de Autenticidad**: Genera códigos QR y sellos criptográficos únicos
- **Prueba de Autoría**: Crea registros inmutables de tu trabajo creativo

### Para Consumidores
- **Verificación Instantánea**: Verifica cualquier contenido digital en segundos
- **Detección de Modificaciones**: Identifica si el contenido ha sido alterado
- **Análisis de Fuente**: Evalúa la confiabilidad del sitio web de origen
- **Historial de Verificaciones**: Mantén un registro de todas tus verificaciones

## 🏗️ Arquitectura del Sistema

### Backend (Python + FastAPI)
- **API RESTful** para interacción con el frontend
- **Manejo de archivos** con validación y procesamiento
- **Integración XION** para blockchain y zkTLS
- **Base de datos SQLite** para desarrollo
- **Servicios de hash** y criptografía

### Frontend (Flutter)
- **Aplicación móvil multiplataforma**
- **Interfaz moderna** con tema oscuro
- **Gestión de estado** con Riverpod
- **Cámara y galería** integradas
- **Almacenamiento local** persistente

### Integración Blockchain
- **XION zkTLS** para verificación de identidad
- **Registro inmutable** en blockchain
- **Consultas de verificación** en tiempo real
- **Pruebas criptográficas** de autenticidad

## 🛠️ Instalación y Configuración

### Prerequisitos
- Python 3.11+
- Flutter SDK 3.0+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
flutter pub get
flutter run
```

## 📱 Funcionalidades de la App

### Pantalla Principal
- Estado de conexión con el servidor
- Estadísticas de la red NoirCheck
- Acceso rápido a funciones principales
- Actividad reciente del usuario

### Registro de Contenido
1. **Selección de archivo** (imagen, video, documento)
2. **Verificación de identidad** con XION zkTLS
3. **Registro en blockchain** con hash criptográfico
4. **Generación de sello** de autenticidad

### Verificación de Contenido
1. **Subida de archivo** a verificar
2. **Análisis criptográfico** del contenido
3. **Consulta en blockchain** para registro original
4. **Verificación de fuente** web (opcional)
5. **Resultado detallado** con nivel de confianza

### Resultados de Verificación
- **Auténtico y Original**: 100% verificado, sin modificaciones
- **Auténtico pero Modificado**: Registrado pero alterado desde el original
- **No Verificado**: Sin registro en blockchain, origen desconocido

## 🔒 Seguridad y Privacidad

### Verificación de Identidad
- Integración con **XION zkTLS** para pruebas de identidad privadas
- No exposición de datos personales en blockchain
- Verificación a través de plataformas sociales confiables

### Integridad del Contenido
- **Hash SHA-256** para identificación única
- **Sellos HMAC** para verificación de integridad
- **Timestamps** inmutables en blockchain

### Privacidad de Datos
- **Almacenamiento local** de preferencias
- **Cifrado** de datos sensibles
- **Limpieza automática** de archivos temporales

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```bash
# Backend
DATABASE_URL=sqlite:///./noircheck.db
XION_API_KEY=your_xion_api_key
SECRET_KEY=your_secret_key

# Frontend
API_BASE_URL=http://localhost:8000
```

### Estructura del Proyecto
```
NoirsCheck/
├── backend/
│   ├── main.py              # Aplicación FastAPI principal
│   ├── models/              # Modelos de base de datos
│   ├── services/            # Servicios de negocio
│   └── requirements.txt     # Dependencias Python
├── frontend/
│   ├── lib/
│   │   ├── main.dart       # Aplicación Flutter principal
│   │   ├── screens/        # Pantallas de la app
│   │   ├── services/       # Servicios de API y storage
│   │   ├── models/         # Modelos de datos
│   │   └── widgets/        # Componentes reutilizables
│   └── pubspec.yaml        # Dependencias Flutter
└── README.md
```

## 🧪 Testing y Demo

### Modo Demo
- **Token de identidad simulado** para desarrollo
- **Verificaciones locales** sin blockchain real
- **Datos de prueba** para estadísticas

### Casos de Uso de Prueba
1. **Registro exitoso**: Sube una imagen y verifica el proceso completo
2. **Verificación positiva**: Verifica un archivo previamente registrado
3. **Detección de modificación**: Verifica una versión editada del archivo
4. **Contenido no registrado**: Verifica un archivo no registrado

## 🌟 Características Técnicas Avanzadas

### Procesamiento de Archivos
- **Validación de tipos** MIME
- **Optimización de imágenes** automática
- **Extracción de metadatos** de video
- **Normalización de documentos** de texto

### Análisis de Similaridad
- **Comparación de hashes** para detectar modificaciones
- **Scoring de confianza** basado en múltiples factores
- **Detección de deepfakes** (roadmap futuro)

### Escalabilidad
- **Arquitectura modular** para fácil extensión
- **API RESTful** estándar para integraciones
- **Base de datos configurable** (SQLite, PostgreSQL, MySQL)

## 🚧 Roadmap Futuro

### Funcionalidades Planeadas
- [ ] **Integración con redes sociales** para verificación automática
- [ ] **Análisis de deepfakes** con IA avanzada
- [ ] **Marketplace de contenido** verificado
- [ ] **API pública** para desarrolladores
- [ ] **Extensiones de navegador** para verificación web

### Mejoras Técnicas
- [ ] **Caché distribuido** para mejor rendimiento
- [ ] **Notificaciones push** para alertas
- [ ] **Sincronización en la nube** del historial
- [ ] **Análisis de sentimientos** en texto

## 🤝 Contribución

NoirCheck es un proyecto de demostración diseñado para mostrar el potencial de la tecnología blockchain en la lucha contra la desinformación. Las contribuciones son bienvenidas para mejorar y expandir las funcionalidades.

### Cómo Contribuir
1. Fork del repositorio
2. Crea una rama para tu feature
3. Implementa y prueba tu funcionalidad
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está desarrollado como demostración técnica. Por favor, contacta a los desarrolladores para información sobre licencias.

## 📞 Soporte

Para soporte técnico o preguntas sobre NoirCheck:
- **Email**: support@noircheck.app
- **Documentación**: https://docs.noircheck.app
- **Issues**: GitHub Issues

---

**NoirCheck** - Devolviendo la confianza al ecosistema digital 🛡️
