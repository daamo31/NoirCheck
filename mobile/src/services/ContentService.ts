import '../utils/polyfills'; // Import polyfills first!
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateFileHash } from './CameraService';
import { xionApiService } from './XionApiService';

export interface Content {
  id: string;
  hash: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  registeredAt: string;
  blockchainTxHash?: string;
  isVerified: boolean;
  verificationLevel: 'high' | 'medium' | 'low' | 'unverified';
  registeredBy?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    location?: string;
    deviceInfo?: string;
  };
}

export interface VerificationResult {
  isAuthentic: boolean;
  confidence: number;
  verificationLevel: 'high' | 'medium' | 'low' | 'unverified';
  registrationDate?: string;
  registeredBy?: string;
  blockchainTxHash?: string;
  additionalInfo?: {
    sourceUrl?: string;
    modifications?: string[];
    warnings?: string[];
  };
}

class ContentService {
  private STORAGE_KEY = 'noircheck_content_history';

  /**
   * Calculate SHA-256 hash of file content
   */
  async calculateFileHash(fileUri: string): Promise<string> {
    try {
      console.log('🔄 Calculating file hash...');
      
      // Read the actual file content and calculate real hash
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();
      
      // Use the crypto polyfill from our polyfills
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('✅ File hash calculated successfully:', hash.substring(0, 16) + '...');
      return hash;
    } catch (error) {
      console.error('Error calculating file hash:', error);
      throw new Error('Failed to calculate file hash');
    }
  }

  /**
   * Register content on XION blockchain
   */
  async registerContent(
    fileUri: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    metadata?: Content['metadata']
  ): Promise<Content> {
    try {
      // Calculate file hash
      const hash = await this.calculateFileHash(fileUri);
      
      // Check if wallet is connected
      const wallet = xionApiService.getCurrentWallet();
      if (!wallet) {
        throw new Error('XION wallet not connected');
      }

      console.log('📝 Registering content on XION blockchain...');
      
      // Register on blockchain
      const txResult = await xionApiService.registerContent({
        contentHash: hash,
        metadata: {
          filename: fileName,
          size: fileSize,
          mimeType,
          timestamp: new Date().toISOString()
        }
      });

      // Create content record
      const content: Content = {
        id: Date.now().toString(),
        hash,
        fileName,
        fileSize,
        mimeType,
        registeredAt: new Date().toISOString(),
        blockchainTxHash: txResult?.txHash || undefined,
        isVerified: true,
        verificationLevel: 'high',
        registeredBy: wallet.address,
        metadata,
      };

      // Store locally
      await this.saveContentToHistory(content);
      
      console.log('✅ Content registered successfully:', {
        hash: hash.slice(0, 16) + '...',
        txHash: txResult?.txHash?.slice(0, 16) + '...',
        fileName,
      });

      return content;
    } catch (error) {
      console.error('❌ Error registering content:', error);
      
      // Fallback: save locally without blockchain registration
      const hash = await this.calculateFileHash(fileUri);
      const content: Content = {
        id: Date.now().toString(),
        hash,
        fileName,
        fileSize,
        mimeType,
        registeredAt: new Date().toISOString(),
        isVerified: false,
        verificationLevel: 'unverified',
        metadata,
      };

      await this.saveContentToHistory(content);
      throw error;
    }
  }

  /**
   * Verify content authenticity against XION blockchain
   */
  async verifyContent(
    fileUri: string,
    fileName: string
  ): Promise<VerificationResult> {
    try {
      console.log('🔍 Verifying content authenticity...');
      
      // Calculate file hash
      const hash = await this.calculateFileHash(fileUri);
      
      // Check on XION blockchain
      const blockchainResult = await xionApiService.verifyContent({ contentHash: hash });
      
      if (blockchainResult) {
        console.log('✅ Content found on blockchain');
        
        const result: VerificationResult = {
          isAuthentic: blockchainResult.isAuthentic,
          confidence: blockchainResult.confidence,
          verificationLevel: blockchainResult.confidence > 80 ? 'high' : 'medium',
          registrationDate: blockchainResult.registrationInfo?.registrationDate,
          registeredBy: blockchainResult.registrationInfo?.originalCreator,
          blockchainTxHash: blockchainResult.registrationInfo?.blockchain.transactionHash,
          additionalInfo: {
            warnings: blockchainResult.zkTLS?.sourceVerified === false ? ['Source URL not verified'] : undefined,
          }
        };

        // Save verification to history
        await this.saveVerificationToHistory(fileName, hash, result);
        
        return result;
      }

      // Check local history
      const localResult = await this.checkLocalHistory(hash);
      if (localResult) {
        console.log('📱 Content found in local history');
        
        const result: VerificationResult = {
          isAuthentic: true,
          confidence: 70,
          verificationLevel: 'medium',
          registrationDate: localResult.registeredAt,
          registeredBy: localResult.registeredBy,
          additionalInfo: {
            warnings: ['Content verified only in local history']
          }
        };

        await this.saveVerificationToHistory(fileName, hash, result);
        return result;
      }

      // Content not found
      console.log('❌ Content not found in any records');
      
      const result: VerificationResult = {
        isAuthentic: false,
        confidence: 0,
        verificationLevel: 'unverified',
        additionalInfo: {
          warnings: ['Content not found in blockchain or local records']
        }
      };

      await this.saveVerificationToHistory(fileName, hash, result);
      return result;
      
    } catch (error) {
      console.error('❌ Error verifying content:', error);
      
      const result: VerificationResult = {
        isAuthentic: false,
        confidence: 0,
        verificationLevel: 'unverified',
        additionalInfo: {
          warnings: ['Verification failed due to technical error']
        }
      };

      return result;
    }
  }

