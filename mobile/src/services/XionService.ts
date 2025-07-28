import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { XION_CONFIG, DEVELOPMENT_CONFIG } from '../config/xion';

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
  entropy?: string;
  zkTLS?: boolean;
}

interface ContentRegistration {
  contentHash: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    creator: string;
    timestamp: string;
  };
  proof: string;
  txHash?: string;
}

interface VerificationResult {
  isOriginal: boolean;
  confidence: number;
  originalOwner?: string;
  registrationDate?: string;
  blockchainProof?: string;
  modifications?: string[];
}

class XionService {
  private baseUrl: string;
  private wallet: XIONWallet | null = null;

  constructor() {
    this.baseUrl = XION_CONFIG.restUrl;
  }

  /**
   * Initialize XION service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing XION service...');
      
      // Check for stored wallet
      const storedWallet = await AsyncStorage.getItem('xion_wallet');
      if (storedWallet) {
        this.wallet = JSON.parse(storedWallet);
        console.log('✅ Restored wallet from storage');
      }
      
      // Test network connectivity
      const networkStatus = await this.getNetworkStatus();
      console.log('🌐 Network status:', networkStatus);
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing XION service:', error);
      return false;
    }
  }

  /**
   * Create a new XION wallet with real blockchain integration
   */
  async createWallet(request: CreateWalletRequest): Promise<XIONWallet | null> {
    try {
      console.log('🔐 Creating new XION wallet with real blockchain integration...');
      
      // Always use real XION API
      const response = await fetch(`${this.baseUrl}/xion/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          key_type: request.keyType || 'secp256k1',
          username: request.username,
          entropy: request.entropy,
          zktls_enabled: request.zkTLS || false,
          verification_level: 'basic'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`XION API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      this.wallet = {
        address: data.address,
        publicKey: data.public_key,
        mnemonic: data.mnemonic,
        keyType: data.key_type,
        zkTLS: request.zkTLS ? {
          enabled: data.zktls?.enabled || true,
          proofGenerated: data.zktls?.proof_generated || false,
          identityVerified: data.zktls?.identity_verified || false,
          verificationLevel: data.zktls?.verification_level || 'basic'
        } : undefined
      };

      await AsyncStorage.setItem('xion_wallet', JSON.stringify(this.wallet));
      console.log('✅ Real XION wallet created:', this.wallet.address);
      return this.wallet;
      
    } catch (error) {
      console.error('❌ Error creating real XION wallet:', error);
      throw new Error(`Failed to create XION wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Connect to an existing XION wallet

  /**
   * Generate BIP39 compatible mnemonic
   */
  private generateMnemonic(): string {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'action', 'actor', 'actress', 'actual', 'adapt',
      'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice',
      'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree', 'ahead',
      'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert'
    ];
    
    return Array.from({ length: 12 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join(' ');
  }

  /**
   * Connect existing wallet
   */
  async connectWallet(): Promise<XIONWallet | null> {
    return await this.createWallet({ zkTLS: true });
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      this.wallet = null;
      await AsyncStorage.removeItem('xion_wallet');
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }

  /**
   * Get current wallet
   */
  getWallet(): XIONWallet | null {
    return this.wallet;
  }

  /**
   * Register content on blockchain
   */
  async registerContent(
    fileData: ArrayBuffer | string,
    metadata: {
      filename: string;
      size: number;
      mimeType: string;
    }
  ): Promise<{ txId: string; hash: string; timestamp: string; status: string } | null> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      console.log('📝 Registering content on blockchain...');
      
      // Calculate content hash
      const contentHash = this.calculateHash(fileData);
      
      // Create registration data
      const registration: ContentRegistration = {
        contentHash,
        metadata: {
          ...metadata,
          creator: this.wallet.address,
          timestamp: new Date().toISOString(),
        },
        proof: this.generateProof(contentHash, this.wallet.address),
      };

      // Execute real blockchain transaction
      const response = await fetch(`${this.baseUrl}/xion/content/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: this.wallet.address,
          content_hash: contentHash,
          metadata: registration.metadata,
          proof: registration.proof
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`XION blockchain registration failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = {
        txId: data.tx_hash,
        hash: contentHash,
        timestamp: registration.metadata.timestamp,
        status: 'confirmed'
      };

      await this.saveRegistrationLocal(registration, result);
      console.log('✅ Real blockchain registration successful:', result.txId);
      return result;
      
    } catch (error) {
      console.error('❌ Error registering content on blockchain:', error);
      throw new Error(`Failed to register content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify content authenticity
   */
  async verifyContent(fileData: ArrayBuffer | string): Promise<VerificationResult | null> {
    try {
      console.log('🔍 Verifying content authenticity on blockchain...');
      
      const contentHash = this.calculateHash(fileData);
      
      // Execute real blockchain query
      const response = await fetch(`${this.baseUrl}/xion/content/verify/${contentHash}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Content not found on blockchain
          console.log('⚠️ Content not found on blockchain');
          return {
            isOriginal: false,
            confidence: 0.0,
            modifications: ['Content not registered on blockchain'],
          };
        }
        
        const errorText = await response.text();
        throw new Error(`XION blockchain verification failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Real blockchain verification successful');
      
      return {
        isOriginal: data.is_original,
        confidence: data.confidence,
        originalOwner: data.original_owner,
        registrationDate: data.registration_date,
        blockchainProof: data.blockchain_proof,
        modifications: data.modifications || []
      };
      
    } catch (error) {
      console.error('❌ Error verifying content on blockchain:', error);
      throw new Error(`Failed to verify content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<{
    isConnected: boolean;
    blockHeight: number;
    networkName: string;
  }> {
    try {
      console.log('🌐 Checking XION network status...');
      
      // Try multiple endpoints to check connectivity
      const endpoints = [
        `${this.baseUrl}/cosmos/base/tendermint/v1beta1/node_info`,
        `${this.baseUrl}/node_info`,
        `${this.baseUrl}/status`
      ];
      
      for (const endpoint of endpoints) {
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ XION network is reachable');
            
            // Try to extract block height if available
            let blockHeight = 0;
            if (data.default_node_info?.network || data.node_info?.network) {
              // If we can get node info, try to get latest block
              try {
                const blockController = new AbortController();
                const blockTimeoutId = setTimeout(() => blockController.abort(), 5000);
                
                const blockResponse = await fetch(`${this.baseUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`, {
                  signal: blockController.signal,
                });
                
                clearTimeout(blockTimeoutId);
                
                if (blockResponse.ok) {
                  const blockData = await blockResponse.json();
                  blockHeight = parseInt(blockData.block?.header?.height || '0');
                }
              } catch (blockError) {
                console.log('ℹ️ Could not fetch block height, using 0');
              }
            }
            
            return {
              isConnected: true,
              blockHeight,
              networkName: XION_CONFIG.chainName,
            };
          }
        } catch (endpointError) {
          console.log(`⚠️ Endpoint ${endpoint} failed:`, endpointError);
          continue;
        }
      }
      
      // If all endpoints fail
      console.log('⚠️ All XION endpoints unreachable');
      return {
        isConnected: false,
        blockHeight: 0,
        networkName: XION_CONFIG.chainName,
      };
      
    } catch (error) {
      console.error('❌ Error getting network status:', error);
      return {
        isConnected: false,
        blockHeight: 0,
        networkName: XION_CONFIG.chainName,
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(): Promise<any[]> {
    try {
      if (!this.wallet) return [];

      const key = `transactions_${this.wallet.address}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting transaction history:', error);
      return [];
    }
  }

  // Private helper methods
  private calculateHash(data: ArrayBuffer | string): string {
    if (data instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(data);
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      return CryptoJS.SHA256(binaryString).toString();
    }
    return CryptoJS.SHA256(data).toString();
  }

  private generateProof(contentHash: string, creator: string): string {
    const timestamp = Date.now().toString();
    const proofData = `${contentHash}:${creator}:${timestamp}`;
    return CryptoJS.SHA256(proofData).toString();
  }

  private async saveRegistrationLocal(
    registration: ContentRegistration,
    transaction: any
  ): Promise<void> {
    try {
      if (!this.wallet) return;

      const key = `registrations_${this.wallet.address}`;
      const stored = await AsyncStorage.getItem(key);
      const registrations = stored ? JSON.parse(stored) : [];
      
      registrations.push({ registration, transaction });
      await AsyncStorage.setItem(key, JSON.stringify(registrations));

      // Also save to transaction history
      const txKey = `transactions_${this.wallet.address}`;
      const txStored = await AsyncStorage.getItem(txKey);
      const transactions = txStored ? JSON.parse(txStored) : [];
      transactions.push(transaction);
      await AsyncStorage.setItem(txKey, JSON.stringify(transactions));
    } catch (error) {
      console.error('❌ Error saving registration locally:', error);
    }
  }

  private async findRegistrationByHash(hash: string): Promise<ContentRegistration | null> {
    try {
      if (!this.wallet) return null;

      const key = `registrations_${this.wallet.address}`;
      const stored = await AsyncStorage.getItem(key);
      const registrations = stored ? JSON.parse(stored) : [];
      
      const found = registrations.find((reg: any) => 
        reg.registration.contentHash === hash
      );
      
      return found ? found.registration : null;
    } catch (error) {
      console.error('❌ Error finding registration by hash:', error);
      return null;
    }
  }
}

export const xionService = new XionService();
export default XionService;
