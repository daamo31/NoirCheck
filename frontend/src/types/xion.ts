/**
 * XION Integration Type Definitions
 * 
 * TypeScript definitions for XION-specific functionality in NoirCheck
 */

// XION Account and Authentication Types
export interface XIONAccount {
  bech32Address: string;
  pubKey?: Uint8Array;
  isConnected: boolean;
}

export interface XIONConnection {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  networkName?: string;
  account?: XIONAccount;
}

// Contract Types
export interface ContentRegistryContract {
  address: string;
  codeId?: number;
  instantiateMsg?: any;
}

export interface TreasuryContract {
  address: string;
  balance?: {
    amount: string;
    denom: string;
  };
  feeGrantsEnabled: boolean;
  authorizationGrantsEnabled: boolean;
}

// Content Record Types (stored on-chain)
export interface OnChainContentRecord {
  content_hash: string;
  creator_address: string;
  timestamp: string;
  metadata: {
    filename?: string;
    description?: string;
    file_size?: number;
    content_type?: string;
    noircheck_version?: string;
  };
  verification_count: number;
  last_verified?: string;
  registered_via: string;
}

// Transaction Types
export interface XIONTransaction {
  hash: string;
  height: number;
  gasUsed: string;
  gasWanted: string;
  fee: {
    amount: string;
    denom: string;
  };
  memo?: string;
}

export interface RegistrationTransaction extends XIONTransaction {
  content_hash: string;
  creator_address: string;
  contract_address: string;
}

// Contract Interaction Results
export interface ContractRegistrationResult {
  success: boolean;
  transaction?: XIONTransaction;
  content_hash: string;
  message: string;
  error?: string;
}

export interface ContractVerificationResult {
  found: boolean;
  content_hash: string;
  original: boolean;
  confidence: number;
  blockchain_verified: boolean;
  record?: OnChainContentRecord;
  message: string;
  error?: string;
}

// XION Network Configuration
export interface XIONNetworkConfig {
  chainId: string;
  chainName: string;
  rpcEndpoint: string;
  restEndpoint: string;
  explorer?: string;
  faucet?: string;
}

// Environment Configuration
export interface XIONEnvironmentConfig {
  contractAddress?: string;
  treasuryAddress?: string;
  rpcUrl?: string;
  restUrl?: string;
  network: 'testnet' | 'mainnet' | 'local';
}

// Fee and Gas Types
export interface TransactionFee {
  amount: Array<{
    amount: string;
    denom: string;
  }>;
  gas: string;
}

export interface GaslessTransaction {
  enabled: boolean;
  feeGranter?: string;
  maxGas?: string;
}

// Authorization Types
export interface AuthorizationGrant {
  granter: string;
  grantee: string;
  authorization: {
    type: string;
    limit?: any;
    expiration?: string;
  };
}

// Meta Account Integration
export interface MetaAccountAuth {
  method: 'email' | 'social' | 'wallet' | 'passkey';
  isConnected: boolean;
  userInfo?: {
    email?: string;
    name?: string;
    avatar?: string;
  };
}

// XION Service Status
export interface XIONServiceStatus {
  contracts: {
    contentRegistry: {
      configured: boolean;
      address?: string;
      accessible: boolean;
    };
    treasury: {
      configured: boolean;
      address?: string;
      balance?: string;
      gaslessEnabled: boolean;
    };
  };
  network: {
    connected: boolean;
    chainId?: string;
    blockHeight?: number;
    rpcUrl?: string;
  };
  authentication: {
    isConnected: boolean;
    method?: string;
    address?: string;
  };
}

// Error Types
export interface XIONError {
  code: string;
  message: string;
  details?: any;
  transactionHash?: string;
}

// Hook Return Types
export interface UseXIONContractReturn {
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
  contractInfo: {
    contentRegistry: string | null;
    treasury: string | null;
    rpcUrl: string | null;
    restUrl: string | null;
    isConfigured: boolean;
  };
  registerContent: (
    contentHash: string,
    metadata: OnChainContentRecord['metadata']
  ) => Promise<ContractRegistrationResult>;
  verifyContent: (contentHash: string) => Promise<ContractVerificationResult>;
  getTreasuryBalance: () => Promise<{ balance: string; denom: string } | null>;
  clearError: () => void;
}

export interface UseXIONAccountReturn {
  account: XIONAccount | null;
  isConnected: boolean;
  client: any;
  address: string | null;
  isReady: boolean;
}
