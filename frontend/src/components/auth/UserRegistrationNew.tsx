/**
 * User Registration Component with Multiple Wallet Options - DEVELOPMENT VERSION
 * 
 * This is a development/testing component that simulates wallet connections and user registration.
 * It integrates with mock services for testing the user registration flow in the NoirCheck dashboard.
 * 
 * IMPORTANT: This is NOT for production use. It's designed for:
 * - Development testing of the registration flow
 * - UI/UX validation 
 * - Integration testing with mock services
 * - Dashboard development and testing
 * 
 * Registration flow:
 * 1. Collect basic user information
 * 2. Choose wallet option:
 *    - Create new XION wallet (simulated for development)
 *    - Link existing XION wallet (simulated)
 *    - Link existing MetaMask wallet (simulated)
 * 3. Complete registration with selected wallet
 * 
 * Note: In production, this would connect to real XION blockchain and MetaMask.
 * The addresses generated here are mock addresses for testing purposes only.
 */

'use client';

import { useState } from 'react';
import { UserPlus, ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, ExternalLink, Plus, Link as LinkIcon, AlertTriangle, Smartphone } from 'lucide-react';
import { WalletService, isMobile, isIOS, isAndroid } from '@/services/walletService';
import { UserStorageService } from '@/services/userStorageService';
import { useXIONAuth } from '@/services/useXIONAuth';

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

interface UserRegistrationProps {
  onBack: () => void;
  onComplete: (userData: User) => void;
}

type RegistrationStep = 'form' | 'wallet' | 'creating' | 'success';
type WalletOption = 'create' | 'xion' | 'metamask';

