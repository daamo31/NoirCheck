/**
 * Contexto de Autenticación Simple
 * Funcional con XION real
 */

import '../../polyfills'; // Import polyfills first
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  createdAt: string;
  xionConnected: boolean;
}

interface Wallet {
  address?: string;
  connected: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  wallet: Wallet | null;
  createAccount: (email: string, password: string) => Promise<boolean>;
  connectXION: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook real de Abstraxion
  const abstraxionAccount = useAbstraxionAccount();

  const createAccount = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔄 Creating account with XION...');
      
      // Guardar datos del usuario localmente
      const userData: User = {
        id: Date.now().toString(),
        email,
        createdAt: new Date().toISOString(),
        xionConnected: false
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Intentar conectar con XION
      try {
        await abstraxionAccount.login();
        console.log('✅ XION connection initiated');
      } catch (error) {
        console.warn('⚠️ XION connection will be attempted later:', error);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectXION = async (): Promise<boolean> => {
    try {
      console.log('🔄 Connecting to XION...');
      await abstraxionAccount.login();
      
      if (user) {
        const updatedUser = { ...user, xionConnected: true };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('❌ XION connection failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      if (abstraxionAccount.logout) {
        abstraxionAccount.logout();
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const wallet: Wallet | null = abstraxionAccount.isConnected ? {
    address: abstraxionAccount.data?.bech32Address,
    connected: true
  } : null;

  const value: AuthContextType = {
    user,
    isLoading,
    wallet,
    createAccount,
    connectXION,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
