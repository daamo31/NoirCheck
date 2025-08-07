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
      
      // Return some pre-registered content for demo
      const demoContent: RegisteredContent[] = [
        {
          hash: 'sha256_democontent1',
          author: 'demo@noircheck.com',
          registrationDate: '2024-11-15',
          fileName: 'demo_image_1.png',
          fileSize: 521814,
          fileType: 'image'
        }
      ];
      
      // Save demo content
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demoContent));
      return demoContent;
      
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
   * More reliable method for same image detection
   */
  static generateContentHash(fileSize: number, width?: number, height?: number, fileType?: string): string {
    const dimensions = width && height ? `${width}x${height}` : 'unknown';
    const type = fileType || 'unknown';
    const identifier = `${fileSize}_${dimensions}_${type}`;
    return `sha256_content_${identifier}`.replace(/[^a-zA-Z0-9_]/g, '');
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
        console.log(`   Size: ${content.fileSize}`);
        console.log(`   Dimensions: ${content.width}x${content.height}`);
        console.log(`   Author: ${content.author}`);
        console.log('---');
      });
    } catch (error) {
      console.error('❌ Failed to debug content:', error);
    }
  }
}