  /**
   * Check content in local history
   */
  private async checkLocalHistory(hash: string): Promise<Content | null> {
    try {
      const history = await this.getContentHistory();
      return history.find(content => content.hash === hash) || null;
    } catch (error) {
      console.error('Error checking local history:', error);
      return null;
    }
  }

  /**
   * Save content to local history
   */
  private async saveContentToHistory(content: Content): Promise<void> {
    try {
      const history = await this.getContentHistory();
      history.unshift(content); // Add to beginning
      
      // Keep only last 100 entries
      const limitedHistory = history.slice(0, 100);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving content to history:', error);
    }
  }

  /**
   * Save verification to history
   */
  private async saveVerificationToHistory(
    fileName: string,
    hash: string,
    result: VerificationResult
  ): Promise<void> {
    try {
      const verificationRecord = {
        id: Date.now().toString(),
        fileName,
        hash,
        verifiedAt: new Date().toISOString(),
        result,
      };

      const verifications = await this.getVerificationHistory();
      verifications.unshift(verificationRecord);
      
      // Keep only last 100 verifications
      const limitedVerifications = verifications.slice(0, 100);
      
      await AsyncStorage.setItem(
        'noircheck_verification_history',
        JSON.stringify(limitedVerifications)
      );
    } catch (error) {
      console.error('Error saving verification to history:', error);
    }
  }

  /**
   * Get content registration history
   */
  async getContentHistory(): Promise<Content[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading content history:', error);
      return [];
    }
  }

  /**
   * Get verification history
   */
  async getVerificationHistory(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('noircheck_verification_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading verification history:', error);
      return [];
    }
  }

  /**
   * Get all activity history (registrations + verifications)
   */
  async getAllHistory(): Promise<any[]> {
    try {
      const [content, verifications] = await Promise.all([
        this.getContentHistory(),
        this.getVerificationHistory(),
      ]);

      const allHistory = [
        ...content.map(item => ({ ...item, type: 'registration' })),
        ...verifications.map(item => ({ ...item, type: 'verification' })),
      ];

      // Sort by date (newest first)
      return allHistory.sort((a, b) => {
        const dateA = new Date(a.registeredAt || a.verifiedAt).getTime();
        const dateB = new Date(b.registeredAt || b.verifiedAt).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error loading all history:', error);
      return [];
    }
  }

  /**
   * Clear all local history
   */
  async clearHistory(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEY),
        AsyncStorage.removeItem('noircheck_verification_history'),
      ]);
      console.log('✅ History cleared');
    } catch (error) {
      console.error('❌ Error clearing history:', error);
    }
  }

  /**
   * Get content statistics
   */
  async getStatistics(): Promise<{
    totalRegistrations: number;
    totalVerifications: number;
    authenticContent: number;
    unverifiedContent: number;
  }> {
    try {
      const [content, verifications] = await Promise.all([
        this.getContentHistory(),
        this.getVerificationHistory(),
      ]);

      const authenticVerifications = verifications.filter(
        v => v.result.isAuthentic
      ).length;

      return {
        totalRegistrations: content.length,
        totalVerifications: verifications.length,
        authenticContent: authenticVerifications,
        unverifiedContent: verifications.length - authenticVerifications,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalRegistrations: 0,
        totalVerifications: 0,
        authenticContent: 0,
        unverifiedContent: 0,
      };
    }
  }
}

export const contentService = new ContentService();
