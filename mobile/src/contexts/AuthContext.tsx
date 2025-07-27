import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email: string;
  address?: string;
  totalRegistrations: number;
  totalVerifications: number;
  registeredAt: string;
  lastActivity: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithWallet: (address: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada al iniciar
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulación de autenticación (reemplazar con API real)
      if (email && password) {
        const mockUser: User = {
          id: '1',
          username: email.split('@')[0],
          email,
          address: 'xion1abc...def123',
          totalRegistrations: 3,
          totalVerifications: 7,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        // Guardar en storage
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        await AsyncStorage.setItem('authToken', 'mock-token-123');
        
        setUser(mockUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (address: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (address) {
        const mockUser: User = {
          id: '1',
          username: `User_${address.slice(-6)}`,
          email: '',
          address,
          totalRegistrations: 2,
          totalVerifications: 5,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        await AsyncStorage.setItem('authToken', 'wallet-token-123');
        
        setUser(mockUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during wallet login:', error);
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
          address: userData.address || `xion1${Math.random().toString(36).substr(2, 9)}`,
          totalRegistrations: 0,
          totalVerifications: 0,
          registeredAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('authToken', 'new-user-token-123');
        
        setUser(newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
