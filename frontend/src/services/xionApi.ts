/**
 * XION API Service
 * 
 * Handles direct integration with XION blockchain API for:
 * - Wallet creation
 * - Authentication
 * - Transaction management
 * - zkTLS integration
 */

import { XION_CONFIG } from '@/config/xion';

// XION API response types
export interface XIONWallet {
  address: string;
  publicKey: string;
  mnemonic?: string; // Only returned during creation
  keyType: 'secp256k1' | 'ed25519';
}

export interface XIONAccount {
  address: string;
  sequence: string;
  accountNumber: string;
  balance: Array<{
    denom: string;
    amount: string;
  }>;
}

export interface XIONTransaction {
  txHash: string;
  height: number;
  gasUsed: string;
  gasWanted: string;
  code: number;
  logs: any[];
}

export interface CreateWalletRequest {
  username?: string;
  keyType?: 'secp256k1' | 'ed25519';
  entropy?: string; // Optional custom entropy
}

export interface AuthenticationRequest {
  address: string;
  signature: string;
  message: string;
}

class XIONApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = XION_CONFIG.restUrl;
    this.apiKey = process.env.NEXT_PUBLIC_XION_API_KEY;
  }

  /**
   * Create a new XION wallet
   * NOTE: This is a placeholder - actual implementation depends on XION API documentation
   */
  async createWallet(request: CreateWalletRequest): Promise<XIONWallet> {
    try {
      // This would be the actual XION API call
      const response = await fetch(`${this.baseUrl}/xion/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          key_type: request.keyType || 'secp256k1',
          username: request.username,
          entropy: request.entropy
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        address: data.address,
        publicKey: data.public_key,
        mnemonic: data.mnemonic,
        keyType: data.key_type
      };
    } catch (error) {
      console.error('Wallet creation failed:', error);
      throw error;
    }
  }

  /**
   * Import existing wallet from mnemonic
   */
  async importWallet(mnemonic: string, keyType: 'secp256k1' | 'ed25519' = 'secp256k1'): Promise<XIONWallet> {
    try {
      const response = await fetch(`${this.baseUrl}/xion/wallet/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          mnemonic,
          key_type: keyType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to import wallet: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        address: data.address,
        publicKey: data.public_key,
        keyType: data.key_type
      };
    } catch (error) {
      console.error('Wallet import failed:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccount(address: string): Promise<XIONAccount> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/auth/v1beta1/accounts/${address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get account: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        address: data.account.address,
        sequence: data.account.sequence,
        accountNumber: data.account.account_number,
        balance: []
      };
    } catch (error) {
      console.error('Failed to get account:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<Array<{ denom: string; amount: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/bank/v1beta1/balances/${address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.statusText}`);
      }

      const data = await response.json();
      return data.balances || [];
    } catch (error) {
      console.error('Failed to get balance:', error);
      return [];
    }
  }

  /**
   * Authenticate with XION using signature
   */
  async authenticate(request: AuthenticationRequest): Promise<{ token: string; expires: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/xion/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        token: data.token,
        expires: data.expires
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Generate authentication message for signing
   */
  generateAuthMessage(address: string, nonce: string): string {
    const timestamp = Date.now();
    return `NoirCheck Authentication\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
  }

  /**
   * Request tokens from faucet (testnet only)
   */
  async requestFaucetTokens(address: string): Promise<XIONTransaction> {
    try {
      const response = await fetch(`${this.baseUrl}/xion/faucet/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          amount: '1000000' // 1 XION (in microXION)
        })
      });

      if (!response.ok) {
        throw new Error(`Faucet request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        txHash: data.tx_hash,
        height: data.height,
        gasUsed: data.gas_used,
        gasWanted: data.gas_wanted,
        code: data.code,
        logs: data.logs
      };
    } catch (error) {
      console.error('Faucet request failed:', error);
      throw error;
    }
  }

  /**
   * Validate XION address format
   */
  validateAddress(address: string): boolean {
    // XION addresses start with 'xion' and are bech32 encoded
    const xionAddressRegex = /^xion[a-z0-9]{39}$/;
    return xionAddressRegex.test(address);
  }

  /**
   * Generate a random nonce for authentication
   */
  generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const xionApiService = new XIONApiService();
