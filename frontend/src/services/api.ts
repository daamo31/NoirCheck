/**
 * NoirCheck API Service
 * Service for communication with the FastAPI backend
 * 
 * This service provides methods to interact with the NoirCheck backend API,
 * handling content registration, verification, and system status checks.
 * 
 * Features:
 * - Content registration and verification
 * - Health monitoring and status checks
 * - File upload with progress tracking
 * - Error handling and fallback mechanisms
 * - Mobile-optimized endpoints
 */

export interface HealthCheck {
  status: string;
  timestamp: string;
  services: {
    database: string;
    xion: string;
    file_storage: string;
  };
}

export interface MobileStatus {
  status: string;
  message: string;
  xion_status: string;
  services: {
    database: string;
    xion: string;
    file_storage: string;
  };
}

export interface ContentRegistration {
  id: string;
  hash: string;
  filename: string;
  file_type: string;
  file_size: number;
  blockchain_tx: string;
  timestamp: string;
  status: string;
}

export interface ContentVerification {
  hash: string;
  exists: boolean;
  original: boolean;
  confidence: number;
  blockchain_verified: boolean;
  blockchain_tx?: string;
  registration_date?: string;
  creator_id?: string;
  description?: string;
  filename?: string;
  source_verification?: {
    url?: string;
    verified: boolean;
    confidence: number;
  };
  modifications?: string[];
}

export interface User {
  id: string;
  address: string;
  username?: string;
  email?: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  lastActivity: string;
}

export interface UserRegistrationData {
  address: string;
  username?: string;
  email?: string;
}

export interface UserActivity {
  id: string;
  type: 'registration' | 'verification';
  filename: string;
  timestamp: string;
  status: string;
  hash?: string;
}

export interface UserStats {
  totalRegistrations: number;
  totalVerifications: number;
  recentActivity: UserActivity[];
  joinDate: string;
}

class APIService {
  private baseURL = 'http://localhost:8000';

  private async fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
    // On the client side (browser), use native fetch
    if (typeof window !== 'undefined') {
      return fetch(url, options);
    }
    
    // On the server side (Node.js), use fetch polyfill if necessary
    // Next.js 13+ includes fetch by default
    return fetch(url, options);
  }

  async healthCheck(): Promise<HealthCheck> {
    const response = await this.fetchWithFallback(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  async getMobileStatus(): Promise<MobileStatus> {
    const response = await this.fetchWithFallback(`${this.baseURL}/mobile/status`);
    if (!response.ok) {
      throw new Error('Mobile status check failed');
    }
    return response.json();
  }

  async registerContent(file: File, description: string, creatorId: string): Promise<ContentRegistration> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('creator_id', creatorId);

    const response = await this.fetchWithFallback(`${this.baseURL}/content/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Content registration failed: ${errorText}`);
    }
    return response.json();
  }

  async verifyContent(file: File, sourceUrl?: string, userId?: string): Promise<ContentVerification> {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceUrl) {
      formData.append('source_url', sourceUrl);
    }
    if (userId) {
      formData.append('user_id', userId);
    }

    const response = await this.fetchWithFallback(`${this.baseURL}/content/verify`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Content verification failed');
    }
    return response.json();
  }

  // User Management Methods
  async registerUser(userData: UserRegistrationData): Promise<User> {
    const response = await this.fetchWithFallback(`${this.baseURL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`User registration failed: ${errorText}`);
    }
    return response.json();
  }

  async getUser(address: string): Promise<User | null> {
    try {
      const response = await this.fetchWithFallback(`${this.baseURL}/users/${address}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const response = await this.fetchWithFallback(`${this.baseURL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`User update failed: ${errorText}`);
    }
    return response.json();
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const response = await this.fetchWithFallback(`${this.baseURL}/users/${userId}/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    return response.json();
  }

  async getUserActivity(userId: string, limit: number = 20): Promise<UserActivity[]> {
    const response = await this.fetchWithFallback(
      `${this.baseURL}/users/${userId}/activity?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user activity');
    }
    return response.json();
  }

  async getUserRegistrations(userId: string): Promise<ContentRegistration[]> {
    const response = await this.fetchWithFallback(`${this.baseURL}/users/${userId}/registrations`);

    if (!response.ok) {
      throw new Error('Failed to fetch user registrations');
    }
    return response.json();
  }

  // Development helper methods
  async deleteUser(address: string): Promise<boolean> {
    try {
      const response = await this.fetchWithFallback(`${this.baseURL}/users/${address}`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  async clearAllUsers(): Promise<boolean> {
    try {
      const response = await this.fetchWithFallback(`${this.baseURL}/users/clear`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Clear users error:', error);
      return false;
    }
  }
}

export const apiService = new APIService();
