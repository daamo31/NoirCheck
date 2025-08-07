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
   */
  static generateHash(fileName: string, fileSize: number): string {
    const fileIdentifier = `${fileName}_${fileSize}`;
    return `sha256_${fileIdentifier.replace(/[^a-zA-Z0-9]/g, '')}`;
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
}
