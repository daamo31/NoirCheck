/**
 * User Login Component
 * 
 * Multiple login methods:
 * 1. Traditional: email/password
 * 2. XION Wallet: Connect with registered XION wallet
 * 3. MetaMask: Connect with registered MetaMask wallet
 * All wallet connections must be linked to an existing registered user.
 */

'use client';

import { useState } from 'react';
import { Lock, ArrowLeft, User, Mail, Eye, EyeOff, LogIn, Wallet, ExternalLink, AlertTriangle, Smartphone } from 'lucide-react';
import { WalletService, isMobile, isIOS, isAndroid } from '../services/walletService';

interface UserLoginProps {
  onBack: () => void;
  onLogin: (userData: any) => void;
}

export function UserLoginNew({ onBack, onLogin }: UserLoginProps) {
  const [loginMethod, setLoginMethod] = useState<'traditional' | 'xion' | 'metamask'>('traditional');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulated login - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, create demo user data
      const userData = {
        id: `user_${Date.now()}`,
        email: formData.email,
        username: formData.email.split('@')[0],
        firstName: '',
        lastName: '',
        registeredAt: new Date().toISOString(),
        totalRegistrations: 0,
        totalVerifications: 0,
        lastActivity: new Date().toISOString(),
        // XION wallet info (created during registration)
        xionWallet: {
          address: `xion1${Math.random().toString(36).substring(2, 15)}`,
          publicKey: `02${Math.random().toString(16).substring(2, 66)}`,
          createdAt: new Date().toISOString()
        }
      };

      onLogin(userData);
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleXIONWalletLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const walletAccount = await WalletService.connectXIONWallet();
      
      // Simular búsqueda del usuario por dirección de wallet
      const userData = {
        id: 'user_xion_123',
        email: 'user@noircheck.com',
        username: 'xion_user',
        firstName: 'XION',
        lastName: 'User',
        registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        totalRegistrations: 3,
        totalVerifications: 7,
        lastActivity: new Date().toISOString(),
        xionWallet: {
          address: walletAccount.address,
          publicKey: walletAccount.publicKey || '',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        loginMethod: 'xion'
      };

      onLogin(userData);
    } catch (error: any) {
      console.error('XION login error:', error);
      if (error?.message?.includes('not installed')) {
        setError('XION wallet no encontrada o no registrada. Por favor crea una cuenta primero.');
      } else {
        setError('XION wallet no conectada o no registrada. Por favor crea una cuenta primero.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const walletAccount = await WalletService.connectMetaMask();

      // Simular búsqueda del usuario por dirección de MetaMask
      const userData = {
        id: 'user_metamask_456',
        email: 'metamask@noircheck.com',
        username: 'metamask_user',
        firstName: 'MetaMask',
        lastName: 'User',
        registeredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        totalRegistrations: 5,
        totalVerifications: 12,
        lastActivity: new Date().toISOString(),
        metaMaskWallet: {
          address: walletAccount.address,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        loginMethod: 'metamask'
      };

      onLogin(userData);
    } catch (error: any) {
      console.error('MetaMask login error:', error);
      if (error?.message?.includes('not installed')) {
        setError('MetaMask no está instalada. Por favor instala MetaMask o crea una cuenta.');
      } else {
        setError('MetaMask wallet no conectada o no registrada. Por favor crea una cuenta primero.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick demo login
  const handleDemoLogin = () => {
    const demoUserData = {
      id: 'demo-user',
      email: 'demo@noircheck.com',
      username: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalRegistrations: 5,
      totalVerifications: 12,
      lastActivity: new Date().toISOString(),
      xionWallet: {
        address: 'xion1demo7user8wallet9address0example123',
        publicKey: '02demo1234567890abcdef1234567890abcdef1234567890abcdef123456',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      loginMethod: 'demo'
    };

    onLogin(demoUserData);
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

        {/* Login Methods */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
          {/* Method Selection */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('traditional')}
              className={`p-3 rounded-lg transition-all ${
                loginMethod === 'traditional' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Mail className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Email</span>
            </button>
            <button
              onClick={() => setLoginMethod('xion')}
              className={`p-3 rounded-lg transition-all ${
                loginMethod === 'xion' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Wallet className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">XION</span>
            </button>
            <button
              onClick={() => setLoginMethod('metamask')}
              className={`p-3 rounded-lg transition-all ${
                loginMethod === 'metamask' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <ExternalLink className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">MetaMask</span>
            </button>
          </div>

          {/* Mobile Detection Notice */}
          {isMobile() && (loginMethod === 'xion' || loginMethod === 'metamask') && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-green-300 font-medium text-sm mb-1">Dispositivo Móvil</h3>
                  <p className="text-green-200 text-xs">
                    {loginMethod === 'xion' && 'XION wallet móvil detectada - Funcionará perfectamente'}
                    {loginMethod === 'metamask' && `MetaMask ${isIOS() ? 'iOS' : 'Android'} detectada - Totalmente compatible`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Traditional Login */}
          {loginMethod === 'traditional' && (
            <form onSubmit={handleTraditionalLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}

          {/* XION Wallet Login */}
          {loginMethod === 'xion' && (
            <div className="space-y-4">
              <div className="bg-purple-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Wallet className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-purple-300 font-medium mb-1">XION Wallet Login</h3>
                    <p className="text-purple-200 text-sm">
                      Connect with your registered XION wallet. Make sure it's the same wallet you used during registration.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleXIONWalletLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting XION Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect XION Wallet
                  </>
                )}
              </button>
            </div>
          )}

          {/* MetaMask Login */}
          {loginMethod === 'metamask' && (
            <div className="space-y-4">
              <div className="bg-orange-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="text-orange-300 font-medium mb-1">MetaMask Login</h3>
                    <p className="text-orange-200 text-sm">
                      Connect with your registered MetaMask wallet. Make sure it's the same wallet you linked during registration.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMetaMaskLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting MetaMask...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect MetaMask
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <div className="flex items-center text-red-200 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-yellow-300 font-medium text-sm mb-1">Important</h3>
                <p className="text-yellow-200 text-xs">
                  Wallet login only works with wallets that were registered with your NoirCheck account. 
                  If you haven't registered yet, please create an account first.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Login */}
          <div className="border-t border-gray-600 pt-4">
            <button
              onClick={handleDemoLogin}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Demo Login (Development)
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
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
        </div>
      </div>
    </div>
  );
}
