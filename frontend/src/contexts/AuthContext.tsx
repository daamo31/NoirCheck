/**
 * Authentication Context
 * 
 * Provides global authentication state management using XION's Meta Account
 * technology. Handles user registration, login, and session management with
 * integrated UserStorageService support.
 */

'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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
  firstName?: string;       // First name from registration
  lastName?: string;        // Last name from registration
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
    firstName: storageUser.firstName,
    lastName: storageUser.lastName,
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

  // XION integration
  let account = null;
  let setShowModal = null;
  let xionAvailable = false;

  try {
    const xionHooks = useAbstraxionAccount();
    const modalHooks = useModal();
    account = xionHooks.data;
    setShowModal = modalHooks[1]; // useModal returns [boolean, Dispatch<SetStateAction<boolean>>]
    xionAvailable = true;
    console.log('XION hooks available, account:', account?.bech32Address);
  } catch (error) {
    // XION not available - this is expected when AbstraxionProvider is not loaded
    console.info('XION hooks not available, running without XION functionality');
    xionAvailable = false;
  }

  // Initialize authentication state when component mounts
  // Integrates with UserStorageService for unified user management
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        console.log('🔍 Initializing auth with UserStorageService...');
        
        // Debug: Check localStorage contents
        const allUsers = UserStorageService.getAllUsers();
        console.log('👥 All users in storage:', allUsers);
        
        // Detailed debug for each user
        allUsers.forEach((user, index) => {
          console.log(`👤 User ${index + 1}:`, {
            email: user.email,
            username: user.username,
            address: user.address,
            registrationMethod: user.registrationMethod,
            xionWallet: user.xionWallet,
            metaMaskWallet: user.metaMaskWallet
          });
        });
        
        const currentUserEmail = localStorage.getItem('noircheck_current_user');
        console.log('📧 Current user email:', currentUserEmail);
        
        // Check for current session in UserStorageService
        const currentStorageUser = UserStorageService.getCurrentUser();
        if (currentStorageUser) {
          console.log('📱 Found current user session:', currentStorageUser.email);
          const currentUser = adaptUserFromStorage(currentStorageUser);
          dispatch({ type: 'SET_USER', payload: currentUser });
        } else {
          // If no current session but users exist, auto-login the last registered user
          if (allUsers.length > 0) {
            const lastUser = allUsers[allUsers.length - 1]; // Get the most recent user
            console.log('🔄 No active session found, auto-logging in most recent user:', lastUser.email);
            const success = UserStorageService.setCurrentUser(lastUser.email);
            if (success) {
              const adaptedUser = adaptUserFromStorage(lastUser);
              dispatch({ type: 'SET_USER', payload: adaptedUser });
              console.log('✅ Auto-login successful for:', lastUser.email);
            } else {
              console.error('❌ Failed to set current user:', lastUser.email);
            }
          } else {
            // No users exist - start in anonymous mode
            console.log('👤 No users found - starting in anonymous mode');
            dispatch({ type: 'SET_USER', payload: null });
          }
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
            firstName: 'Usuario',
            lastName: 'Demo',
            password: 'demo123',
            address: `xion1${addressSuffix}`,
            registrationMethod: 'xion',
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
    
    // Clear UserStorageService data
    UserStorageService.clearAllUsers();
    UserStorageService.clearCurrentUser();
    
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
    
    // Clear user state
    dispatch({ type: 'SET_USER', payload: null });
    
    console.log('🗑️ Complete cleanup finished - RELOAD REQUIRED');
    
    // Force hard reload after cleanup
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  /**
   * Update user profile
   * Updates user information in UserStorageService and refreshes local state
   */
  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('🔄 Updating user profile locally with UserStorageService...');
      
      // Convert AuthContext User data to UserStorageService format
      const updateData: any = {};
      if (data.username) updateData.username = data.username;
      if (data.email) updateData.email = data.email;
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      
      // Update in UserStorageService
      const success = UserStorageService.updateUser(state.user.id, updateData);
      
      if (success) {
        // Get updated user from storage
        const updatedStorageUser = UserStorageService.findUserByEmail(state.user.email!);
        if (updatedStorageUser) {
          const updatedUser = adaptUserFromStorage(updatedStorageUser);
          dispatch({ type: 'SET_USER', payload: updatedUser });
          console.log('✅ Profile updated successfully:', updatedUser);
        }
      } else {
        throw new Error('Failed to update user in storage');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Profile update failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Refresh user data
   * Fetches latest user information from UserStorageService
   */
  const refreshUser = async () => {
    if (!state.user) return;
    
    try {
      console.log('🔄 Refreshing user data from UserStorageService...');
      
      // Get current user from UserStorageService
      const currentStorageUser = UserStorageService.getCurrentUser();
      if (currentStorageUser) {
        const refreshedUser = adaptUserFromStorage(currentStorageUser);
        dispatch({ type: 'SET_USER', payload: refreshedUser });
        console.log('✅ User data refreshed:', refreshedUser);
      } else {
        console.warn('No current user found in UserStorageService');
      }
    } catch (error) {
      console.warn('Error refreshing user data from storage:', error);
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
