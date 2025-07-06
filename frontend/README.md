# 🚀 NoirCheck Frontend (Next.js + XION)

Frontend moderno de NoirCheck construido con **Next.js**, **TypeScript** y **Tailwind CSS**, optimizado para integrarse con **XION blockchain**.

## 🎯 **Características Principales**

- ✅ **Next.js 15** con TypeScript
- 🎨 **Tailwind CSS** para diseño moderno
- 🔗 **Integración XION** blockchain
- 📱 **Responsive Design** 
- 🌙 **Tema Oscuro** por defecto
- ⚡ **Performance optimizada**

## 🛠️ **Tecnologías**

### **Core Framework**
- **Next.js 15** - Framework React de producción
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Utility-first CSS

### **Blockchain & XION**
- **@cosmjs/cosmwasm-stargate** - Interacción con CosmWasm
- **@cosmjs/stargate** - Cliente Cosmos SDK
- **@cosmjs/proto-signing** - Firma de transacciones
- **@cosmjs/amino** - Codificación Amino

### **UI & UX**
- **Lucide React** - Iconos modernos
- **Radix UI** - Componentes accesibles
- **Axios** - Cliente HTTP

## 🚀 **Instalación y Uso**

### **1. Instalar Dependencias**
```bash
cd frontend
npm install
```

### **2. Configurar Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_XION_NETWORK=testnet
```

### **3. Ejecutar en Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### **4. Construir para Producción**
```bash
npm run build
npm start
```

## 🎯 **Diferencias con Flutter**

| Aspecto | Flutter (Anterior) | Next.js (Actual) |
|---------|-------------------|------------------|
| **Lenguaje** | Dart | TypeScript/JavaScript |
| **XION** | Integración limitada | SDK nativo completo |
| **Desarrollo** | Mobile-first | Web-first universal |
| **Performance** | App nativa | SSR optimizado |
| **Ecosistema** | Limitado para blockchain | Rico en librerías Web3 |

**🎉 El frontend Next.js ofrece una integración mucho más robusta con XION y mejor experiencia de desarrollo!**
