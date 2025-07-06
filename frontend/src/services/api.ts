/**
 * NoirCheck API Service
 * Servicio para comunicación con el backend FastAPI
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
  source_verification?: {
    url?: string;
    verified: boolean;
    confidence: number;
  };
  modifications?: string[];
}

class APIService {
  private baseURL = 'http://localhost:8001';

  async healthCheck(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  async getMobileStatus(): Promise<MobileStatus> {
    const response = await fetch(`${this.baseURL}/mobile/status`);
    if (!response.ok) {
      throw new Error('Mobile status check failed');
    }
    return response.json();
  }

  async registerContent(file: File): Promise<ContentRegistration> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Content registration failed');
    }
    return response.json();
  }

  async verifyContent(file: File, sourceUrl?: string): Promise<ContentVerification> {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceUrl) {
      formData.append('source_url', sourceUrl);
    }

    const response = await fetch(`${this.baseURL}/verify`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Content verification failed');
    }
    return response.json();
  }
}

export const apiService = new APIService();
