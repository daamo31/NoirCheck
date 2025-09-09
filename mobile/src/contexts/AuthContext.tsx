/**
 * Contexto de Autenticación con XION Abstraxion Real
 * Integración completa con hooks de Abstraxion React Native
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  useAbstraxionAccount, 
  useAbstraxionSigningClient
} from '@burnt-labs/abstraxion-react-native';

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  createdAt: string;
  xionConnected: boolean;
  metaAddress?: string;
  // Removed predefinedWallet - users must connect manually
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
  clearAllDemoData: () => Promise<void>;
  // Abstraxion real states
  xionAccount: any;
  isConnected: boolean;
  isConnecting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados locales
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hooks reales de Abstraxion
  const { 
    data: xionAccount, 
    isConnected, 
    isConnecting,
    login: xionLogin,
    logout: xionLogout
  } = useAbstraxionAccount();
  
  const { client: signingClient } = useAbstraxionSigningClient();
  
  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Monitorear cambios en la conexión XION y actualizar el usuario
  useEffect(() => {
    const updateUserWithXION = async () => {
      if (isConnected && xionAccount && user && !user.xionConnected) {
        console.log('🔗 XION connection detected, updating user...');
        const updatedUser = { 
          ...user, 
          xionConnected: true,
          metaAddress: xionAccount.bech32Address
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ User updated with XION wallet:', xionAccount.bech32Address);
      }
    };

    updateUserWithXION();
  }, [isConnected, xionAccount, user]);

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
      
      // Crear usuario sin wallet predefinida - debe conectar explícitamente
      const userData: User = {
        id: Date.now().toString(),
        email,
        createdAt: new Date().toISOString(),
        xionConnected: false
        // No predefinedWallet - usuario debe conectar manualmente
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
      console.log('🔄 Connecting to XION via Abstraxion...');
      
      if (isConnected && xionAccount) {
        console.log('✅ Already connected to XION');
        
        if (user && !user.xionConnected) {
          // Update user with XION connection
          const updatedUser = { 
            ...user, 
            xionConnected: true,
            metaAddress: xionAccount.bech32Address
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        
        return true;
      }
      
      // Usar el método login de Abstraxion para iniciar la conexión
      console.log('🚀 Initiating XION login process...');
      await xionLogin();
      
      console.log('✅ XION login initiated successfully');
      
      // El estado se actualizará automáticamente a través de los hooks
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
      // Simular actualización hasta resolver polyfills
      console.warn('⚠️ User Map update simulated - XION integration temporarily disabled');
      return true;
    } catch (error) {
      console.error('❌ User Map update failed:', error);
      return false;
    }
  };

  const getUserMapData = async (): Promise<UserMapData | null> => {
    try {
      // Simular query hasta resolver polyfills
      console.warn('⚠️ User Map query simulated - XION integration temporarily disabled');
      return null;
    } catch (error) {
      console.error('❌ User Map query failed:', error);
      return null;
    }
  };

  const clearAllDemoData = async (): Promise<void> => {
    try {
      // Limpiar todo el storage del usuario y contenido
      await AsyncStorage.multiRemove(['user', '@NoirCheck:RegisteredContent']);
      
      // Resetear estado local
      setUser(null);
      
      console.log('🗑️ Cleared all demo data and user storage');
    } catch (error) {
      console.error('❌ Failed to clear demo data:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      // Usar logout real de Abstraxion
      if (isConnected) {
        xionLogout();
        console.log('🔌 XION wallet disconnected');
      }
      
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const wallet: Wallet | null = user?.metaAddress ? {
    address: user.metaAddress,
    connected: user.xionConnected || false
  } : (xionAccount ? {
    address: xionAccount.bech32Address,
    connected: isConnected
  } : null);

  const value: AuthContextType = {
    user,
    isLoading,
    wallet,
    createAccount,
    connectXION,
    logout,
    isAuthenticated: !!user,
    updateUserMap,
    getUserMapData,
    clearAllDemoData,
    // Abstraxion real states
    xionAccount,
    isConnected,
    isConnecting
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