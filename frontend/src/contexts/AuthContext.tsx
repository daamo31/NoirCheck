/**
 * Authentication Context
 * 
 * Provides global authentication state management using XION's Meta Account
 * technology. Handles user r        // Only check for UserStorageService users, with legacy migration support
        console.log('🔍 Initializing auth with UserStorageService...');
        
        // Check for current session in UserStorageService
        const currentStorageUser = UserStorageService.getCurrentUser();
        if (currentStorageUser) {
          console.log('📱 Found current user session:', currentStorageUser.email);
          const currentUser = adaptUserFromStorage(currentStorageUser);
          dispatch({ type: 'SET_USER', payload: currentUser });
        } else {
          // Check for legacy mock user and migrate to UserStorageService
          const savedMockUser = localStorage.getItem('noircheck_mock_user');
          if (savedMockUser) {
            try {
              const mockUser = JSON.parse(savedMockUser);
              console.log('🔄 Migrating legacy mock user to UserStorageService:', mockUser.email);
              
              // Register in UserStorageService if not already there
              const existingUser = UserStorageService.findUserByEmail(mockUser.email);
              if (!existingUser) {
                UserStorageService.registerUser({
                  email: mockUser.email,
                  username: mockUser.username || 'Usuario Demo',
                  walletAddress: mockUser.address,
                  registrationMethod: 'legacy_migration',
                  walletType: 'mock'
                });
              }
              
              // Set as current user and cleanup legacy storage
              UserStorageService.setCurrentUser(mockUser.email);
              localStorage.removeItem('noircheck_mock_user');
              
              dispatch({ type: 'SET_USER', payload: mockUser });
            } catch (parseError) {
              console.error('Error migrating legacy user:', parseError);
              localStorage.removeItem('noircheck_mock_user');
              dispatch({ type: 'SET_USER', payload: null });
            }
          } else {
            // No saved user - start in anonymous mode
            console.log('👤 No saved user found - starting in anonymous mode');
            dispatch({ type: 'SET_USER', payload: null });
          }
        }logout, and session persistence.
 * 
 * Features:
 * - XION blockchain integration for secure authentication
 * - Automatic user registration for new addresses
 * - Session persistence across browser refreshes
 * - Profile management and updates
 * - Real-time authentication state management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
import { apiService } from '@/services/api';
import { UserStorageService } from '@/services/userStorageService';

/**
 * User interface representing authenticated user data
 */
interface User {
  id: string;
  address: string;           // XION blockchain address
  username?: string;         // Optional display name
  email?: string;           // Optional email address
  registeredAt: string;     // Registration timestamp
  totalRegistrations: number; // Total content registrations
  totalVerifications: number; // Total verifications performed
  lastActivity: string;     // Last activity timestamp
}

/**
 * Convert UserStorageService User to AuthContext User
 */
function adaptUserFromStorage(storageUser: import('@/services/userStorageService').User): User {
  return {
    id: storageUser.id,
    address: storageUser.address || storageUser.xionWallet?.address || storageUser.metaMaskWallet?.address || '',
    username: storageUser.username,
    email: storageUser.email,
    registeredAt: storageUser.registeredAt,
    totalRegistrations: storageUser.totalRegistrations,
    totalVerifications: storageUser.totalVerifications,
    lastActivity: storageUser.lastActivity
  };
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;        // Current authenticated user
  isAuthenticated: boolean; // Authentication status
  isLoading: boolean;      // Loading state for async operations
  error: string | null;    // Error message if any
}

/**
 * Authentication context type with methods
 */
