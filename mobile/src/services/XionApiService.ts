/**
 * XION API Service for Mobile
 * Real blockchain integration with fallback simulation
 * Based on working web implementation
 */

import '../utils/polyfills'; // Import polyfills first!
import AsyncStorage from '@react-native-async-storage/async-storage';
import { XION_CONFIG, DEVELOPMENT_CONFIG } from '../config/xion';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Buffer } from 'buffer';

// XION API response types
export interface XIONWallet {
  address: string;
  publicKey: string;
  mnemonic?: string; // Only returned during creation
  keyType: 'secp256k1' | 'ed25519';
  zkTLS?: {
    enabled: boolean;
    proofGenerated: boolean;
    identityVerified: boolean;
    verificationLevel?: 'basic' | 'enhanced' | 'full';
  };
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
  zkTLS?: boolean; // Enable zkTLS features
}

export interface AuthenticationRequest {
  address: string;
  signature: string;
  message: string;
}

interface ContentRegistration {
  contentHash: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    timestamp: string;
  };
  zkTLS?: {
    proofGenerated: boolean;
    identityVerified: boolean;
  };
}

interface VerificationRequest {
  contentHash: string;
  sourceUrl?: string;
}

interface VerificationResult {
  contentHash: string;
  isAuthentic: boolean;
  confidence: number;
  registrationInfo?: {
    originalCreator: string;
    registrationDate: string;
    blockchain: {
      network: string;
      blockHeight: number;
      transactionHash: string;
    };
  };
  zkTLS?: {
    sourceVerified: boolean;
    identityConfirmed: boolean;
    proofValidated: boolean;
  };
}

class XIONApiService {
  private baseUrl: string;
  private wallet: XIONWallet | null = null;
  private signingClient: SigningStargateClient | null = null;

  constructor() {
    this.baseUrl = XION_CONFIG.restUrl;
  }

  /**
   * Create a new XION wallet with enhanced zkTLS support
   * Uses Abstraxion for real integration only
   */
  async createWallet(request: CreateWalletRequest): Promise<XIONWallet> {
    try {
      console.log('🔄 Creating XION wallet...');

      // Always use real XION integration via Abstraxion
      console.log('⛓️ Creating real XION wallet with Abstraxion...');
      
      // The wallet creation should be handled by Abstraxion modal
      // Return a pending wallet that will be updated by AuthContext
      const wallet = await this.createAbstraxionWallet(request);
      if (wallet) {
        return wallet;
      }

      // If Abstraxion fails, throw error
      throw new Error('Abstraxion wallet creation failed');
    } catch (error) {
      console.error('❌ Wallet creation error:', error);
      throw new Error('Failed to create wallet: ' + (error as Error).message);
    }
  }

  /**
   * Create a wallet using Abstraxion (recommended for XION)
   */
  private async createAbstraxionWallet(request: CreateWalletRequest): Promise<XIONWallet | null> {
    try {
      console.log('🔄 Creating wallet via Abstraxion...');
      
      // Abstraxion handles wallet creation through its modal
      // The actual wallet details will be available through useAbstraxionAccount hook
      // after the user completes the Abstraxion flow in the UI
      
      // For now, return a temporary pending wallet that will be updated by AuthContext
      // when the real Abstraxion account becomes available
      const pendingWallet: XIONWallet = {
        address: 'pending_abstraxion_creation',
        publicKey: 'pending_abstraxion_creation',
        keyType: 'secp256k1',
        zkTLS: request.zkTLS ? {
          enabled: true,
          proofGenerated: false,
          identityVerified: false,
          verificationLevel: 'basic'
        } : undefined
      };

      console.log('✅ Abstraxion wallet creation initiated - waiting for user completion');
      return pendingWallet;
    } catch (error) {
      console.error('❌ Abstraxion wallet creation failed:', error);
      return null;
    }
  }

  /**
   * Create a real wallet using Cosmos SDK (fallback method)
   */
  private async createRealWallet(request: CreateWalletRequest): Promise<XIONWallet | null> {
    try {
      // Generate mnemonic
      const wallet = await DirectSecp256k1HdWallet.generate(12, {
        prefix: XION_CONFIG.bech32Prefix,
      });

      const [firstAccount] = await wallet.getAccounts();
      const mnemonic = wallet.mnemonic;

      // Store wallet securely
      await this.storeWalletSecurely({
        address: firstAccount.address,
        publicKey: Buffer.from(firstAccount.pubkey).toString('hex'),
        mnemonic,
        keyType: 'secp256k1',
        zkTLS: request.zkTLS ? {
          enabled: true,
          proofGenerated: false,
          identityVerified: false,
          verificationLevel: 'basic'
        } : undefined
      });

      this.wallet = {
        address: firstAccount.address,
        publicKey: Buffer.from(firstAccount.pubkey).toString('hex'),
        mnemonic,
        keyType: 'secp256k1',
        zkTLS: request.zkTLS ? {
          enabled: true,
          proofGenerated: false,
          identityVerified: false,
          verificationLevel: 'basic'
        } : undefined
      };

      console.log('✅ Real XION wallet created:', firstAccount.address);
      return this.wallet;
    } catch (error) {
      console.error('❌ Real wallet creation failed:', error);
      return null;
    }
  }

