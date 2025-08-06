/**
 * Contexto de Autenticación XION
 * Implementación completa según documentación oficial
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  createdAt: string;
  xionConnected: boolean;
  metaAddress?: string;
}

interface Wallet {
  address?: string;
  connected: boolean;
}

interface UserMapData {
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  wallet: Wallet | null;
  createAccount: (email: string, password: string) => Promise<boolean>;
  connectXION: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserMap: (data: UserMapData) => Promise<boolean>;
  getUserMapData: () => Promise<UserMapData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks oficiales de Abstraxion
  const abstraxionAccount = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Sincronizar estado de XION con usuario local
  useEffect(() => {
    if (abstraxionAccount.isConnected && user) {
      const updatedUser = { 
        ...user, 
        xionConnected: true,
        metaAddress: abstraxionAccount.data?.bech32Address 
      };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [abstraxionAccount.isConnected, abstraxionAccount.data]);

  const loadUserFromStorage = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  };

  const createAccount = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔄 Creating NoirCheck account...');
      
      // Guardar datos del usuario localmente (NO conectar XION automáticamente)
      const userData: User = {
        id: Date.now().toString(),
        email,
        createdAt: new Date().toISOString(),
        xionConnected: false
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ NoirCheck account created successfully');
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
      setIsLoading(true);
      console.log('🔄 Connecting to XION via Meta Account...');
      
      // Usar el método oficial de Abstraxion
      await abstraxionAccount.login();
      
      if (abstraxionAccount.isConnected && user) {
        const updatedUser = { 
          ...user, 
          xionConnected: true,
          metaAddress: abstraxionAccount.data?.bech32Address 
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ XION connected successfully');
      }
      
      return true;
    } catch (error) {
      console.error('❌ XION connection failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserMap = async (data: UserMapData): Promise<boolean> => {
    try {
      if (!signingClient || !abstraxionAccount.data?.bech32Address) {
        console.warn('⚠️ XION not connected, skipping User Map update');
        return false;
      }

      const contractAddress = process.env.EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('⚠️ User Map contract address not configured');
        return false;
      }

      const msg = {
        update_user_map: {
          user_data: JSON.stringify(data)
        }
      };

      console.log('🔄 Updating User Map contract...');
      const result = await signingClient.execute(
        abstraxionAccount.data.bech32Address,
        contractAddress,
        msg,
        'auto'
      );

      console.log('✅ User Map updated:', result);
      return true;
    } catch (error) {
      console.error('❌ User Map update failed:', error);
      return false;
    }
  };

  const getUserMapData = async (): Promise<UserMapData | null> => {
    try {
      if (!signingClient || !abstraxionAccount.data?.bech32Address) {
        console.warn('⚠️ XION not connected, cannot query User Map');
        return null;
      }

      const contractAddress = process.env.EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('⚠️ User Map contract address not configured');
        return null;
      }

      const query = {
        get_user_map: {
          user_address: abstraxionAccount.data.bech32Address
        }
      };

      console.log('🔄 Querying User Map contract...');
      const result = await signingClient.queryContractSmart(contractAddress, query);
      
      return result ? JSON.parse(result.user_data || '{}') : null;
    } catch (error) {
      console.error('❌ User Map query failed:', error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      // Logout de Abstraxion si está disponible
      if (abstraxionAccount.logout) {
        abstraxionAccount.logout();
      }
      
      console.log('✅ User logged out');
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
    isAuthenticated: !!user,
    updateUserMap,
    getUserMapData
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