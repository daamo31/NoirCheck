/**
 * Contexto de Autenticación simplificado
 * Versión temporal sin hooks de Abstraxion para evitar problemas de Metro
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  createdAt: string;
  xionConnected: boolean;
  metaAddress?: string;
  predefinedWallet?: string; // Dirección predefinida para demo
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
  
  // TEMPORAL: Comentado para evitar problemas de Metro con Abstraxion
  // const abstraxionAccount = useAbstraxionAccount();
  // const { client: signingClient } = useAbstraxionSigningClient();

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // TEMPORAL: Comentado para evitar problemas con Abstraxion
  // useEffect(() => {
  //   if (abstraxionAccount.isConnected && user) {
  //     const updatedUser = { 
  //       ...user, 
  //       xionConnected: true,
  //       metaAddress: abstraxionAccount.data?.bech32Address 
  //     };
  //     setUser(updatedUser);
  //     AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  //   }
  // }, [abstraxionAccount.isConnected, abstraxionAccount.data]);

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
      
      // Asignar dirección predefinida del env para demo
      const predefinedWallet = "xion1h0ryxfpzsza9hrwwknyszl8rnx63cafh02l4q82wyssycq39vsyqpjts45";
      
      // Guardar datos del usuario localmente (NO conectar XION automáticamente)
      const userData: User = {
        id: Date.now().toString(),
        email,
        createdAt: new Date().toISOString(),
        xionConnected: false,
        predefinedWallet
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ NoirCheck account created successfully with wallet:', predefinedWallet);
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
      
      // TEMPORAL: Simular conexión XION exitosa para evitar bloqueos con Metro
      console.log('⚠️ XION connection simulated for demo purposes');
      
      if (user) {
        // Simular conexión exitosa usando la dirección predefinida
        const simulatedAddress = "xion1h0ryxfpzsza9hrwwknyszl8rnx63cafh02l4q82wyssycq39vsyqpjts45";
        const updatedUser = { 
          ...user, 
          xionConnected: true,
          metaAddress: simulatedAddress
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ XION connection simulated successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ XION connection failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserMap = async (data: UserMapData): Promise<boolean> => {
    try {
      // TEMPORAL: Simulación sin cliente de signing real
      console.warn('⚠️ User Map update simulated - XION integration temporarily disabled');
      return true;
    } catch (error) {
      console.error('❌ User Map update failed:', error);
      return false;
    }
  };

  const getUserMapData = async (): Promise<UserMapData | null> => {
    try {
      // TEMPORAL: Simulación sin cliente de signing real
      console.warn('⚠️ User Map query simulated - XION integration temporarily disabled');
      return null;
    } catch (error) {
      console.error('❌ User Map query failed:', error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      // TEMPORAL: Comentado logout de Abstraxion
      // if (abstraxionAccount.logout) {
      //   abstraxionAccount.logout();
      // }
      
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const wallet: Wallet | null = user?.predefinedWallet ? {
    address: user.predefinedWallet,
    connected: user.xionConnected || false // Usar el estado real de conexión XION
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