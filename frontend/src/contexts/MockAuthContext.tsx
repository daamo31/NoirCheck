/**
 * Mock Auth Provider
 * Simplified authentication for development when XION is not fully configured
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const login = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user with realistic XION address
      const randomBytes = new Uint8Array(20);
      crypto.getRandomValues(randomBytes);
      const addressSuffix = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 39);
      
      const mockUser: MockUser = {
        id: 'mock-user-123',
        address: `xion1${addressSuffix}`,
        username: 'Usuario Demo',
        email: 'demo@noircheck.com',
        registeredAt: new Date().toISOString(),
        totalRegistrations: 5,
        totalVerifications: 12,
        lastActivity: new Date().toISOString()
      };

      // Registrar usuario en el backend si no existe
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
          console.log('Usuario registrado en backend');
        } else {
          // Si el usuario ya existe (409), está bien
          const errorData = await response.json();
          if (response.status !== 409) {
            console.warn('Error registrando usuario:', errorData);
          }
        }
      } catch (error) {
        console.warn('No se pudo conectar con el backend:', error);
      }

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
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const updateProfile = async (data: Partial<MockUser>) => {
    if (!state.user) return;
    
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null
    }));
  };

  const refreshUser = async () => {
    // Mock refresh - no action needed
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
