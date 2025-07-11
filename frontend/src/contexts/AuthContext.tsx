/**
 * Authentication Context
 * 
 * Provides global authentication state management using XION's Meta Account
 * technology. Handles user registration, login, logout, and session persistence.
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
  login: () => Promise<void>;                    // Initiate login process
  logout: () => Promise<void>;                   // Logout and clear session
  updateProfile: (data: Partial<User>) => Promise<void>; // Update user profile
  refreshUser: () => Promise<void>;              // Refresh user data
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

  // Initialize authentication state when component mounts or account changes
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        if (xionAvailable && account?.bech32Address) {
          // XION is available and user is connected
          const userData = await apiService.getUser(account.bech32Address);
          
          if (userData) {
            dispatch({ type: 'SET_USER', payload: userData });
          } else {
            // New user - auto-register with XION address
            const newUser = await apiService.registerUser({
              address: account.bech32Address,
              username: `user_${account.bech32Address.slice(-8)}`,
            });
            dispatch({ type: 'SET_USER', payload: newUser });
          }
        } else {
          // No XION account or XION not available - start in anonymous mode
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Authentication initialization failed' });
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initializeAuth();
  }, [account?.bech32Address, xionAvailable]);

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
        // XION not available - provide instructions
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'XION wallet connection not available. Click "Connect XION Wallet" to enable blockchain features.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
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
      // Clear any local storage data
      localStorage.removeItem('noircheck_user');
      
      // Clear authentication state
      // XION disconnection is handled automatically by Abstraxion
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Logout failed' });
    }
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
      const userData = await apiService.getUser(state.user.address);
      if (userData) {
        dispatch({ type: 'SET_USER', payload: userData });
      }
    } catch (error) {
      console.error('User refresh error:', error);
    }
  };

  // Create context value with state and methods
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    refreshUser
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