  /**
   * Store wallet securely using AsyncStorage
   */
  private async storeWalletSecurely(wallet: XIONWallet): Promise<void> {
    try {
      const walletData = {
        address: wallet.address,
        publicKey: wallet.publicKey,
        // Don't store private key for security
        keyType: wallet.keyType,
        zkTLS: wallet.zkTLS,
        createdAt: new Date().toISOString()
      };

      await AsyncStorage.setItem('xion_wallet', JSON.stringify(walletData));
      
      // Store mnemonic separately and securely (in a real app, use keychain)
      if (wallet.mnemonic) {
        await AsyncStorage.setItem('xion_mnemonic', wallet.mnemonic);
      }
    } catch (error) {
      console.error('❌ Failed to store wallet:', error);
    }
  }

  /**
   * Load existing wallet from storage
   */
  async loadExistingWallet(): Promise<XIONWallet | null> {
    try {
      const walletData = await AsyncStorage.getItem('xion_wallet');
      if (!walletData) {
        return null;
      }

      const wallet = JSON.parse(walletData);
      const mnemonic = await AsyncStorage.getItem('xion_mnemonic');

      this.wallet = {
        ...wallet,
        mnemonic: mnemonic || undefined
      };

      console.log('✅ Loaded existing XION wallet:', wallet.address);
      return this.wallet;
    } catch (error) {
      console.error('❌ Failed to load wallet:', error);
      return null;
    }
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): XIONWallet | null {
    return this.wallet;
  }

  /**
   * Check if the current wallet is connected and valid (not pending)
   */
  isWalletConnected(): boolean {
    return !!(this.wallet && 
      this.wallet.address !== 'pending_abstraxion_creation' && 
      this.wallet.publicKey !== 'pending_abstraxion_creation');
  }

  /**
   * Update the current wallet (used by AuthContext when Abstraxion connects)
   */
  updateWallet(wallet: XIONWallet): void {
    this.wallet = wallet;
    // Store the updated wallet
    this.storeWalletSecurely(wallet);
    console.log('✅ Wallet updated:', wallet.address);
  }

  /**
   * Complete zkTLS verification for an existing wallet
   */
  async completeZkTLSVerification(address: string): Promise<{ success: boolean; verificationLevel: string }> {
    try {
      console.log('� Attempting real zkTLS verification...');
      
      // TODO: Implement real zkTLS service integration
      // This would call the actual XION zkTLS verification service
      
      // For now, throw error until real implementation is ready
      throw new Error('Real zkTLS verification not yet implemented');
    } catch (error) {
      console.error('❌ zkTLS verification failed:', error);
      throw error;
    }
  }

  /**
   * Request testnet tokens from XION faucet
   */
  async requestFaucetTokens(address: string): Promise<{ success: boolean; txHash?: string }> {
    try {
      console.log('� Requesting tokens from XION faucet...');
      
      // Real faucet request
      const response = await fetch(`${XION_CONFIG.api.faucet}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          denom: 'uxion'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Faucet request successful:', data.txHash);
        return {
          success: true,
          txHash: data.txHash
        };
      } else {
        throw new Error(`Faucet request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Faucet request failed:', error);
      throw error;
    }
  }

  /**
   * Register content on XION blockchain
   */
  async registerContent(registration: ContentRegistration): Promise<{ success: boolean; txHash?: string }> {
    try {
      console.log('🔄 Registering content on XION blockchain...');

      // Check if wallet is properly connected
      if (!this.isWalletConnected()) {
        console.error('❌ XION wallet not connected');
        throw new Error('XION wallet not connected');
      }

      console.log('✅ Wallet is connected:', this.wallet?.address);

      // Real blockchain implementation using Abstraxion
      console.log('⛓️ Submitting to real XION blockchain...');
      
      // TODO: Implement real smart contract call
      // This would normally call the content registry contract via Abstraxion signing client
      throw new Error('Real blockchain integration not yet implemented');
    } catch (error) {
      console.error('❌ Content registration failed:', error);
      throw error;
    }
  }

  /**
   * Verify content authenticity
   */
  async verifyContent(request: VerificationRequest): Promise<VerificationResult> {
    try {
      console.log('🔄 Verifying content authenticity...');

      // Real blockchain implementation
      console.log('⛓️ Querying real XION blockchain...');
      
      // TODO: Implement real blockchain query
      // This would query the content registry contract on XION blockchain
      throw new Error('Real blockchain verification not yet implemented');
    } catch (error) {
      console.error('❌ Content verification failed:', error);
      throw new Error('Verification failed: ' + (error as Error).message);
    }
  }

  /**
   * Clear wallet data (logout)
   */
  async clearWallet(): Promise<void> {
    try {
      await AsyncStorage.removeItem('xion_wallet');
      await AsyncStorage.removeItem('xion_mnemonic');
      this.wallet = null;
      this.signingClient = null;
      console.log('✅ Wallet data cleared');
    } catch (error) {
      console.error('❌ Failed to clear wallet:', error);
    }
  }
}

// Export singleton instance
export const xionApiService = new XIONApiService();
export default xionApiService;
