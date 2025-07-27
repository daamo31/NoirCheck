import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { xionService, XIONWallet } from '../services/XionService';

interface User {
  id: string;
  username: string;
  email: string;
  address?: string;
  totalRegistrations: number;
  totalVerifications: number;
  registeredAt: string;
  lastActivity: string;
  wallet?: XIONWallet;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithWallet: () => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  connectXionWallet: () => Promise<boolean>;
  disconnectXionWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Initialize XION service
      await xionService.initialize();
      
      // Check for stored user session
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        
        // Check if user has a connected XION wallet
        const wallet = xionService.getWallet();
        if (wallet) {
          userData.wallet = wallet;
          userData.address = wallet.address;
        }
        
        setUser(userData);
        console.log('✅ User session restored');
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would authenticate with your backend
      if (email && password) {
        const newUser: User = {
          id: '1',
          username: email.split('@')[0],
          email,
          totalRegistrations: 0,
          totalVerifications: 0,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        // Save user session
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('authToken', 'user-token-123');
        
        setUser(newUser);
        console.log('✅ User logged in:', email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error during login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Connect XION wallet
      const wallet = await xionService.connectWallet();
      
      if (wallet) {
        const newUser: User = {
          id: wallet.address,
          username: `User_${wallet.address.slice(-6)}`,
          email: '',
          address: wallet.address,
          wallet: wallet,
          totalRegistrations: 0,
          totalVerifications: 0,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('authToken', 'wallet-token-123');
        
        setUser(newUser);
        console.log('✅ User logged in with wallet:', wallet.address);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error during wallet login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (userData.email && userData.username) {
        const newUser: User = {
          id: Date.now().toString(),
          username: userData.username,
          email: userData.email,
          totalRegistrations: 0,
          totalVerifications: 0,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('authToken', 'new-user-token-123');
        
        setUser(newUser);
        console.log('✅ User registered:', userData.email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error during registration:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      await xionService.disconnectWallet();
      setUser(null);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const connectXionWallet = async (): Promise<boolean> => {
    try {
      const wallet = await xionService.connectWallet();
      
      if (wallet && user) {
        const updatedUser = { 
          ...user, 
          wallet, 
          address: wallet.address,
          lastActivity: new Date().toISOString()
        };
        
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ XION wallet connected:', wallet.address);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error connecting XION wallet:', error);
      return false;
    }
  };

  const disconnectXionWallet = async (): Promise<void> => {
    try {
      await xionService.disconnectWallet();
      
      if (user) {
        const updatedUser = { 
          ...user, 
          wallet: undefined, 
          address: undefined,
          lastActivity: new Date().toISOString()
        };
        
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ XION wallet disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting XION wallet:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithWallet,
    register,
    logout,
    updateUser,
    connectXionWallet,
    disconnectXionWallet,
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
