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
  
  // Contract addresses (if using smart contracts)
  contracts: {
    contentRegistry: process.env.EXPO_PUBLIC_CONTENT_REGISTRY_CONTRACT || '',
    verification: process.env.EXPO_PUBLIC_VERIFICATION_CONTRACT || ''
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
  }
};

export const DEVELOPMENT_CONFIG = {
  // Production settings - Real blockchain integration only
  useMockData: false, // Always use real blockchain
  enableLogging: true,
  simulateNetworkDelay: 0, // No artificial delays
};
