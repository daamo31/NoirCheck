/**
 * XION Configuration for NoirCheck
 * Configuration settings for XION blockchain integration
 */

// Minimal XION configuration to prevent authentication errors
export const XION_CONFIG = {
  contracts: [],
  // Disable all automatic authentication features
  testnet: true,
  autoConnect: false,
  stake: false,
  // Minimal required configuration
  dev: true,
  // Optional: Add safe defaults
  walletUrl: process.env.NEXT_PUBLIC_XION_WALLET_URL,
  rpcUrl: process.env.NEXT_PUBLIC_XION_RPC_URL,
  chainId: process.env.NEXT_PUBLIC_XION_CHAIN_ID || 'xion-testnet-1'
};

// Get minimal configuration to prevent any authentication issues
export function getXIONConfig() {
  // Always return minimal config in development to prevent auth errors
  return {
    contracts: [],
    testnet: true,
    autoConnect: false,
    stake: false,
    dev: process.env.NODE_ENV === 'development'
  };
}
