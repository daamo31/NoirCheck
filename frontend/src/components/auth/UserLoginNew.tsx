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
import { Lock, ArrowLeft, Mail, Eye, EyeOff, LogIn, Wallet, ExternalLink, AlertTriangle, Smartphone } from 'lucide-react';
import { WalletService, isMobile, isIOS } from '@/services/walletService';
import { UserStorageService } from '@/services/userStorageService';
import { useXIONAuth } from '@/services/useXIONAuth';

interface UserLoginProps {
  onBack: () => void;
  onLogin: (userData: User) => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function UserLoginNew({ onBack, onLogin }: UserLoginProps) {
  const { account, isConnected, login: xionLogin } = useXIONAuth();
  
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
      // Validación básica de credenciales
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Autenticación real usando UserStorageService
      const userData = UserStorageService.authenticateUser(formData.email, formData.password);
      
      if (!userData) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      console.log('Login successful for:', userData.email);
      
      // El userData ya viene con toda la información necesaria del UserStorageService
      onLogin(userData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleXIONWalletLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('User initiated XION wallet login');
      
      // Check if already connected
      if (isConnected && account) {
        console.log('XION wallet already connected:', account);
        
        // Find registered user with this wallet address
        const userData = UserStorageService.findUserByWalletAddress(account.bech32Address);
        
        if (!userData) {
          throw new Error('Esta wallet XION no está registrada. Por favor crea una cuenta primero.');
        }

        console.log('XION wallet login successful:', userData);
        onLogin(userData);
        setIsLoading(false);
        return;
      }
      
      // If not connected, attempt to connect
      console.log('Opening XION connection modal...');
      
      // Use the xionLogin function from our hook
      await xionLogin();
      
      // Wait a bit for connection to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check connection again after login attempt
      if (isConnected && account) {
        // Find registered user with this wallet address
        const userData = UserStorageService.findUserByWalletAddress(account.bech32Address);
        
        if (!userData) {
          throw new Error('Esta wallet XION no está registrada. Por favor crea una cuenta primero.');
        }

        console.log('XION wallet login successful:', userData);
        onLogin(userData);
      } else {
        throw new Error('XION wallet connection was not completed. Please try again.');
      }
      
    } catch (error: unknown) {
      console.error('XION login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('no está registrada')) {
          setError(error.message);
        } else if (error.message.includes('not completed')) {
          setError('Connection cancelled or failed. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Error desconocido en login con XION');
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

      // Buscar usuario registrado con esta dirección de MetaMask
      const userData = UserStorageService.findUserByWalletAddress(walletAccount.address);
      
      if (!userData) {
        throw new Error('Esta wallet MetaMask no está registrada. Por favor crea una cuenta primero.');
      }

      console.log('MetaMask wallet login successful:', userData);
      onLogin(userData);
    } catch (error: unknown) {
      console.error('MetaMask login error:', error);
      if (error instanceof Error) {
        if (error.message.includes('not installed')) {
          setError('MetaMask not installed. Please install MetaMask extension.');
        } else if (error.message.includes('no está registrada')) {
          setError(error.message);
        } else {
          setError(error.message);
        }
      } else {
        setError('Error desconocido con MetaMask');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ELIMINADO: Ya no necesitamos login demo, ahora usamos usuarios reales

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
                      Connect with your registered XION wallet. Make sure it&apos;s the same wallet you used during registration.
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
                ) : isConnected && account ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Connected: {account.bech32Address.slice(0, 6)}...{account.bech32Address.slice(-4)}
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
                      Connect with your registered MetaMask wallet. Make sure it&apos;s the same wallet you linked during registration.
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

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              Don&apos;t have an account yet?
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
