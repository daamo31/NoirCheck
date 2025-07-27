import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileRegistration {
  id: string;
  filename: string;
  hash: string;
  size: number;
  mimeType: string;
  registeredAt: string;
  blockchainTxId?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface FileVerification {
  id: string;
  filename: string;
  hash: string;
  verifiedAt: string;
  result: {
    isOriginal: boolean;
    confidence: number;
    originalOwner?: string;
    registrationDate?: string;
    modifications?: string[];
  };
}

interface UserActivity {
  id: string;
  type: 'registration' | 'verification';
  filename: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details?: any;
}

interface UserStorageContextType {
  registrations: FileRegistration[];
  verifications: FileVerification[];
  activity: UserActivity[];
  addRegistration: (registration: FileRegistration) => void;
  addVerification: (verification: FileVerification) => void;
  addActivity: (activity: UserActivity) => void;
  getRegistrationByHash: (hash: string) => FileRegistration | undefined;
  getRecentActivity: (limit?: number) => UserActivity[];
  getTotalStats: () => {
    totalRegistrations: number;
    totalVerifications: number;
    recentActivityCount: number;
  };
  clearAllData: () => void;
}

const UserStorageContext = createContext<UserStorageContextType | undefined>(undefined);

interface UserStorageProviderProps {
  children: ReactNode;
}

export function UserStorageProvider({ children }: UserStorageProviderProps) {
  const [registrations, setRegistrations] = useState<FileRegistration[]>([]);
  const [verifications, setVerifications] = useState<FileVerification[]>([]);
  const [activity, setActivity] = useState<UserActivity[]>([]);

  useEffect(() => {
    // Cargar datos iniciales de ejemplo para demostración
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Datos de ejemplo para la demostración
    const mockRegistrations: FileRegistration[] = [
      {
        id: '1',
        filename: 'document.pdf',
        hash: 'abc123...',
        size: 1024000,
        mimeType: 'application/pdf',
        registeredAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
        blockchainTxId: 'tx_123456',
        status: 'confirmed',
      },
      {
        id: '2',
        filename: 'image.jpg',
        hash: 'def456...',
        size: 2048000,
        mimeType: 'image/jpeg',
        registeredAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
        blockchainTxId: 'tx_789012',
        status: 'confirmed',
      },
    ];

    const mockVerifications: FileVerification[] = [
      {
        id: '1',
        filename: 'test_document.pdf',
        hash: 'xyz789...',
        verifiedAt: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
        result: {
          isOriginal: true,
          confidence: 95,
          originalOwner: 'user123',
          registrationDate: new Date(Date.now() - 259200000).toISOString(),
        },
      },
      {
        id: '2',
        filename: 'photo.png',
        hash: 'uvw456...',
        verifiedAt: new Date(Date.now() - 21600000).toISOString(), // 6 horas atrás
        result: {
          isOriginal: false,
          confidence: 75,
          modifications: ['compression', 'metadata_removed'],
        },
      },
    ];

    const mockActivity: UserActivity[] = [
      {
        id: '1',
        type: 'registration',
        filename: 'document.pdf',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        type: 'verification',
        filename: 'test_document.pdf',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        status: 'completed',
      },
      {
        id: '3',
        type: 'verification',
        filename: 'photo.png',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        status: 'completed',
      },
    ];

    setRegistrations(mockRegistrations);
    setVerifications(mockVerifications);
    setActivity(mockActivity);
  };

  const addRegistration = (registration: FileRegistration) => {
    setRegistrations(prev => [registration, ...prev]);
    
    // Agregar a la actividad
    const activityItem: UserActivity = {
      id: Date.now().toString(),
      type: 'registration',
      filename: registration.filename,
      timestamp: registration.registeredAt,
      status: registration.status === 'confirmed' ? 'completed' : 'pending',
    };
    setActivity(prev => [activityItem, ...prev]);
  };

  const addVerification = (verification: FileVerification) => {
    setVerifications(prev => [verification, ...prev]);
    
    // Agregar a la actividad
    const activityItem: UserActivity = {
      id: Date.now().toString(),
      type: 'verification',
      filename: verification.filename,
      timestamp: verification.verifiedAt,
      status: 'completed',
      details: verification.result,
    };
    setActivity(prev => [activityItem, ...prev]);
  };

  const addActivity = (activityItem: UserActivity) => {
    setActivity(prev => [activityItem, ...prev]);
  };

  const getRegistrationByHash = (hash: string): FileRegistration | undefined => {
    return registrations.find(reg => reg.hash === hash);
  };

  const getRecentActivity = (limit: number = 10): UserActivity[] => {
    return activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  const getTotalStats = () => {
    return {
      totalRegistrations: registrations.length,
      totalVerifications: verifications.length,
      recentActivityCount: activity.length,
    };
  };

  const clearAllData = () => {
    setRegistrations([]);
    setVerifications([]);
    setActivity([]);
  };

  const value: UserStorageContextType = {
    registrations,
    verifications,
    activity,
    addRegistration,
    addVerification,
    addActivity,
    getRegistrationByHash,
    getRecentActivity,
    getTotalStats,
    clearAllData,
  };

  return (
    <UserStorageContext.Provider value={value}>
      {children}
    </UserStorageContext.Provider>
  );
}

export function useUserStorage() {
  const context = useContext(UserStorageContext);
  if (context === undefined) {
    throw new Error('useUserStorage must be used within a UserStorageProvider');
  }
  return context;
}
