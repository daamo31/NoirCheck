# 📋 NoirCheck - Especificaciones Técnicas Completas

## 📱 Mobile Application (React Native + Expo)

### Dependencies Matrix

#### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~53.0.20 | Desarrollo y build multiplataforma |
| `react` | 19.0.0 | Framework UI base |
| `react-native` | 0.79.5 | Framework móvil nativo |
| `expo-router` | ~5.1.4 | Routing avanzado |
| `typescript` | ~5.8.3 | Tipado estático |

#### XION Blockchain Integration
| Package | Version | Purpose |
|---------|---------|---------|
| `@burnt-labs/abstraxion` | ^1.0.0-alpha.65 | SDK oficial Abstraxion |
| `@cosmjs/proto-signing` | ^0.34.0 | Firma de transacciones |
| `@cosmjs/stargate` | ^0.34.0 | Cliente Cosmos SDK |
| `@cosmjs/amino` | ^0.34.0 | Codificación amino |
| `@cosmjs/cosmwasm-stargate` | ^0.34.0 | Contratos inteligentes |

#### Cryptography & Security
| Package | Version | Purpose |
|---------|---------|---------|
| `crypto-js` | ^4.2.0 | Hashing SHA-256 nativo |
| `buffer` | ^6.0.3 | Buffer polyfill |
| `react-native-get-random-values` | ^1.11.0 | Crypto random values |
| `react-native-polyfill-globals` | ^3.1.0 | Polyfills globales |
| `@noble/hashes` | ^1.8.0 | Algoritmos hash seguros |

#### Storage & Persistence
| Package | Version | Purpose |
|---------|---------|---------|
| `@react-native-async-storage/async-storage` | ^2.2.0 | Almacenamiento local |

#### Media & Camera
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-camera` | ^16.1.11 | Captura de cámara |
| `expo-image-picker` | ^16.1.4 | Selección de galería |
| `expo-media-library` | ^17.1.7 | Acceso a librería media |
| `expo-image` | ~2.4.0 | Optimización de imágenes |

#### UI & Navigation
| Package | Version | Purpose |
|---------|---------|---------|
| `@expo/vector-icons` | ^14.1.0 | Iconografía |
| `react-native-reanimated` | ~3.17.4 | Animaciones fluidas |
| `react-native-gesture-handler` | ~2.24.0 | Gestos táctiles |
| `react-native-safe-area-context` | 5.4.0 | Safe areas |
| `react-native-screens` | ~4.11.1 | Optimización pantallas |

### Configuration Files

#### package.json
```json
{
  "name": "noircheck-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "reset": "expo start --clear"
  }
}
```

#### metro.config.js
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
```

#### app.json
```json
{
  "expo": {
    "name": "NoirCheck",
    "slug": "noircheck-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a1a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.noircheck.mobile"
    },
    "android": {
      "package": "com.noircheck.mobile",
      "permissions": [
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## 🖥️ Frontend Application (Next.js + React)

### Dependencies Matrix

#### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.3.5 | Framework React SSR |
| `react` | 19.0.0 | Framework UI base |
| `react-dom` | 19.0.0 | React DOM rendering |
| `typescript` | ^5.0.0 | Tipado estático |

#### Styling & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | CSS framework |
| `@tailwindcss/forms` | ^0.5.0 | Estilos formularios |
| `lucide-react` | ^0.400.0 | Iconografía |

#### XION Integration
| Package | Version | Purpose |
|---------|---------|---------|
| `@burnt-labs/abstraxion` | ^1.0.0-alpha.65 | SDK Abstraxion |
| `@cosmjs/stargate` | ^0.34.0 | Cliente Cosmos |

### Configuration Files

#### next.config.js
```javascript
const nextConfig = {
  experimental: {
    turbo: true,
    optimizePackageImports: ['lucide-react']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    return config;
  }
};

module.exports = nextConfig;
```

#### tailwind.config.js
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        }
      }
    }
  }
};
```

## 🐍 Backend Application (Python + FastAPI)

### Dependencies Matrix

#### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.109.2 | Framework API REST |
| `uvicorn[standard]` | 0.27.1 | Servidor ASGI |
| `python-multipart` | 0.0.9 | Manejo multipart |
| `pydantic` | 2.6.1 | Validación datos |

#### Database & ORM
| Package | Version | Purpose |
|---------|---------|---------|
| `sqlalchemy` | 2.0.25 | ORM database |
| `alembic` | 1.13.1 | Migraciones |

