/**
 * XION Contract Service
 * 
 * Service for interacting with XION smart contracts including:
 * - Content Registry Contract (stores content hashes and metadata)
 * - Treasury Contract (handles gasless transactions)
 * 
 * Based on XION User Map pattern adapted for content verification.
 */

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Coin } from '@cosmjs/stargate';

// Contract addresses from environment variables
const CONTENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.xion-testnet-1.burnt.com:443';
const REST_URL = process.env.NEXT_PUBLIC_REST_URL || 'https://api.xion-testnet-1.burnt.com';

export interface ContentRecord {
  content_hash: string;
  creator_address: string;
  timestamp: string;
  metadata: {
    filename?: string;
    description?: string;
    file_size?: number;
    content_type?: string;
  };
}

export interface RegistrationResult {
  success: boolean;
  transaction_hash?: string;
  block_height?: number;
  content_hash: string;
  message: string;
}

export interface VerificationResult {
  found: boolean;
  content_hash: string;
  original: boolean;
  confidence: number;
  blockchain_verified: boolean;
  record?: ContentRecord;
  message: string;
}

export class XIONContractService {
  private client: SigningCosmWasmClient | null = null;
  private userAddress: string | null = null;

  /**
   * Initialize the service with signing client
   */
  async initialize(client: SigningCosmWasmClient, userAddress: string) {
    this.client = client;
    this.userAddress = userAddress;
  }

  /**
   * Register content on the XION blockchain
   */
  async registerContent(
    contentHash: string,
    metadata: ContentRecord['metadata']
  ): Promise<RegistrationResult> {
    if (!this.client || !this.userAddress) {
      throw new Error('XION client not initialized');
    }

    if (!CONTENT_REGISTRY_ADDRESS) {
      throw new Error('Content registry contract address not configured');
    }

    try {
      // Prepare contract message for content registration
      const msg = {
        set_user_data: {
          data: JSON.stringify({
            content_hash: contentHash,
            creator_address: this.userAddress,
            timestamp: new Date().toISOString(),
            metadata,
            verification_count: 0,
            registered_via: 'noircheck'
          })
        }
      };

      // Execute contract transaction
      const fee = {
        amount: [{ denom: 'uxion', amount: '2000' }] as Coin[],
        gas: '200000',
      };

      const result = await this.client.execute(
        this.userAddress,
        CONTENT_REGISTRY_ADDRESS,
        msg,
        fee,
        `NoirCheck content registration: ${contentHash.slice(0, 8)}`
      );

      return {
        success: true,
        transaction_hash: result.transactionHash,
        block_height: result.height,
        content_hash: contentHash,
        message: 'Content successfully registered on XION blockchain'
      };

    } catch (error) {
      console.error('Failed to register content:', error);
      return {
        success: false,
        content_hash: contentHash,
        message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Verify content on the XION blockchain
   */
  async verifyContent(contentHash: string): Promise<VerificationResult> {
    if (!this.client || !this.userAddress) {
      throw new Error('XION client not initialized');
    }

    if (!CONTENT_REGISTRY_ADDRESS) {
      throw new Error('Content registry contract address not configured');
    }

    try {
      // Query contract for content record
      const queryMsg = {
        get_user_data: {
          address: this.userAddress
        }
      };

      const queryResult = await this.client.queryContractSmart(
        CONTENT_REGISTRY_ADDRESS,
        queryMsg
      );

      // Parse stored data
      let storedData: any = null;
      if (queryResult?.data) {
        try {
          storedData = JSON.parse(queryResult.data);
        } catch (e) {
          console.warn('Failed to parse stored data:', e);
        }
      }

      // Check if content hash matches
      const found = storedData && storedData.content_hash === contentHash;
      
      if (found) {
        // Update verification count
        await this.incrementVerificationCount(storedData);

        return {
          found: true,
          content_hash: contentHash,
          original: true,
          confidence: 100,
          blockchain_verified: true,
          record: storedData,
          message: 'Content verified on XION blockchain - Original content confirmed'
        };
      } else {
        return {
          found: false,
          content_hash: contentHash,
          original: false,
          confidence: 0,
          blockchain_verified: false,
          message: 'Content not found on XION blockchain - May not be registered'
        };
      }

    } catch (error) {
      console.error('Failed to verify content:', error);
      return {
        found: false,
        content_hash: contentHash,
        original: false,
        confidence: 0,
        blockchain_verified: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Increment verification count for analytics
   */
  private async incrementVerificationCount(currentData: any): Promise<void> {
    try {
      const updatedData = {
        ...currentData,
        verification_count: (currentData.verification_count || 0) + 1,
        last_verified: new Date().toISOString()
      };

      const msg = {
        set_user_data: {
          data: JSON.stringify(updatedData)
        }
      };

      const fee = {
        amount: [{ denom: 'uxion', amount: '1000' }] as Coin[],
        gas: '100000',
      };

      await this.client!.execute(
        this.userAddress!,
        CONTENT_REGISTRY_ADDRESS!,
        msg,
        fee,
        'Update verification count'
      );
    } catch (error) {
      console.warn('Failed to update verification count:', error);
      // Don't throw error, this is optional analytics
    }
  }

  /**
   * Get Treasury contract balance (for monitoring gasless transaction funding)
   */
  async getTreasuryBalance(): Promise<{ balance: string; denom: string } | null> {
    if (!this.client || !TREASURY_ADDRESS) {
      return null;
    }

    try {
      const balance = await this.client.getBalance(TREASURY_ADDRESS, 'uxion');
      return {
        balance: balance.amount,
        denom: balance.denom
      };
    } catch (error) {
      console.error('Failed to get treasury balance:', error);
      return null;
    }
  }

  /**
   * Check if contracts are properly configured
   */
  isConfigured(): boolean {
    return !!(CONTENT_REGISTRY_ADDRESS && TREASURY_ADDRESS && RPC_URL);
  }

  /**
   * Get contract configuration info
   */
  getContractInfo() {
    return {
      contentRegistry: CONTENT_REGISTRY_ADDRESS,
      treasury: TREASURY_ADDRESS,
      rpcUrl: RPC_URL,
      restUrl: REST_URL,
      isConfigured: this.isConfigured()
    };
  }
}
