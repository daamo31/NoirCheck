/**
 * Mobile Authentication Context
 * Based on working web implemexport function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<XIONWallet | null>(null);

  // Mock abstraxion account for temporary implementation
  const abstraxionAccount = {
    isConnected: false,
    isConnecting: false,
    data: null
  };
  
  // Mock modal state
  const [isShowingModal, setIsShowingModal] = useState(false); simplified and functional
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import { UserStorageService, User as StorageUser, ActivityEntry } from '../services/UserStorageService';
import { xionApiService, XIONWallet } from '../services/XionApiService';

// User interface for the context
interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  publicKey?: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  isPending?: boolean;
}

// Context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  wallet: XIONWallet | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  connectWithXION: () => Promise<boolean>;
  retryPendingWallet: () => Promise<boolean>;
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to adapt storage user to context user
function adaptUserFromStorage(storageUser: StorageUser): User {
  return {
    id: storageUser.id,
    email: storageUser.email,
    username: storageUser.username,
    firstName: storageUser.firstName,
    lastName: storageUser.lastName,
    address: storageUser.address,
    publicKey: storageUser.xionWallet?.publicKey,
    registeredAt: storageUser.registeredAt,
    totalRegistrations: storageUser.totalRegistrations || 0,
    totalVerifications: storageUser.totalVerifications || 0,
    isPending: storageUser.isPending || false
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<XIONWallet | null>(null);
  const [showXionModal, setShowXionModal] = useState(false);

  // Real XION React Native integration
  const abstraxionAccount = useAbstraxionAccount();

  const isAuthenticated = !!user;

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for Abstraxion account changes and update wallet
  useEffect(() => {
    const updateWalletFromAbstraxion = async () => {
      if (abstraxionAccount.isConnected && abstraxionAccount.data?.bech32Address && user?.isPending) {
        try {
          console.log('🔄 Abstraxion account connected, updating wallet:', abstraxionAccount.data.bech32Address);
          
          // Create a real wallet with Abstraxion data
          const realWallet: XIONWallet = {
            address: abstraxionAccount.data.bech32Address,
            publicKey: 'abstraxion_managed', // Abstraxion manages the key internally
            keyType: 'secp256k1',
            zkTLS: {
              enabled: true,
              proofGenerated: true,
              identityVerified: true,
              verificationLevel: 'enhanced'
            }
          };

          // Update local wallet state
          setWallet(realWallet);

          // Update the XION service with the real wallet
          xionApiService.updateWallet(realWallet);

          // Update user in storage to remove pending status
          if (user) {
            const updatedUserData = {
              ...user,
              address: realWallet.address,
              publicKey: realWallet.publicKey,
              isPending: false
            };
            
            await UserStorageService.updateUser(user.id, {
              address: realWallet.address,
              isPending: false,
              xionWallet: {
                address: realWallet.address,
                publicKey: realWallet.publicKey,
                createdAt: new Date().toISOString()
              }
            });

            setUser(updatedUserData);
            console.log('✅ Wallet updated with real Abstraxion account:', realWallet.address);
          }
        } catch (error) {
          console.error('❌ Failed to update wallet from Abstraxion:', error);
        }
      }
    };

    updateWalletFromAbstraxion();
  }, [abstraxionAccount.isConnected, abstraxionAccount.data?.bech32Address, user?.isPending]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to get stored user
      const storedUser = await UserStorageService.getCurrentUser();
      if (storedUser) {
        const adaptedUser = adaptUserFromStorage(storedUser);
        setUser(adaptedUser);
        
        // Try to load existing wallet
        const existingWallet = await xionApiService.loadExistingWallet();
        if (existingWallet) {
          setWallet(existingWallet);
          console.log('✅ Restored user session with wallet:', adaptedUser.email);
        } else {
          console.log('✅ Restored user session without wallet:', adaptedUser.email);
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Registering new user:', userData.email);

      // Check if user already exists
      const existingUser = await UserStorageService.findUserByEmail(userData.email);
      if (existingUser) {
        setError('User already exists');
        return false;
      }

      // Try to connect with XION Abstraxion (real integration like web app)
      let walletData: XIONWallet | null = null;
      let isPending = false;

      try {
        console.log('⛓️ Opening Abstraxion modal for XION account creation...');
        
        // Use the real Abstraxion login method
        await abstraxionAccount.login();
        
        // The wallet will be created automatically when Abstraxion connects
        // We'll mark the user as pending and the wallet will be updated via the useEffect
        isPending = true;
        
        console.log('✅ XION account creation initiated via Abstraxion');
      } catch (error) {
        console.warn('⚠️ Abstraxion connection failed, user will be marked as pending:', error);
        isPending = true;
      }

      // Create user account
      const newUser = await UserStorageService.registerUser({
        email: userData.email,
        password: userData.password,
        username: userData.username || 'user_' + Date.now(),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        address: undefined, // Will be set when Abstraxion connects
        totalRegistrations: 0,
        totalVerifications: 0,
        isPending
      });

      const adaptedUser = adaptUserFromStorage(newUser);
      setUser(adaptedUser);
      
      // No immediate wallet data since we're using Abstraxion
      // Wallet will be set via the useEffect when Abstraxion connects

      console.log('✅ User registered successfully:', adaptedUser.email);
      return true;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError((error as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Logging in user:', email);

      // Authenticate user
      const authenticatedUser = await UserStorageService.authenticateUser(email, password);
      if (!authenticatedUser) {
        setError('Invalid email or password');
        return false;
      }

      // Get user data
      const storedUser = authenticatedUser;
      if (!storedUser) {
        setError('User not found');
        return false;
      }

      const adaptedUser = adaptUserFromStorage(storedUser);
      setUser(adaptedUser);

      // Try to load wallet if user has one
      if (adaptedUser.address) {
        try {
          const existingWallet = await xionApiService.loadExistingWallet();
          if (existingWallet) {
            setWallet(existingWallet);
          }
        } catch (error) {
          console.warn('⚠️ Could not load wallet, user might need to retry:', error);
        }
      }

      console.log('✅ User logged in successfully:', adaptedUser.email);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      setError((error as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Logging out user...');
      
      // Clear XION wallet data
      await xionApiService.clearWallet();
      
      // Clear user session
      await UserStorageService.clearCurrentUser();
      
      setUser(null);
      setWallet(null);
      setError(null);
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      setWallet(null);
      setError(null);
    }
  };

  /**
   * Connect with XION using Abstraxion modal
   */
  const connectWithXION = async (): Promise<boolean> => {
    try {
      console.log('🔄 Connecting with XION via Abstraxion...');
      
      // Use the real Abstraxion login method
      await abstraxionAccount.login();
      
      console.log('✅ XION connection initiated via Abstraxion');
      return true;
    } catch (error) {
      console.error('❌ XION connection error:', error);
      return false;
    }
  };

  const retryPendingWallet = async (): Promise<boolean> => {
    if (!user || !user.isPending) {
      return false;
    }

    try {
      console.log('🔄 Retrying wallet creation for user:', user.email);

      // Use real Abstraxion login
      await abstraxionAccount.login();
      
      console.log('✅ Wallet creation retry initiated via Abstraxion');
      return true;
    } catch (error) {
      console.error('❌ Wallet retry failed:', error);
      return false;
    }
  };

  const addActivity = async (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      await UserStorageService.addActivity(user.id, activity);
      
      // Update user stats
      const updatedUser = await UserStorageService.findUserById(user.id);
      if (updatedUser) {
        const adaptedUser = adaptUserFromStorage(updatedUser);
        setUser(adaptedUser);
      }
    } catch (error) {
      console.error('❌ Add activity error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        wallet,
        login,
        register,
        logout,
        connectWithXION,
        retryPendingWallet,
        addActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