interface AuthContextType extends AuthState {
  login: () => Promise<void>;                    // Initiate XION wallet login process
  loginWithEmail: (email: string, password?: string) => Promise<boolean>; // Login with email/password
  logout: () => Promise<void>;                   // Logout and clear session
  updateProfile: (data: Partial<User>) => Promise<void>; // Update user profile
  refreshUser: () => Promise<void>;              // Refresh user data
  clearUserData: () => void;                     // Clear all user data (dev only)
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Available authentication actions for state reducer
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

/**
 * Authentication state reducer
 * Manages authentication state transitions
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

// Initial authentication state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

/**
 * Authentication Provider Component
 * 
 * Wraps the application with authentication context and manages XION
 * integration for user authentication and registration.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Safely access XION hooks only when available
  let account = null;
  let setShowModal = null;
  let xionAvailable = false;
  
  try {
    // Only try to use XION hooks if AbstraxionProvider is in context
    const xionAccount = useAbstraxionAccount();
    const xionModal = useModal();
    account = xionAccount?.data;
    setShowModal = xionModal?.[1];
    xionAvailable = true;
  } catch (error) {
    // XION not available - this is expected when AbstraxionProvider is not loaded
    console.info('XION hooks not available, running without XION functionality');
    xionAvailable = false;
  }

  // Initialize authentication state when component mounts
  // NOTE: Removed automatic XION user loading to prevent auto-login
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Only check for saved mock user, don't auto-load XION users
        console.log('� Initializing auth (no auto-login)...');
        
        // Check for saved mock user in localStorage
        const savedMockUser = localStorage.getItem('noircheck_mock_user');
        if (savedMockUser) {
          try {
            const mockUser = JSON.parse(savedMockUser);
            console.log('📱 Found saved mock user:', mockUser.email);
            dispatch({ type: 'SET_USER', payload: mockUser });
          } catch (parseError) {
            console.error('Error parsing saved mock user:', parseError);
            localStorage.removeItem('noircheck_mock_user');
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          // No saved user - start in anonymous mode
          console.log('👤 No saved user found - starting in anonymous mode');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Authentication initialization failed' });
        dispatch({ type: 'SET_USER', payload: null });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []); // Removed dependency on account?.bech32Address

  /**
   * Opens XION authentication modal for user to connect their wallet
   */
  const login = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      if (xionAvailable && setShowModal) {
        // XION is available - show modal
        setShowModal(true);
        // The actual login is handled by Abstraxion modal
        // User data will be updated through the account effect above
      } else {
        // XION not available - create mock user for development using UserStorageService
        console.log('XION not available, creating mock user via UserStorageService');
        
        // Check if we already have a demo user in UserStorageService
        let mockUser = UserStorageService.findUserByEmail('demo@noircheck.com');
        
        if (!mockUser) {
          // Create new mock user via UserStorageService
          const randomBytes = new Uint8Array(20);
          crypto.getRandomValues(randomBytes);
          const addressSuffix = Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .substring(0, 39);
          
          UserStorageService.registerUser({
            email: 'demo@noircheck.com',
            username: 'Usuario Demo',
            address: `xion1${addressSuffix}`,
            registrationMethod: 'xion',
            password: 'demo123', // For demo user
            firstName: 'Usuario',
            lastName: 'Demo',
            totalRegistrations: 0,
            totalVerifications: 0
          });
          
          mockUser = UserStorageService.findUserByEmail('demo@noircheck.com');
        }
        
        if (mockUser) {
          // Set as current user
          UserStorageService.setCurrentUser('demo@noircheck.com');
          
          const adaptedUser = adaptUserFromStorage(mockUser);
          
          // Try to register/update user in backend
          try {
            const response = await apiService.registerUser({
              address: adaptedUser.address,
              username: adaptedUser.username,
              email: adaptedUser.email
            });
            
            // Update with backend data if successful
            if (response) {
              // Update the user in UserStorageService with backend data
              const updatedUser = { ...adaptedUser, ...response };
              dispatch({ type: 'SET_USER', payload: updatedUser });
            } else {
              dispatch({ type: 'SET_USER', payload: adaptedUser });
            }
          } catch (backendError) {
            console.warn('Backend not available, using local mock user:', backendError);
            dispatch({ type: 'SET_USER', payload: adaptedUser });
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Login with email and optional password
   * Uses UserStorageService to authenticate users
   */
  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔍 Attempting login with email:', email);
      
      // Find user in UserStorageService
      const user = UserStorageService.findUserByEmail(email);
      if (!user) {
        console.log('❌ User not found:', email);
        dispatch({ type: 'SET_ERROR', payload: 'Usuario no encontrado' });
        return false;
      }
      
      // For now, we don't have password authentication - just email verification
      // In a real app, you would verify the password here
      console.log('✅ User found, logging in:', user.email);
      
      // Set as current user
      UserStorageService.setCurrentUser(email);
      
      // Convert to AuthContext User format
      const adaptedUser = adaptUserFromStorage(user);
      
      // Update auth state
      dispatch({ type: 'SET_USER', payload: adaptedUser });
      
      return true;
    } catch (error) {
      console.error('Login with email error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error de inicio de sesión' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Logout function
   * Clears authentication state and disconnects from XION
   */
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Clear UserStorageService session
      UserStorageService.clearCurrentUser();
      
      // Clear any legacy local storage data
      localStorage.removeItem('noircheck_user');
      localStorage.removeItem('noircheck_mock_user');
      localStorage.removeItem('noircheck_enable_xion');
      localStorage.removeItem('noircheck_session');
      
      // Clear authentication state
      dispatch({ type: 'LOGOUT' });
      
      // If XION is available, try to disconnect
      if (xionAvailable && setShowModal) {
        try {
          // This will trigger XION disconnection
          setShowModal(false);
        } catch (xionError) {
          console.warn('XION disconnection warning:', xionError);
        }
      }
      
      console.log('🚪 User logged out successfully');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Logout failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Clear all stored user data (for development)
   */
  const clearUserData = async () => {
    console.log('🧹 Starting complete cleanup...');
    
    // Clear all localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      keysToRemove.push(localStorage.key(i));
    }
    keysToRemove.forEach(key => {
      if (key) {
        console.log('🗑️ Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Clear all sessionStorage keys  
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      sessionKeysToRemove.push(sessionStorage.key(i));
    }
    sessionKeysToRemove.forEach(key => {
      if (key) {
        console.log('🗑️ Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear user state
    dispatch({ type: 'SET_USER', payload: null });
    
    // Clear XION specific data if available
    try {
      // Try to clear XION session data
      if (typeof window !== 'undefined') {
        // Clear all XION related keys specifically
        const xionKeys = [
          'abstraxion_session',
          'abstraxion_account', 
          'abstraxion_wallet',
          'abstraxion-account',
          'abstraxion-client',
          'abstraxion-signer',
          'xion_session',
          'xion_account',
          'xion_wallet',
          'cosmos_kit_wallet',
          'keplr_autoconnect',
        ];
        
        xionKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // Clear IndexedDB related to XION (if accessible)
        if ('indexedDB' in window) {
          try {
            console.log('🗑️ Clearing IndexedDB databases...');
            indexedDB.deleteDatabase('abstraxion');
            indexedDB.deleteDatabase('xion');
            indexedDB.deleteDatabase('cosmos-kit');
          } catch (idbError) {
            console.warn('Could not clear IndexedDB:', idbError);
          }
        }
      }
    } catch (xionError) {
      console.warn('Error clearing XION data:', xionError);
    }
    
    console.log('🗑️ Complete cleanup finished - RELOAD REQUIRED');
    
    // Force hard reload after cleanup
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  /**
   * Update user profile
   * Updates user information in the backend and refreshes local state
   */
  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedUser = await apiService.updateUser(state.user.id, data);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Profile update failed' });
    }
  };

  /**
   * Refresh user data
   * Fetches latest user information from the backend
   */
  const refreshUser = async () => {
    if (!state.user) return;
    
    try {
      // Try to get updated data from backend
      const userData = await apiService.getUser(state.user.address);
      if (userData) {
        dispatch({ type: 'SET_USER', payload: userData });
        
        // If this is a mock user, also update localStorage
        if (state.user.id.startsWith('mock-user-')) {
          localStorage.setItem('noircheck_mock_user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.warn('Backend not available for user refresh, keeping current user data:', error);
      
      // If backend is not available but we have a mock user, update the activity timestamp
      if (state.user.id.startsWith('mock-user-')) {
        const updatedUser = {
          ...state.user,
          lastActivity: new Date().toISOString()
        };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        localStorage.setItem('noircheck_mock_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Create context value with state and methods
  const value: AuthContextType = {
    ...state,
    login,
    loginWithEmail,
    logout,
    updateProfile,
    refreshUser,
    clearUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use authentication context
 * Provides easy access to authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