#### Security & Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| `passlib[bcrypt]` | 1.7.4 | Hashing passwords |
| `python-jose[cryptography]` | 3.3.0 | JWT tokens |
| `python-multipart` | 0.0.9 | Form data |

#### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `python-dotenv` | 1.0.1 | Variables entorno |
| `httpx` | 0.26.0 | Cliente HTTP |

### Configuration Files

#### requirements.txt
```txt
fastapi==0.109.2
uvicorn[standard]==0.27.1
sqlalchemy==2.0.25
alembic==1.13.1
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
python-dotenv==1.0.1
httpx==0.26.0
```

#### alembic.ini
```ini
[alembic]
script_location = alembic
sqlalchemy.url = sqlite:///./noircheck.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic
```

## 🔐 XION Configuration

### Network Settings
```typescript
export const XION_CONFIG = {
  // Production Network
  chainId: 'xion-testnet-2',
  rpcUrl: 'https://rpc.xion-testnet-2.burnt.com:443',
  restUrl: 'https://api.xion-testnet-2.burnt.com',
  
  // Fallback Endpoints
  fallbackEndpoints: [
    'https://api.xion-testnet-2.burnt.com',
    'https://rpc.xion-testnet-2.burnt.com:443',
    'https://api.xion-testnet-1.burnt.com'
  ],
  
  // Smart Contracts
  contracts: {
    contentRegistry: 'xion1hwlc07l2kyw309vemx4ptz0yggxx6683nww6rs8fdvy0px008nesu0zymq',
    verification: 'xion1nmdmd3tg26cm3c6ullt3adzehfh3rf2j49aqj88pm9s5hyk9qm2swun3qp'
  },
  
  // Network Parameters
  bech32Prefix: 'xion',
  coinType: 118,
  gasPrice: '0.025uxion',
  
  // Feature Flags
  features: {
    zkTLS: true,
    abstractAccounts: true,
    gaslessTransactions: true,
    biometricAuth: true
  }
};
```

### Abstraxion Configuration
```typescript
// Mobile App (React Native)
<AbstraxionProvider
  config={{
    restUrl: "https://api.xion-testnet-2.burnt.com",
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com"
  }}
>

// Web App (Next.js)
<AbstraxionProvider
  config={{
    restUrl: "https://api.xion-testnet-2.burnt.com",
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com",
    stake: false,
    testnet: true
  }}
>
```

## 🔧 Development Environment

### Node.js Versions
- **Frontend**: Node.js 18+ LTS
- **Mobile**: Node.js 18+ LTS
- **Tools**: npm 9+, Expo CLI 6+

### Python Environment
- **Backend**: Python 3.11+
- **Virtual Environment**: venv recommended
- **Package Manager**: pip

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Visual Studio Code | Latest | IDE principal |
| Expo Dev Tools | Latest | Mobile debugging |
| Postman | Latest | API testing |
| DB Browser for SQLite | Latest | Database management |

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=sqlite:///./noircheck.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_XION_RPC_URL=https://rpc.xion-testnet-2.burnt.com:443
NEXT_PUBLIC_XION_REST_URL=https://api.xion-testnet-2.burnt.com

# Mobile (expo constants)
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_XION_RPC_URL=https://rpc.xion-testnet-2.burnt.com:443
EXPO_PUBLIC_XION_REST_URL=https://api.xion-testnet-2.burnt.com
```

## 🚀 Deployment Specifications

### Mobile Deployment
- **iOS**: App Store Connect, TestFlight
- **Android**: Google Play Console, Internal Testing
- **Over-the-Air**: Expo Updates (EAS)

### Web Deployment
- **Platform**: Vercel, Netlify
- **Build**: Static export, SSR
- **CDN**: Edge network distribution

### Backend Deployment
- **Platform**: Railway, Render, AWS
- **Database**: SQLite → PostgreSQL (production)
- **Monitoring**: Health checks, logging

## 📊 Performance Metrics

### Mobile App
- **Bundle Size**: <50MB total
- **Startup Time**: <3 seconds cold start
- **Memory Usage**: <150MB average
- **Battery Impact**: Minimal background usage

### Web App
- **Page Load**: <2 seconds FCP
- **Bundle Size**: <1MB gzipped
- **SEO**: Lighthouse 90+ score
- **Accessibility**: WCAG 2.1 AA compliant

### Backend API
- **Response Time**: <200ms average
- **Throughput**: 100+ req/s
- **Uptime**: 99.9% target
- **Database**: <10ms query time

---

**📅 Última actualización**: Agosto 2025
**🔄 Estado**: Producción activa con integración XION completa
