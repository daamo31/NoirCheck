/**
 * XION Configuration for Mobile App
 * Real blockchain integration settings
 */

export const XION_CONFIG = {
  // XION Testnet configuration
  chainId: 'xion-testnet-1',
  chainName: 'XION Testnet',
  rpcUrl: 'https://rpc.xion-testnet-1.burnt.com:443',
  restUrl: 'https://api.xion-testnet-1.burnt.com',
  
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
    faucet: 'https://faucet.xion-testnet-1.burnt.com',
    explorer: 'https://explorer.xion-testnet-1.burnt.com',
    zkTLS: 'https://zktls.xion.network'
  }
};

export const DEVELOPMENT_CONFIG = {
  // Development/demo mode settings
  useMockData: process.env.NODE_ENV === 'development',
  enableLogging: true,
  simulateNetworkDelay: 1000,
  mockWalletPrefix: 'xion1mock'
};
