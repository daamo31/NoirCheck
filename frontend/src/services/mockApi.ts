/**
 * Mock API Service for Development
 * Simulates backend responses when the real backend is not available
 */

import { 
  HealthCheck, 
  MobileStatus, 
  ContentRegistration, 
  ContentVerification, 
  UserStats, 
  UserActivity 
} from './api';

export class MockAPIService {
  private registeredHashes = new Map<string, any>(); // Store registered content by hash
  private userStats = new Map<string, any>(); // Store user stats locally

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockHash(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateMockTxHash(): string {
    return 'xion' + this.generateMockHash().substring(0, 58);
  }

  // Calculate real SHA-256 hash from file content
  private async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checkHealth(): Promise<HealthCheck> {
    await this.delay(200);
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        xion: 'healthy',
        file_storage: 'healthy'
      }
    };
  }

  async getMobileStatus(): Promise<MobileStatus> {
    await this.delay(200);
    return {
      status: 'active',
      message: 'NoirCheck mobile services are operational (mock)',
      xion_status: 'connected',
      services: {
        database: 'healthy',
        xion: 'healthy',
        file_storage: 'healthy'
      }
    };
  }

  async registerContent(
    file: File, 
    userAddress: string,
    onProgress?: (progress: number) => void
  ): Promise<ContentRegistration> {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await this.delay(100);
        onProgress(i);
      }
    }

    await this.delay(500);

    // Calculate real hash for the file
    const hash = await this.calculateFileHash(file);
    
    // Store this registration
    const registration = {
      id: `mock-reg-${Date.now()}`,
      hash,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      blockchain_tx: this.generateMockTxHash(),
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };

    this.registeredHashes.set(hash, {
      ...registration,
      userAddress,
      creator_id: userAddress
    });

    // Update local user stats
    if (userAddress) {
      const currentStats = this.userStats.get(userAddress) || { 
        totalRegistrations: 0, 
        totalVerifications: 0 
      };
      currentStats.totalRegistrations += 1;
      this.userStats.set(userAddress, currentStats);
      
      console.log('Mock API: Updated registration stats for user:', userAddress, currentStats);
    }

    return registration;
  }

  async verifyContent(file: File, sourceUrl?: string, userId?: string): Promise<ContentVerification> {
    await this.delay(800);

    // Calculate real hash for the file
    const hash = await this.calculateFileHash(file);
    
    // Check if this hash exists in our registered content
    const registeredContent = this.registeredHashes.get(hash);
    const exists = !!registeredContent;

    const baseResult = {
      hash,
      exists,
      original: exists,
      confidence: exists ? 0.95 : 0.0,
      blockchain_verified: exists,
      filename: file.name
    };

    // In a real implementation, we would save the verification activity to backend here
    // For now, we just console.log it and update local stats
    if (userId) {
      console.log('Mock API: Logging verification activity for user:', userId, {
        content_hash: hash,
        filename: file.name,
        exists,
        sourceUrl
      });
      
      // Update local user stats
      const currentStats = this.userStats.get(userId) || { 
        totalRegistrations: 0, 
        totalVerifications: 0 
      };
      currentStats.totalVerifications += 1;
      this.userStats.set(userId, currentStats);
    }

    if (exists && registeredContent) {
      return {
        ...baseResult,
        blockchain_tx: registeredContent.blockchain_tx,
        registration_date: registeredContent.timestamp,
        creator_id: registeredContent.creator_id,
        description: `Original content registered as ${registeredContent.filename}`,
        source_verification: {
          verified: true,
          confidence: 0.95
        },
        modifications: []
      };
    }

    return {
      ...baseResult,
      source_verification: {
        verified: false,
        confidence: 0.0
      },
      modifications: ['Content not found in blockchain registry']
    };
  }

  async getUserStats(userId: string): Promise<UserStats> {
    await this.delay(300);
    
    // Get local stats or create default ones
    const localStats = this.userStats.get(userId) || {
      totalRegistrations: 0,
      totalVerifications: 0
    };
    
    return {
      totalRegistrations: localStats.totalRegistrations,
      totalVerifications: localStats.totalVerifications,
      recentActivity: [
        {
          id: 'mock-1',
          type: 'registration',
          filename: 'document.pdf',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          hash: this.generateMockHash()
        },
        {
          id: 'mock-2',
          type: 'verification',
          filename: 'image.jpg',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed'
        }
      ],
      joinDate: new Date(Date.now() - 30 * 24 * 3600000).toISOString() // 30 days ago
    };
  }

  async getUserActivity(userId: string, limit: number = 20): Promise<UserActivity[]> {
    await this.delay(400);

    const activities: UserActivity[] = [];
    const types = ['registration', 'verification'] as const;
    const statuses = ['completed', 'completed', 'completed', 'failed'] as const;

    for (let i = 0; i < Math.min(limit, 15); i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      activities.push({
        id: `mock-activity-${Date.now()}-${i}`,
        type,
        status,
        timestamp: new Date(Date.now() - (i * 3600000)).toISOString(), // Hours ago
        filename: `document_${i + 1}.pdf`,
        hash: this.generateMockHash()
      });
    }

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUserRegistrations(userId: string): Promise<ContentRegistration[]> {
    await this.delay(350);

    const registrations: ContentRegistration[] = [];
    
    for (let i = 0; i < 8; i++) {
      registrations.push({
        id: `mock-reg-${Date.now()}-${i}`,
        hash: this.generateMockHash(),
        filename: `archivo_${i + 1}.${['pdf', 'jpg', 'png', 'docx'][i % 4]}`,
        file_type: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'][i % 4],
        file_size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        blockchain_tx: this.generateMockTxHash(),
        timestamp: new Date(Date.now() - (i * 24 * 3600000)).toISOString(), // Days ago
        status: ['confirmed', 'confirmed', 'confirmed', 'pending'][i % 4]
      });
    }

    return registrations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const mockApiService = new MockAPIService();
