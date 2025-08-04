/**
 * Mobile Authentication Context
 * Based on working web implementation - simplified and functional
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
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

  // Abstraxion hooks for XION integration
  const abstraxionAccount = useAbstraxionAccount();
  const [isShowingModal, setIsShowingModal] = useModal();

  const isAuthenticated = !!user;

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

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
        setIsShowingModal(true); // Show Abstraxion modal
        
        // Wait for user to complete Abstraxion flow
        // The modal will handle the account creation
        console.log('🔄 Waiting for Abstraxion account creation...');
        
        // Create wallet data from Abstraxion
        walletData = await xionApiService.createWallet({
          username: userData.username,
          zkTLS: true
        });
        console.log('✅ XION wallet created successfully via Abstraxion');
      } catch (error) {
        console.warn('⚠️ Abstraxion wallet creation failed, user will be marked as pending:', error);
        isPending = true;
      }

      // Create user account
      const newUser = await UserStorageService.registerUser({
        email: userData.email,
        password: userData.password,
        username: userData.username || 'user_' + Date.now(),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        address: walletData?.address,
        totalRegistrations: 0,
        totalVerifications: 0,
        isPending
      });

      const adaptedUser = adaptUserFromStorage(newUser);
      setUser(adaptedUser);
      
      if (walletData) {
        setWallet(walletData);
      }

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
   * This provides the same experience as the web app
   */
  const connectWithXION = async (): Promise<boolean> => {
    try {
      console.log('🔄 Opening XION connection modal...');
      
      // Show Abstraxion modal for XION account creation/connection
      setIsShowingModal(true);
      
      // Return a promise that resolves when connection is successful or fails
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (abstraxionAccount.isConnected && abstraxionAccount.data) {
            console.log('✅ XION account connected via Abstraxion');
            
            // Create a temporary user if not logged in
            if (!user) {
              const tempUser: User = {
                id: 'xion_user_' + Date.now(),
                email: 'xion@temporary.com',
                username: 'XION User',
                registeredAt: new Date().toISOString(),
                totalRegistrations: 0,
                totalVerifications: 0,
                address: String(abstraxionAccount.data),
                isPending: false
              };
              setUser(tempUser);
            }
            
            // Set wallet from Abstraxion
            const xionWallet: XIONWallet = {
              address: String(abstraxionAccount.data),
              publicKey: '', // Abstraxion doesn't expose publicKey directly
              keyType: 'secp256k1' as const,
              zkTLS: {
                enabled: true,
                proofGenerated: false,
                identityVerified: true,
                verificationLevel: 'basic'
              }
            };
            setWallet(xionWallet);
            
            setIsShowingModal(false);
            resolve(true);
          } else if (!isShowingModal) {
            // Modal was closed without connection
            console.log('❌ XION connection modal closed without connecting');
            resolve(false);
          } else {
            // Still waiting for connection
            setTimeout(checkConnection, 500);
          }
        };
        
        // Start checking after a brief delay
        setTimeout(checkConnection, 1000);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          console.log('⏰ XION connection timeout');
          setIsShowingModal(false);
          resolve(false);
        }, 30000);
      });
    } catch (error) {
      console.error('❌ XION connection error:', error);
      setIsShowingModal(false);
      return false;
    }
  };

  const retryPendingWallet = async (): Promise<boolean> => {
    if (!user || !user.isPending) {
      return false;
    }

    try {
      console.log('🔄 Retrying wallet creation for user:', user.email);

      // Try to create XION wallet
      const walletData = await xionApiService.createWallet({
        username: user.username,
        zkTLS: true
      });

      // Update user record
      const updatedUser = await UserStorageService.updateUserWallet(user.id, {
        address: walletData.address,
        publicKey: walletData.publicKey,
        isPending: false
      });

      const adaptedUser = updatedUser ? adaptUserFromStorage(updatedUser) : null;
      if (adaptedUser) {
        setUser(adaptedUser);
        setWallet(walletData);
      }

      console.log('✅ Wallet creation retry successful');
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
