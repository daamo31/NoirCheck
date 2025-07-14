/**
 * XION Configuration for NoirCheck
 * Configuration settings for XION blockchain integration
 */

// XION Testnet Configuration
export const XION_CONFIG = {
  // Chain configuration
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || 'xion-testnet-2',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.xion-testnet-2.burnt.com:443',
  restUrl: process.env.NEXT_PUBLIC_REST_URL || 'https://api.xion-testnet-2.burnt.com',
  
  // Contract addresses
  contracts: [
    {
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'xion1hwlc07l2kyw309vemx4ptz0yggxx6683nww6rs8fdvy0px008nesu0zymq',
      name: 'NoirCheck Main Contract'
    }
  ],
  
  // Treasury configuration
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 'xion1nmdmd3tg26cm3c6ullt3adzehfh3rf2j49aqj88pm9s5hyk9qm2swun3qp',
  
  // Abstraxion configuration
  testnet: true,
  dev: process.env.NODE_ENV === 'development',
  autoConnect: false, // We'll handle connection manually
  stake: false,
  
  // Wallet connection options
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    metadata: {
      name: 'NoirCheck',
      description: 'Digital Content Authenticity Verification Platform',
      url: 'https://noircheck.app',
      icons: ['https://noircheck.app/icon.png']
    }
  }
};

// Get minimal configuration to prevent any authentication issues
export function getXIONConfig() {
  return {
    contracts: XION_CONFIG.contracts,
    treasuryAddress: XION_CONFIG.treasuryAddress,
    testnet: XION_CONFIG.testnet,
    autoConnect: false,
    stake: false,
    dev: XION_CONFIG.dev,
    chainId: XION_CONFIG.chainId,
    rpcUrl: XION_CONFIG.rpcUrl,
    restUrl: XION_CONFIG.restUrl
  };
}

// Connection configuration for different wallet types
export const WALLET_CONFIG = {
  // Browser extension wallets
  keplr: {
    chainId: XION_CONFIG.chainId,
    chainName: 'XION Testnet',
    rpc: XION_CONFIG.rpcUrl,
    rest: XION_CONFIG.restUrl,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'xion',
      bech32PrefixAccPub: 'xionpub',
      bech32PrefixValAddr: 'xionvaloper',
      bech32PrefixValPub: 'xionvaloperpub',
      bech32PrefixConsAddr: 'xionvalcons',
      bech32PrefixConsPub: 'xionvalconspub',
    },
    currencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: 'XION',
      coinMinimalDenom: 'uxion',
      coinDecimals: 6,
    },
  }
};
