/**
 * Mock Auth Provider
 * Simplified authentication for development when XION is not fully configured
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockUser {
  id: string;
  address: string;
  username?: string;
  email?: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  lastActivity: string;
}

interface MockAuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface MockAuthContextType extends MockAuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<MockUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('mockUser');
      }
    }
  }, []);

  const login = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we have a saved user, otherwise create a new one
      let mockUser: MockUser;
      const savedUser = localStorage.getItem('mockUser');
      
      if (savedUser) {
        mockUser = JSON.parse(savedUser);
        // Update last activity
        mockUser.lastActivity = new Date().toISOString();
      } else {
        // Create new mock user with consistent data
        const randomBytes = new Uint8Array(20);
        crypto.getRandomValues(randomBytes);
        const addressSuffix = Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .substring(0, 39);
        
        mockUser = {
          id: `user-${Date.now()}`,
          address: `xion1${addressSuffix}`,
          username: 'Usuario Demo',
          email: 'demo@noircheck.com',
          registeredAt: new Date().toISOString(),
          totalRegistrations: 0,
          totalVerifications: 0,
          lastActivity: new Date().toISOString()
        };
      }

      // Try to get updated stats from backend
      try {
        const response = await fetch(`http://localhost:8000/users/${mockUser.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          mockUser.totalRegistrations = stats.totalRegistrations || 0;
          mockUser.totalVerifications = stats.totalVerifications || 0;
          console.log('Stats actualizados desde backend:', stats);
        }
      } catch (error) {
        console.warn('No se pudieron obtener stats del backend:', error);
      }

      // Register user in backend if it doesn't exist
      try {
        const response = await fetch('http://localhost:8000/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: mockUser.address,
            username: mockUser.username,
            email: mockUser.email
          })
        });

        if (response.ok) {
          console.log('Usuario registrado/actualizado en backend');
        } else if (response.status === 409) {
          console.log('Usuario ya existe en backend');
        } else {
          const errorData = await response.json();
          console.warn('Error registrando usuario:', errorData);
        }
      } catch (error) {
        console.warn('No se pudo conectar con el backend:', error);
      }

      // Save user to localStorage
      localStorage.setItem('mockUser', JSON.stringify(mockUser));

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al iniciar sesión'
      }));
    }
  };

  const logout = async () => {
    localStorage.removeItem('mockUser');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const updateProfile = async (data: Partial<MockUser>) => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user, ...data };
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    
    setState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  const refreshUser = async () => {
    if (!state.user) return;
    
    try {
      // Try to get updated stats from backend
      const response = await fetch(`http://localhost:8000/users/${state.user.id}/stats`);
      if (response.ok) {
        const stats = await response.json();
        const updatedUser = {
          ...state.user,
          totalRegistrations: stats.totalRegistrations || 0,
          totalVerifications: stats.totalVerifications || 0,
          lastActivity: new Date().toISOString()
        };
        
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        setState(prev => ({
          ...prev,
          user: updatedUser
        }));
        
        console.log('Usuario actualizado con stats del backend:', stats);
      }
    } catch (error) {
      console.warn('Error al refrescar datos del usuario:', error);
    }
  };

  const value: MockAuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}

// Hook seguro que no lanza error si no está en un provider
export function useMockAuthSafe() {
  const context = useContext(MockAuthContext);
  return context || {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: async () => {},
    logout: async () => {},
    updateProfile: async () => {},
    refreshUser: async () => {}
  };
}
