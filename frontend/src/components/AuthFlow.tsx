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
import { LandingPage } from './LandingPage';
import { UserRegistration } from './UserRegistration';
import { UserLoginNew } from './UserLoginNew';
import { UserDashboard } from './UserDashboard';

type AuthFlow = 'landing' | 'register' | 'login' | 'dashboard';

interface User {
  id: string;
  address: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  lastActivity: string;
}

export function AuthFlow() {
  const [currentFlow, setCurrentFlow] = useState<AuthFlow>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Check local storage for saved user
        const savedUser = localStorage.getItem('noircheck_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setCurrentFlow('dashboard');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear invalid data
        localStorage.removeItem('noircheck_user');
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

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('noircheck_user');
    localStorage.removeItem('noircheck_enable_xion');
    setCurrentFlow('landing');
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
        <UserRegistration
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
