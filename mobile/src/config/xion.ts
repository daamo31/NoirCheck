/**
 * XION Configuration for Mobile App
 * Real blockchain integration settings
 */

export const XION_CONFIG = {
  // XION Testnet configuration
  chainId: 'xion-testnet-2',
  chainName: 'XION Testnet 2',
  rpcUrl: 'https://rpc.xion-testnet-2.burnt.com:443',
  restUrl: 'https://api.xion-testnet-2.burnt.com',
  
  // Fallback endpoints in case primary is down
  fallbackEndpoints: [
    'https://api.xion-testnet-2.burnt.com',
    'https://rpc.xion-testnet-2.burnt.com:443',
    'https://api.xion-testnet-1.burnt.com', // Previous testnet as fallback
  ],
  
  // Gas settings
  gasPrice: '0.025uxion',
  gasPriceAmount: {
    denom: 'uxion',
    amount: '0.025'
  },
  
  // Network info
  bech32Prefix: 'xion',
  coinType: 118,
  
  // Contract addresses
  contracts: {
    contentRegistry: process.env.EXPO_PUBLIC_CONTENT_REGISTRY_CONTRACT || 'xion1hwlc07l2kyw309vemx4ptz0yggxx6683nww6rs8fdvy0px008nesu0zymq',
    verification: process.env.EXPO_PUBLIC_VERIFICATION_CONTRACT || 'xion1nmdmd3tg26cm3c6ullt3adzehfh3rf2j49aqj88pm9s5hyk9qm2swun3qp'
  },
  
  // Feature flags
  features: {
    zkTLS: true,
    abstractAccounts: true,
    gaslessTransactions: true,
    biometricAuth: true
  },
  
  // API endpoints
  api: {
    faucet: 'https://faucet.xion-testnet-2.burnt.com',
    explorer: 'https://explorer.xion-testnet-2.burnt.com',
    zkTLS: 'https://zktls.xion.network'
  },

  // Abstraxion configuration
  testnet: true,
  dev: __DEV__,
  autoConnect: false,
  stake: false
};

// Development configuration for testing
export const DEVELOPMENT_CONFIG = {
  // Always use real XION integration - no simulation
  simulateAPI: false,
  debugMode: true,
  logLevel: 'verbose' as const
};
