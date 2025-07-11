/**
 * NoirCheck TypeScript Types
 */

export interface XIONConnection {
  connected: boolean;
  status: 'local_mode' | 'testnet' | 'mainnet' | 'disconnected';
  networkName?: string;
  walletAddress?: string;
}

export interface ServiceStatus {
  database: 'connected' | 'disconnected' | 'error';
  xion: 'local_mode' | 'testnet' | 'mainnet' | 'disconnected' | 'error';
  file_storage: 'available' | 'unavailable' | 'error';
}

export interface ContentStatus {
  hash: string;
  verified: boolean;
  blockchainVerified: boolean;
  confidence: number;
  registrationDate?: Date;
  transactionHash?: string;
  sourceVerified?: boolean;
  modifications?: string[];
}

export interface UploadProgress {
  percentage: number;
  status: 'uploading' | 'processing' | 'verifying' | 'complete' | 'error';
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// Re-export types from api service
export type {
  ContentRegistration,
  ContentVerification,
  HealthCheck,
  MobileStatus,
  User,
  UserRegistrationData,
  UserActivity,
  UserStats
} from '@/services/api';
