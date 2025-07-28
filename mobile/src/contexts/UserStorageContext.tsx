import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Load real data from AsyncStorage
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      // Load real data from AsyncStorage
      const storedRegistrations = await AsyncStorage.getItem('user_registrations');
      const storedVerifications = await AsyncStorage.getItem('user_verifications');
      const storedActivity = await AsyncStorage.getItem('user_activity');

      if (storedRegistrations) {
        setRegistrations(JSON.parse(storedRegistrations));
      }
      if (storedVerifications) {
        setVerifications(JSON.parse(storedVerifications));
      }
      if (storedActivity) {
        setActivity(JSON.parse(storedActivity));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const addRegistration = async (registration: FileRegistration) => {
    const updatedRegistrations = [registration, ...registrations];
    setRegistrations(updatedRegistrations);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('user_registrations', JSON.stringify(updatedRegistrations));
    } catch (error) {
      console.error('Error saving registration:', error);
    }
    
    // Add to activity
    const activityItem: UserActivity = {
      id: Date.now().toString(),
      type: 'registration',
      filename: registration.filename,
      timestamp: registration.registeredAt,
      status: registration.status === 'confirmed' ? 'completed' : 'pending',
    };
    const updatedActivity = [activityItem, ...activity];
    setActivity(updatedActivity);
    
    // Save activity to AsyncStorage
    try {
      await AsyncStorage.setItem('user_activity', JSON.stringify(updatedActivity));
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const addVerification = async (verification: FileVerification) => {
    const updatedVerifications = [verification, ...verifications];
    setVerifications(updatedVerifications);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('user_verifications', JSON.stringify(updatedVerifications));
    } catch (error) {
      console.error('Error saving verification:', error);
    }
    
    // Add to activity
    const activityItem: UserActivity = {
      id: Date.now().toString(),
      type: 'verification',
      filename: verification.filename,
      timestamp: verification.verifiedAt,
      status: 'completed',
      details: verification.result,
    };
    const updatedActivity = [activityItem, ...activity];
    setActivity(updatedActivity);
    
    // Save activity to AsyncStorage
    try {
      await AsyncStorage.setItem('user_activity', JSON.stringify(updatedActivity));
    } catch (error) {
      console.error('Error saving activity:', error);
    }
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
