/**
 * Authentication Flow Component
 * 
 * Main authentication flow manager that handles navigation between
 * landing page, registration, login, and authenticated dashboard.
 * 
 * Features:
 * - State management for authentication flow
 * - Navigation between auth screens
 * - User session management
 * - XION integration only when needed
 * - Fallback to landing page on errors
 */

'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/layout/LandingPage';
import { UserRegistrationNew } from './UserRegistrationNew';
import { UserLoginNew } from './UserLoginNew';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

type AuthFlow = 'landing' | 'register' | 'login' | 'dashboard';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  registeredAt?: string;
  totalRegistrations?: number;
  totalVerifications?: number;
  lastActivity?: string;
}

export function AuthFlow() {
  const [currentFlow, setCurrentFlow] = useState<AuthFlow>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on mount - DISABLED for manual login only
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // NOTE: Auto-login is disabled - users must manually log in
        console.log('🚫 Auto-login disabled - requiring manual authentication');
        
        // Clear any existing session data to prevent auto-login
        localStorage.removeItem('noircheck_user');
        localStorage.removeItem('noircheck_enable_xion');
        
      } catch (error) {
        console.error('Error during session cleanup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Handle navigation to registration
  const handleCreateAccount = () => {
    setCurrentFlow('register');
  };

  // Handle navigation to login
  const handleLogin = () => {
    setCurrentFlow('login');
  };

  // Handle back to landing page
  const handleBackToLanding = () => {
    setCurrentFlow('landing');
  };

  // Handle successful registration
  const handleRegistrationComplete = (userData: User) => {
    setUser(userData);
    // Save user data to local storage
    localStorage.setItem('noircheck_user', JSON.stringify(userData));
    // Enable XION for future use
    localStorage.setItem('noircheck_enable_xion', 'true');
    setCurrentFlow('dashboard');
  };

  // Handle successful login
  const handleLoginComplete = (userData: User) => {
    setUser(userData);
    // Save user data to local storage
    localStorage.setItem('noircheck_user', JSON.stringify(userData));
    // Enable XION for future use
    localStorage.setItem('noircheck_enable_xion', 'true');
    setCurrentFlow('dashboard');
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading NoirCheck...</p>
        </div>
      </div>
    );
  }

  // Render current flow
  switch (currentFlow) {
    case 'landing':
      return (
        <LandingPage
          onCreateAccount={handleCreateAccount}
          onLogin={handleLogin}
        />
      );

    case 'register':
      return (
        <UserRegistrationNew
          onBack={handleBackToLanding}
          onComplete={handleRegistrationComplete}
        />
      );

    case 'login':
      return (
        <UserLoginNew
          onBack={handleBackToLanding}
          onLogin={handleLoginComplete}
        />
      );

    case 'dashboard':
      if (!user) {
        // Fallback to landing if no user data
        setCurrentFlow('landing');
        return null;
      }
      return <UserDashboard />;

    default:
      return (
        <LandingPage
          onCreateAccount={handleCreateAccount}
          onLogin={handleLogin}
        />
      );
  }
}
