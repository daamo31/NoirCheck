/**
 * Mobile Authentication Context
 * 
 * Provides global authentication state management for mobile app.
 * Based on the web frontend implementation but adapted for React Native.
 * Integrates with XION and UserStorageService for comprehensive user management.
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserStorageService, User as StorageUser, ActivityEntry } from '../services/UserStorageService';
import { xionService, XIONWallet } from '../services/XionService';

/**
 * User interface representing authenticated user data
 */
interface User {
  id: string;
  address: string;           // XION blockchain address
  username?: string;         // Optional display name
  email?: string;           // Optional email address
  firstName?: string;       // User's first name
  lastName?: string;        // User's last name
  registeredAt: string;     // Registration timestamp
  totalRegistrations: number; // Total content registrations
  totalVerifications: number; // Total verifications performed
  lastActivity: string;     // Last activity timestamp
  xionWallet?: XIONWallet;  // Connected XION wallet
}

/**
 * Convert UserStorageService User to AuthContext User
 */
function adaptUserFromStorage(storageUser: StorageUser): User {
  return {
    id: storageUser.id,
    address: storageUser.address || storageUser.xionWallet?.address || '',
    username: storageUser.username,
    email: storageUser.email,
    firstName: storageUser.firstName,
    lastName: storageUser.lastName,
    registeredAt: storageUser.registeredAt,
    totalRegistrations: storageUser.totalRegistrations,
    totalVerifications: storageUser.totalVerifications,
    lastActivity: storageUser.lastActivity,
    xionWallet: storageUser.xionWallet ? {
      address: storageUser.xionWallet.address,
      publicKey: storageUser.xionWallet.publicKey,
      keyType: 'secp256k1' as const
    } : undefined
  };
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  user: User | null;                            // Current authenticated user
  isAuthenticated: boolean;                     // Authentication status
  isLoading: boolean;                          // Loading state
  error: string | null;                        // Error message
  login: () => Promise<void>;                  // Login with XION wallet
  loginWithEmail: (email: string, password: string) => Promise<void>; // Email login
  register: (userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;                         // Register new user
  logout: () => Promise<void>;                 // Logout and clear session
  updateUser: (updates: Partial<User>) => Promise<void>; // Update user data
  connectXionWallet: () => Promise<void>;      // Connect XION wallet
  disconnectXionWallet: () => Promise<void>;   // Disconnect XION wallet
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => Promise<void>; // Add activity
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication action types
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

/**
 * Authentication reducer
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    default:
      return state;
  }
};

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication context to all components.
 * Integrates with XION and UserStorageService for comprehensive user management.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize authentication state
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  /**
   * Initialize authentication on app start
   */
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        console.log('🚀 Initializing mobile authentication...');
        
        // Initialize XION service
        await xionService.initialize();
        
        // Check for existing user session
        const currentUser = await UserStorageService.getCurrentUser();
        
        if (currentUser) {
          console.log('👤 Found existing user session:', currentUser.email);
          
          // Check if user has XION wallet in storage
          if (currentUser.xionWallet) {
            // Try to restore XION wallet connection
            try {
              const wallet = xionService.getWallet();
              if (!wallet || wallet.address !== currentUser.xionWallet.address) {
                console.log('🔗 Restoring XION wallet connection...');
                // Set the wallet from storage
                // Note: In production, you'd verify the wallet is still valid
              }
            } catch (walletError) {
              console.warn('⚠️ Could not restore XION wallet:', walletError);
            }
          }
          
          // Set user as authenticated
          const user = adaptUserFromStorage(currentUser);
          dispatch({ type: 'SET_USER', payload: user });
          
          // Update last activity
          await UserStorageService.updateLastActivity(currentUser.id);
        } else {
          console.log('👤 No existing user session found');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Authentication initialization failed' });
        dispatch({ type: 'SET_USER', payload: null });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []);

  /**
   * Login with XION wallet
   */
  const login = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔐 Attempting XION wallet login...');
      
      // Try to connect XION wallet
      const wallet = await xionService.connectWallet();
      
      if (wallet) {
        console.log('✅ XION wallet connected:', wallet.address);
        
        // Check if user already exists with this wallet address
        let user = await UserStorageService.findUserByXionAddress(wallet.address);
        
        if (!user) {
          // Create new user with XION wallet
          console.log('👤 Creating new user with XION wallet');
          
          const userData = {
            email: `${wallet.address.slice(-8)}@xion.wallet`, // Temporary email
            password: `xion_${Date.now()}`, // Temporary password
            username: `User_${wallet.address.slice(-6)}`,
            firstName: 'XION',
            lastName: 'User',
            totalRegistrations: 0,
            totalVerifications: 0,
            registrationMethod: 'xion' as const
          };
          
          user = await UserStorageService.registerUser(userData);
          
          // Connect XION wallet to user
          await UserStorageService.connectXionWallet(user.id, {
            address: wallet.address,
            publicKey: wallet.publicKey,
            isAutoCreated: true,
            isNewlyCreated: true
          });
          
          // Refresh user data
          user = await UserStorageService.findUserById(user.id);
        }
        
        if (user) {
          // Set current user
          await UserStorageService.setCurrentUser(user);
          await UserStorageService.addActivity(user.id, {
            type: 'login',
            description: 'Logged in with XION wallet'
          });
          
          const authUser = adaptUserFromStorage(user);
          authUser.xionWallet = wallet; // Ensure wallet is included
          dispatch({ type: 'SET_USER', payload: authUser });
          
          console.log('✅ User logged in successfully');
        }
      } else {
        throw new Error('Failed to connect XION wallet');
      }
    } catch (error) {
      console.error('❌ XION login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'XION login failed' });
    }
  };

  /**
   * Login with email and password
   */
  const loginWithEmail = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('📧 Attempting email login:', email);
      
      const user = await UserStorageService.authenticateUser(email, password);
      
      if (user) {
        await UserStorageService.setCurrentUser(user);
        await UserStorageService.addActivity(user.id, {
          type: 'login',
          description: 'Logged in with email'
        });
        
        const authUser = adaptUserFromStorage(user);
        dispatch({ type: 'SET_USER', payload: authUser });
        
        console.log('✅ Email login successful');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Email login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Email login failed' });
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('📝 Registering new user:', userData.email);
      
      // Create user with UserStorageService
      const newUser = await UserStorageService.registerUser({
        ...userData,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        totalRegistrations: 0,
        totalVerifications: 0,
        registrationMethod: 'create'
      });
      
      // Try to create XION wallet for new user
      try {
        console.log('🔐 Creating XION wallet for new user...');
        const wallet = await xionService.createWallet({
          username: userData.username,
          zkTLS: true
        });
        
        if (wallet) {
          // Connect wallet to user
          await UserStorageService.connectXionWallet(newUser.id, {
            address: wallet.address,
            publicKey: wallet.publicKey,
            isAutoCreated: true,
            isNewlyCreated: true
          });
          
          console.log('✅ XION wallet created and connected');
        }
      } catch (walletError) {
        console.warn('⚠️ Failed to create XION wallet during registration:', walletError);
        // Continue without wallet - user can connect later
      }
      
      // Set user as current
      const updatedUser = await UserStorageService.findUserById(newUser.id);
      if (updatedUser) {
        await UserStorageService.setCurrentUser(updatedUser);
        const authUser = adaptUserFromStorage(updatedUser);
        dispatch({ type: 'SET_USER', payload: authUser });
      }
      
      console.log('✅ User registration successful');
    } catch (error) {
      console.error('❌ Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' });
    }
  };

  /**
   * Logout function
   * Clears authentication state and disconnects from XION
   */
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('🚪 Logging out user...');
      
      // Add logout activity if user exists
      if (state.user) {
        await UserStorageService.addActivity(state.user.id, {
          type: 'login',
          description: 'Logged out'
        });
      }
      
      // Clear UserStorageService session
      await UserStorageService.clearCurrentUser();
      
      // Disconnect XION wallet
      await xionService.disconnectWallet();
      
      // Clear authentication state
      dispatch({ type: 'LOGOUT' });
      
      console.log('🚪 User logged out successfully');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Logout failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Update user data
   */
  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return;
    
    try {
      console.log('📝 Updating user data...');
      
      // Update in storage
      const updatedStorageUser = await UserStorageService.updateUser(state.user.id, {
        username: updates.username,
        firstName: updates.firstName,
        lastName: updates.lastName,
        totalRegistrations: updates.totalRegistrations,
        totalVerifications: updates.totalVerifications
      });
      
      if (updatedStorageUser) {
        await UserStorageService.setCurrentUser(updatedStorageUser);
        const updatedUser = adaptUserFromStorage(updatedStorageUser);
        
        // Preserve XION wallet if it exists
        if (state.user.xionWallet) {
          updatedUser.xionWallet = state.user.xionWallet;
        }
        
        dispatch({ type: 'SET_USER', payload: updatedUser });
        console.log('✅ User data updated');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user data' });
    }
  };

  /**
   * Connect XION wallet to current user
   */
  const connectXionWallet = async () => {
    if (!state.user) return;
    
    try {
      console.log('🔗 Connecting XION wallet...');
      
      const wallet = await xionService.connectWallet();
      
      if (wallet) {
        // Update user with wallet info
        await UserStorageService.connectXionWallet(state.user.id, {
          address: wallet.address,
          publicKey: wallet.publicKey
        });
        
        // Update current user
        const updatedUser = await UserStorageService.findUserById(state.user.id);
        if (updatedUser) {
          await UserStorageService.setCurrentUser(updatedUser);
          const authUser = adaptUserFromStorage(updatedUser);
          authUser.xionWallet = wallet;
          dispatch({ type: 'SET_USER', payload: authUser });
        }
        
        console.log('✅ XION wallet connected successfully');
      }
    } catch (error) {
      console.error('❌ Error connecting XION wallet:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect XION wallet' });
    }
  };

  /**
   * Disconnect XION wallet from current user
   */
  const disconnectXionWallet = async () => {
    if (!state.user) return;
    
    try {
      console.log('🔌 Disconnecting XION wallet...');
      
      // Disconnect from service
      await xionService.disconnectWallet();
      
      // Update user storage
      await UserStorageService.disconnectXionWallet(state.user.id);
      
      // Update current user
      const updatedUser = await UserStorageService.findUserById(state.user.id);
      if (updatedUser) {
        await UserStorageService.setCurrentUser(updatedUser);
        const authUser = adaptUserFromStorage(updatedUser);
        dispatch({ type: 'SET_USER', payload: authUser });
      }
      
      console.log('✅ XION wallet disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting XION wallet:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to disconnect XION wallet' });
    }
  };

  /**
   * Add activity entry for current user
   */
  const addActivity = async (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    if (!state.user) return;
    
    try {
      await UserStorageService.addActivity(state.user.id, activity);
    } catch (error) {
      console.error('❌ Error adding activity:', error);
    }
  };

  /**
   * Context value
   */
  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    loginWithEmail,
    register,
    logout,
    updateUser,
    connectXionWallet,
    disconnectXionWallet,
    addActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
