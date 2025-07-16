# NoirCheck Frontend Dependencies
# Multi-wallet digital content authenticity verification platform

## Core Framework Dependencies
next@15.3.5                    # React framework with App Router and Turbopack
react@19.0.0                   # React UI library with latest features
react-dom@19.0.0               # React DOM renderer
typescript@5                   # Static typing for JavaScript

## Styling and UI Dependencies
tailwindcss@4.1.11             # Utility-first CSS framework
autoprefixer@10.4.21           # CSS vendor prefixing
lucide-react@0.525.0           # Beautiful SVG icon library

## Wallet Integration Dependencies

### XION Blockchain Integration
@burnt-labs/abstraxion@1.0.0-alpha.65  # XION wallet SDK (when compatible)
@burnt-labs/ui@0.1.0-alpha.17          # XION UI components

### WalletConnect v2 Integration
@walletconnect/core@2.21.4             # WalletConnect v2 core functionality
@walletconnect/sign-client@2.21.4      # Signing client for wallet connections
@walletconnect/qrcode-modal@1.8.0      # QR code modal for mobile pairing

### Optional Cosmos Ecosystem (for future XION integration)
@cosmjs/amino@0.33.1                   # Amino encoding for Cosmos SDK
@cosmjs/cosmwasm-stargate@0.33.1       # CosmWasm client
@cosmjs/proto-signing@0.33.1           # Protobuf signing utilities
@cosmjs/stargate@0.33.1                # Cosmos SDK client
@cosmjs/tendermint-rpc@0.33.1          # Tendermint RPC client
@keplr-wallet/types@0.12.250           # Keplr wallet type definitions

## Development Dependencies
@types/node@20                 # Node.js type definitions
@types/react@19                # React type definitions
@types/react-dom@19            # React DOM type definitions
eslint@9                       # JavaScript/TypeScript linting
eslint-config-next@15.3.5      # ESLint configuration for Next.js

## Additional Dependencies
axios@1.10.0                   # HTTP client for API calls

## Installation Commands

### Install all dependencies
```bash
npm install --legacy-peer-deps
```

### Install only production dependencies
```bash
npm install --production --legacy-peer-deps
```

### Check wallet dependencies
```bash
npm run wallet-check
```

## Supported Node.js Versions
- Node.js >= 18.0.0
- npm >= 8.0.0

## Wallet Compatibility Matrix

| Wallet Type    | Desktop | iOS | Android | WalletConnect |
|---------------|---------|-----|---------|---------------|
| XION Wallet   | ✅      | ✅  | ✅      | ✅            |
| MetaMask      | ✅      | ✅  | ✅      | ✅            |
| Rainbow       | ❌      | ✅  | ✅      | ✅            |
| Trust Wallet  | ❌      | ✅  | ✅      | ✅            |
| Coinbase      | ❌      | ✅  | ✅      | ✅            |
| 100+ Others   | ❌      | ✅  | ✅      | ✅            |

## Deep Linking URLs

### XION Wallet
- **iOS**: `xion://connect?callback={app_url}&app=NoirCheck`
- **Android**: `intent://connect?callback={app_url}#Intent;scheme=xion;package=com.xion.wallet;end`

### MetaMask
- **Universal**: `https://metamask.app.link/dapp/{app_url}`
- **iOS**: `metamask://dapp/{app_url}`
- **Android**: Handled by universal link

## App Store Links

### XION Wallet
- **iOS**: https://apps.apple.com/app/xion-wallet
- **Android**: https://play.google.com/store/apps/details?id=com.xion.wallet

### MetaMask
- **iOS**: https://apps.apple.com/app/metamask/id1438144202
- **Android**: https://play.google.com/store/apps/details?id=io.metamask

## Build Optimizations
- Uses Turbopack for faster development builds
- Tree shaking to reduce bundle size
- Lazy loading of wallet dependencies
- Progressive Web App (PWA) ready configuration

## Security Considerations
- All wallet connections require user approval
- Deep linking validation to prevent malicious apps
- Timeout protection for connection attempts
- Secure storage of wallet addresses (no private keys)
- HTTPS required for production deployments
