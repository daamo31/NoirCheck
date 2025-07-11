/**
 * Authentication Context
 * 
 * Provides global authentication state management using XION's Meta Account
 * technology. Handles user registration, login, logout, and session persistence.
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
import { apiService } from '@/services/api';

interface User {
  id: string;
  address: string;
  username?: string;
  email?: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  lastActivity: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

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

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { data: account } = useAbstraxionAccount();
  const [, setShowModal] = useModal();

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        if (account?.bech32Address) {
          // Check if user exists in our system
          const userData = await apiService.getUser(account.bech32Address);
          
          if (userData) {
            dispatch({ type: 'SET_USER', payload: userData });
          } else {
            // Auto-register new user
            const newUser = await apiService.registerUser({
              address: account.bech32Address,
              username: `user_${account.bech32Address.slice(-8)}`,
            });
            dispatch({ type: 'SET_USER', payload: newUser });
          }
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error al inicializar la autenticación' });
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initializeAuth();
  }, [account?.bech32Address]);

  const login = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      setShowModal(true);
      // The actual login is handled by Abstraxion modal
      // User data will be updated through the account effect
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al iniciar sesión' });
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Clear local storage
      localStorage.removeItem('noircheck_user');
      
      // Disconnect from Abstraxion
      // This will be handled by the account effect
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cerrar sesión' });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedUser = await apiService.updateUser(state.user.id, data);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar el perfil' });
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