export function UserRegistrationNew({ onBack, onComplete }: UserRegistrationProps) {
  const [step, setStep] = useState<RegistrationStep>('form');
  const [walletOption, setWalletOption] = useState<WalletOption>('create');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectedWallet, setConnectedWallet] = useState<{address: string; type: string} | null>(null);
  
  // XION authentication hook
  const { account: xionAccount, login: xionLogin } = useXIONAuth();

  // Helper function to generate valid XION addresses for development
  const generateValidXionAddress = (): string => {
    // XION addresses start with 'xion1' and follow bech32 format
    // For development, we'll create more realistic mock addresses
    const randomBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
    const addressPart = randomBytes.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 38);
    return `xion1${addressPart}`;
  };

  // Helper function to generate mock public keys
  const generateMockPublicKey = (): string => {
    return `02${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setStep('wallet');
  };

  const handleWalletSelection = async (option: WalletOption) => {
    setWalletOption(option);
    setError('');

    if (option === 'create') {
      // Create new XION wallet through XION service
      await createXIONWallet();
    } else if (option === 'xion') {
      // Connect XION wallet first
      await connectXIONWallet();
    } else if (option === 'metamask') {
      // Connect MetaMask wallet first
      await connectMetaMaskWallet();
    }
  };

  const createXIONWallet = async () => {
    setIsLoading(true);
    try {
      // Create new XION wallet using XION Abstraxion
      await xionLogin();
      
      if (xionAccount) {
        const xionWallet = {
          type: 'xion',
          address: xionAccount.bech32Address,
          publicKey: '', // PublicKey no está disponible en el tipo AbstraxionAccount
          isExisting: false,
          isNewlyCreated: true
        };
        
        setConnectedWallet(xionWallet);
        
        // Proceed to create account with the new wallet
        await handleCreateAccount();
      }
    } catch (error: unknown) {
      console.error('XION wallet creation error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          setError('User cancelled wallet creation. Please try again.');
        } else if (error.message.includes('not installed')) {
          setError('XION wallet not found. Please install XION wallet extension or app first.');
        } else {
          setError('Error creating XION wallet. Please try again.');
        }
      } else {
        setError('Error creating XION wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectXIONWallet = async () => {
    setIsLoading(true);
    try {
      await xionLogin();
      
      if (xionAccount) {
        const xionWallet = {
          type: 'xion',
          address: xionAccount.bech32Address,
          publicKey: '', // PublicKey no está disponible en el tipo AbstraxionAccount
          isExisting: true
        };
        
        setConnectedWallet(xionWallet);
      }
    } catch (error: unknown) {
      console.error('XION connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          setError('User cancelled wallet connection. Please try again.');
        } else if (error.message.includes('not installed')) {
          setError('XION wallet not found. Please install XION wallet or use auto-create option.');
        } else {
          setError('Error connecting XION wallet. Please try again or use auto-create.');
        }
      } else {
        setError('Error connecting XION wallet. Please try again or use auto-create.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectMetaMaskWallet = async () => {
    setIsLoading(true);
    try {
      const walletAccount = await WalletService.connectMetaMask();
      
      const metaMaskWallet = {
        type: 'metamask',
        address: walletAccount.address,
        isExisting: true
      };
      
      setConnectedWallet(metaMaskWallet);
    } catch (error: unknown) {
      console.error('MetaMask connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('not installed')) {
          setError('MetaMask no está instalada. Por favor instala MetaMask o usa la opción de auto-crear.');
        } else if (error.message.includes('User denied')) {
          setError('Usuario canceló la conexión. Por favor intenta de nuevo.');
        } else {
          setError('Error al conectar MetaMask. Por favor intenta de nuevo.');
        }
      } else {
        setError('Error al conectar MetaMask. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setStep('creating');
    setIsLoading(true);

    try {
      // Validar que todos los campos estén completos
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        throw new Error('All fields are required');
      }

      // Verificar si el email ya está registrado
      const existingUser = UserStorageService.findUserByEmail(formData.email);
      if (existingUser) {
        throw new Error('Email already registered. Please use a different email or go to login.');
      }

      console.log('Creating user account...');
      console.log('Connected wallet:', connectedWallet);
      console.log('XION account:', xionAccount);
      console.log('Wallet option:', walletOption);

      // Verificar que tenemos una wallet conectada
      if (!connectedWallet) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      let userWalletInfo;
      
      if (walletOption === 'create') {
        // Create new XION wallet - use the real XION address from xionAccount
        // The wallet is already created by this point through xionLogin()
        const xionAddress = xionAccount?.bech32Address || connectedWallet.address;
        userWalletInfo = {
          xionWallet: {
            address: xionAddress,
            publicKey: generateMockPublicKey(), // Mock publicKey for development
            createdAt: new Date().toISOString(),
            isAutoCreated: false,
            isNewlyCreated: true
          }
        };
      } else if (walletOption === 'xion' && connectedWallet) {
        // Use connected XION wallet - use the real XION address from xionAccount
        const xionAddress = xionAccount?.bech32Address || connectedWallet.address;
        userWalletInfo = {
          xionWallet: {
            address: xionAddress,
            publicKey: generateMockPublicKey(), // Mock publicKey for development
            createdAt: new Date().toISOString(),
            isAutoCreated: false
          }
        };
      } else if (walletOption === 'metamask' && connectedWallet) {
        // Use connected MetaMask wallet + create XION wallet
        // For MetaMask, we create a mock XION address since it's not a real XION connection
        userWalletInfo = {
          xionWallet: {
            address: generateValidXionAddress(),
            publicKey: generateMockPublicKey(),
            createdAt: new Date().toISOString(),
            isAutoCreated: true
          },
          metaMaskWallet: {
            address: connectedWallet.address,
            createdAt: new Date().toISOString()
          }
        };
      }

      // Crear usuario real en el sistema de almacenamiento
      const userData = UserStorageService.registerUser({
        email: formData.email,
        password: formData.password, // In production, this would be hashed
        username: formData.email.split('@')[0],
        firstName: formData.firstName,
        lastName: formData.lastName,
        totalRegistrations: 0,
        totalVerifications: 0,
        registrationMethod: walletOption,
        // Primary address for dashboard display
        address: userWalletInfo?.xionWallet?.address || userWalletInfo?.metaMaskWallet?.address,
        ...userWalletInfo
      });

      console.log('User account created successfully:', userData.email);
      setStep('success');
      
      // Complete registration immediately after showing success briefly
      setTimeout(() => {
        // Only pass the required User fields
        const userForAuth: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address: userData.address,
          registeredAt: userData.registeredAt,
          totalRegistrations: userData.totalRegistrations,
          totalVerifications: userData.totalVerifications,
          lastActivity: userData.lastActivity
        };
        onComplete(userForAuth);
      }, 500); // Reducido de 2000ms a 500ms

    } catch (error: unknown) {
      console.error('Error creating account:', error);
      setError('Failed to create account. Please try again.');
      setStep('wallet');
    } finally {
      setIsLoading(false);
    }
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
          
          <div className="bg-blue-600 p-3 rounded-2xl w-fit mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          
          {step === 'form' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join NoirCheck to verify digital content</p>
            </>
          )}
          
          {step === 'wallet' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Choose Wallet</h1>
              <p className="text-gray-400">Select how you want to manage your digital identity</p>
            </>
          )}
          
          {step === 'creating' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Creating Account</h1>
              <p className="text-gray-400">Setting up your secure wallet...</p>
            </>
          )}
          
          {step === 'success' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
              <p className="text-gray-400">Your account has been created successfully</p>
            </>
          )}
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

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
                    placeholder="john@example.com"
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
                    placeholder="Create a secure password"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Continue to Wallet Setup
              </button>
            </form>
          </div>
        )}

        {/* Wallet Selection Step */}
        {step === 'wallet' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-6">
            {/* Mobile Detection Notice */}
            {isMobile() && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-blue-300 font-medium mb-1">Dispositivo Móvil Detectado</h3>
                    <p className="text-blue-200 text-sm">
                      {isIOS() && 'iOS detectado - MetaMask y XION funcionan perfectamente en iPhone/iPad'}
                      {isAndroid() && 'Android detectado - MetaMask y XION son compatibles con tu dispositivo'}
                      {!isIOS() && !isAndroid() && 'Dispositivo móvil detectado - Las wallets móviles son soportadas'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Options */}
            <div className="space-y-4">
              {/* Create New XION Wallet Option */}
              <div 
                onClick={() => handleWalletSelection('create')}
                className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 cursor-pointer hover:bg-blue-500/30 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <Plus className="w-6 h-6 text-blue-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-blue-300 font-medium mb-1">Create New XION Wallet (Recommended)</h3>
                    <p className="text-blue-200 text-sm">
                      Create a new XION wallet using official Abstraxion service. 
                      Real blockchain integration with Meta Account authentication.
                      {isMobile() && ' Optimized for mobile experience.'}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Real XION
                      </span>
                      <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded ml-2">
                        Testnet
                      </span>
                      {isMobile() && (
                        <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded ml-2">
                          Mobile ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Link XION Wallet */}
              <div 
                onClick={() => handleWalletSelection('xion')}
                className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 cursor-pointer hover:bg-purple-500/30 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <LinkIcon className="w-6 h-6 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-purple-300 font-medium mb-1">Connect Existing XION Wallet</h3>
                    <p className="text-purple-200 text-sm">
                      Connect your existing XION wallet to this account.
                      {isMobile() && (
                        isIOS() ? ' Will open XION app on iOS.' : 
                        isAndroid() ? ' Will open XION app on Android.' :
                        ' Compatible with XION mobile app.'
                      )}
                    </p>
                    {isMobile() && (
                      <div className="mt-2">
                        <span className="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          {isIOS() ? 'iOS App' : isAndroid() ? 'Android App' : 'Móvil App'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Link MetaMask */}
              <div 
                onClick={() => handleWalletSelection('metamask')}
                className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 cursor-pointer hover:bg-orange-500/30 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <ExternalLink className="w-6 h-6 text-orange-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-orange-300 font-medium mb-1">Conectar MetaMask Wallet</h3>
                    <p className="text-orange-200 text-sm">
                      Conecta tu wallet MetaMask. También crearemos un wallet XION para funciones blockchain.
                      {isMobile() && (
                        isIOS() ? ' MetaMask funciona perfectamente en iOS.' : 
                        isAndroid() ? ' MetaMask es totalmente compatible con Android.' :
                        ' MetaMask móvil soportado.'
                      )}
                    </p>
                    {isMobile() && (
                      <div className="mt-2 space-x-2">
                        <span className="inline-block bg-orange-600 text-white text-xs px-2 py-1 rounded">
                          {isIOS() ? 'iOS ✓' : isAndroid() ? 'Android ✓' : 'Móvil ✓'}
                        </span>
                        <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          + XION Auto
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Wallet Display */}
            {connectedWallet && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="text-green-300 font-medium">Wallet Connected</h3>
                    <p className="text-green-200 text-sm">
                      {connectedWallet.type === 'xion' ? 'XION' : 'MetaMask'}: {
                        connectedWallet.type === 'xion' && xionAccount?.bech32Address
                          ? xionAccount.bech32Address.substring(0, 10)
                          : connectedWallet.address.substring(0, 10)
                      }...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateAccount()}
                  disabled={isLoading}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-center text-red-200 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('form')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back to Form
            </button>
          </div>
        )}

        {/* Creating Step */}
        {step === 'creating' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Creating Your Account</h3>
              <p className="text-gray-400">
                {walletOption === 'create' && 'Creating your secure XION wallet...'}
                {walletOption === 'xion' && 'Linking your XION wallet...'}
                {walletOption === 'metamask' && 'Linking MetaMask and creating XION wallet...'}
              </p>
            </div>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Account information saved</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Wallet configuration</span>
              </div>
              <div className="flex items-center text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                <span className="text-sm">Finalizing setup...</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="bg-green-600 p-4 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Account Created!</h3>
              <p className="text-gray-400">
                Welcome to NoirCheck, {formData.firstName}! Your account and wallet are ready.
              </p>
            </div>
            
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-left">
              <h4 className="text-green-300 font-medium mb-2">What&apos;s Next?</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Start verifying digital content</li>
                <li>• Register your original content</li>
                <li>• Explore blockchain verification features</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
