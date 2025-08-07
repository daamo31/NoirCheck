/**
 * Content Registry Service
 * Manages local storage of registered content for demo purposes
 * In a real app, this would interact with blockchain
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisteredContent {
  hash: string;
  author: string;
  registrationDate: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  // Added fields for better file identification
  originalUri?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

const STORAGE_KEY = '@NoirCheck:RegisteredContent';

export class ContentRegistry {
  
  /**
   * Register new content
   */
  static async registerContent(content: RegisteredContent): Promise<void> {
    try {
      const existingContent = await this.getAllRegisteredContent();
      const updatedContent = [...existingContent, content];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContent));
      console.log('📝 Content registered in local storage:', content.fileName);
    } catch (error) {
      console.error('❌ Failed to register content:', error);
      throw error;
    }
  }
  
  /**
   * Get all registered content
   */
  static async getAllRegisteredContent(): Promise<RegisteredContent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // Start with empty array - no demo content
      return [];
      
    } catch (error) {
      console.error('❌ Failed to get registered content:', error);
      return [];
    }
  }
  
  /**
   * Find content by hash
   */
  static async findByHash(hash: string): Promise<RegisteredContent | null> {
    try {
      const allContent = await this.getAllRegisteredContent();
      return allContent.find(content => content.hash === hash) || null;
    } catch (error) {
      console.error('❌ Failed to find content by hash:', error);
      return null;
    }
  }
  
  /**
   * Generate deterministic hash for a file
   * Uses file size and type instead of filename to avoid timestamp issues
   */
  static generateHash(fileName: string, fileSize: number, fileUri?: string): string {
    // Extract file extension for better identification
    const fileExtension = fileName.split('.').pop() || 'unknown';
    
    // Create a more stable identifier based on size and type
    const fileIdentifier = `${fileSize}_${fileExtension}`;
    
    // If file URI is available, use a portion of it for better uniqueness
    let uriSuffix = '';
    if (fileUri) {
      // Use last 8 characters of the URI path (excluding timestamp parts)
      const uriParts = fileUri.split('/');
      const lastPart = uriParts[uriParts.length - 1];
      // Remove timestamp patterns and keep meaningful parts
      const cleanPart = lastPart.replace(/\d{13,}/g, ''); // Remove long timestamps
      uriSuffix = `_${cleanPart.slice(-8)}`;
    }
    
    return `sha256_${fileIdentifier}${uriSuffix}`.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Generate hash based on file content characteristics
   * More reliable method for same image detection with size tolerance
   */
  static generateContentHash(fileSize: number, width?: number, height?: number, fileType?: string): string {
    const dimensions = width && height ? `${width}x${height}` : 'unknown';
    const type = fileType || 'unknown';
    
    // Create size ranges for tolerance (±5KB tolerance for image processing differences)
    const sizeRange = fileSize ? Math.floor(fileSize / 5000) * 5000 : 0; // Round to nearest 5KB
    
    const identifier = `${sizeRange}_${dimensions}_${type}`;
    return `sha256_content_${identifier}`.replace(/[^a-zA-Z0-9_]/g, '');
  }
  
  /**
   * Find content by hash with tolerance for slight size differences
   */
  static async findByHashTolerant(targetSize: number, width?: number, height?: number, fileType?: string): Promise<RegisteredContent | null> {
    try {
      const allContent = await this.getAllRegisteredContent();
      
      // First try exact match
      const exactHash = this.generateContentHash(targetSize, width, height, fileType);
      let match = allContent.find(content => content.hash === exactHash);
      
      if (match) {
        return match;
      }
      
      // If no exact match, try with tolerance for images
      if (fileType === 'image' && width && height) {
        match = allContent.find(content => {
          // Same dimensions and similar size (within 10KB)
          const sizeDiff = Math.abs((content.fileSize || 0) - targetSize);
          const sameDimensions = content.width === width && content.height === height;
          const sameType = content.fileType === fileType;
          
          return sameDimensions && sameType && sizeDiff <= 10000; // 10KB tolerance
        });
      }
      
      return match || null;
    } catch (error) {
      console.error('❌ Failed to find content with tolerance:', error);
      return null;
    }
  }
  
  /**
   * Clear all registered content (for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Cleared all registered content');
    } catch (error) {
      console.error('❌ Failed to clear content:', error);
    }
  }

  /**
   * Debug function to show all registered content
   */
  static async debugShowAll(): Promise<void> {
    try {
      const allContent = await this.getAllRegisteredContent();
      console.log('📋 All registered content:');
      allContent.forEach((content, index) => {
        console.log(`${index + 1}. ${content.fileName}`);
        console.log(`   Hash: ${content.hash}`);
        console.log(`   Size: ${content.fileSize} bytes`);
        console.log(`   Dimensions: ${content.width || 'unknown'}x${content.height || 'unknown'}`);
        console.log(`   Type: ${content.fileType}`);
        console.log(`   Author: ${content.author}`);
        console.log(`   Date: ${content.registrationDate}`);
        console.log('---');
      });
      
      if (allContent.length === 0) {
        console.log('No content registered yet.');
      }
    } catch (error) {
      console.error('❌ Failed to debug content:', error);
    }
  }
}
