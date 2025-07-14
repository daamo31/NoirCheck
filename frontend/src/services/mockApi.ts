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

    const hash = this.generateMockHash();
    return {
      id: `mock-reg-${Date.now()}`,
      hash,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      blockchain_tx: this.generateMockTxHash(),
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };
  }

  async verifyContent(file: File): Promise<ContentVerification> {
    await this.delay(800);

    const hash = this.generateMockHash();
    const exists = Math.random() > 0.3; // 70% chance of existing content

    const baseResult = {
      hash,
      exists,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      verification_timestamp: new Date().toISOString()
    };

    if (exists) {
      return {
        ...baseResult,
        registration_data: {
          id: `mock-reg-${Date.now() - 86400000}`, // Day ago
          blockchain_tx: this.generateMockTxHash(),
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          original_filename: file.name,
          registered_by: 'mock-user-456'
        },
        confidence_score: 0.95,
        authenticity_details: {
          blockchain_verified: true,
          hash_match: true,
          metadata_consistent: true,
          source_verified: true
        }
      };
    }

    return baseResult;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    await this.delay(300);
    
    return {
      totalRegistrations: 12,
      totalVerifications: 34,
      successfulVerifications: 28,
      failedVerifications: 6,
      lastActivity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      memberSince: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), // 30 days ago
      monthlyActivity: [
        { month: '2024-11', registrations: 3, verifications: 8 },
        { month: '2024-12', registrations: 5, verifications: 12 },
        { month: '2025-01', registrations: 4, verifications: 14 }
      ]
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
        filename: `documento_${i + 1}.pdf`,
        hash: this.generateMockHash(),
        ...(type === 'registration' && {
          blockchain_tx: this.generateMockTxHash()
        }),
        ...(type === 'verification' && {
          verification_result: status === 'completed' ? 'authentic' : 'not_found'
        })
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
