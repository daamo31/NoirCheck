/**
 * User Login Component
 * 
 * Handles user authentication for existing accounts.
 * Uses XION when available, fallback to MockAuth for development.
 */

'use client';

import { useState, useEffect } from 'react';
import { Lock, ArrowLeft, Shield, AlertCircle, CheckCircle, Wallet, User } from 'lucide-react';
import { XIONWalletConnectionOfficial } from './XIONWalletConnectionOfficial';

interface UserLoginProps {
  onBack: () => void;
  onLogin: (userData: any) => void;
}

export function UserLoginNew({ onBack, onLogin }: UserLoginProps) {
  const [showXionConnection, setShowXionConnection] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'select' | 'xion' | 'mock'>('select');

  // Mock login for development
  const handleMockLogin = () => {
    const mockUserData = {
      id: 'mock-user-dev',
      address: 'xion1mock7dev8user9address0example1234567890abcdef',
      username: 'Usuario Demo',
      email: 'demo@noircheck.com',
      firstName: 'John',
      lastName: 'Demo',
      registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalRegistrations: 3,
      totalVerifications: 8,
      lastActivity: new Date().toISOString()
    };

    onLogin(mockUserData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </button>
          
          <div className="bg-green-600 p-3 rounded-2xl w-fit mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">
            Choose your login method
          </p>
        </div>

        {/* Login Options */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
          {loginMethod === 'select' && (
            <>
              {/* XION Login Button */}
              <button
                onClick={() => setLoginMethod('xion')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect XION Wallet</span>
              </button>

              {/* Mock Login for Development */}
              <button
                onClick={handleMockLogin}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <User className="w-5 h-5" />
                <span>Demo Login (Development)</span>
              </button>

              {/* Info */}
              <div className="bg-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="text-yellow-300 font-medium mb-1">Development Mode</h3>
                    <p className="text-yellow-200 text-sm">
                      Use "Demo Login" for testing purposes. For production, use XION wallet connection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="text-center border-t border-gray-600 pt-4">
                <p className="text-gray-400 text-sm mb-4">
                  Don't have an account yet?
                </p>
                <button
                  onClick={onBack}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Create a new account instead
                </button>
              </div>
            </>
          )}

          {loginMethod === 'xion' && (
            <>
              {/* Back Button */}
              <button
                onClick={() => setLoginMethod('select')}
                className="mb-4 inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login options
              </button>

              {/* XION Connection Component */}
              <div className="bg-white/5 rounded-lg p-4">
                <XIONWalletConnectionOfficial />
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-blue-300 font-medium mb-1">Secure Login</h3>
                    <p className="text-blue-200 text-sm">
                      Your XION wallet provides secure, password-less authentication. 
                      Once connected, you'll automatically be logged into your NoirCheck account.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
