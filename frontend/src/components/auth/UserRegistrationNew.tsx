/**
 * User Registration Component with XION Wallet Integration - CLEAN VERSION
 * 
 * Integrates with the new XION Keypair Service for proper wallet management
 * and authentication handling.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { UserPlus, ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, ExternalLink, Plus, Link as LinkIcon, AlertTriangle, Smartphone, Loader2 } from 'lucide-react';
import { WalletService, isMobile, isIOS, isAndroid } from '@/services/walletService';
import { UserStorageService } from '@/services/userStorageService';
import { useXIONAuth } from '@/services/useXIONAuth';
import { forceCleanXIONState } from '@/utils/xionCleanup';

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

type RegistrationStep = 'form' | 'wallet' | 'connected' | 'creating' | 'success';
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
  const [isManualXIONProcess, setIsManualXIONProcess] = useState(false);
  
  // Debounce refs for preventing double clicks
  const lastClickTime = useRef<number>(0);
  const clickDebounceMs = 1000;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentMounted = useRef<boolean>(false);

  // XION authentication hook with new wallet management capabilities
  const { 
    account: xionAccount, 
    login: xionLogin,
    createWallet: xionCreateWallet,
    connectWallet: xionConnectWallet,
    isWalletReady,
    currentAddress,
    walletState,
    isConnecting: xionIsConnecting
  } = useXIONAuth();

  // Debug function to check saved users
  const checkSavedUsers = () => {
    const users = UserStorageService.getAllUsers();
    console.log('🔍 Current saved users:', users);
    console.log('📊 Total users count:', users.length);
  };
  
  // Form validation
  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if user already exists
    const existingUser = UserStorageService.findUserByEmail(formData.email);
    if (existingUser) {
      setError('An account with this email already exists. Please use a different email or sign in.');
      return;
    }

    setError('');
    setStep('wallet');
  };

  // Handle wallet selection
  const handleWalletSelection = async (option: WalletOption) => {
    console.log('🚀 handleWalletSelection called with option:', option);
    setWalletOption(option);
    setError('');

    // Save form data to localStorage before creating wallet (in case of redirect)
    try {
      localStorage.setItem('noircheck_registration_form', JSON.stringify(formData));
      console.log('💾 Form data saved to localStorage');
    } catch (error) {
      console.warn('⚠️ Could not save form data to localStorage:', error);
    }

    if (option === 'create') {
      await createXIONWallet();
    } else if (option === 'xion') {
      await connectXIONWallet();
    } else if (option === 'metamask') {
      await connectMetaMaskWallet();
    }
  };

  // Create XION wallet using Abstraxion
  const createXIONWallet = async () => {
    if (isLoading || xionIsConnecting) {
      console.warn('🚫 XION wallet creation already in progress');
      return;
    }

    console.log('🚀 Starting XION wallet creation process...');
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔑 Creating new XION wallet using Abstraxion...');
      
      // Try to create new wallet using the improved service
      if (xionCreateWallet) {
        await xionCreateWallet();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if wallet was created successfully
        if (isWalletReady && currentAddress) {
          console.log('✅ XION wallet created successfully:', currentAddress);
          setConnectedWallet({
            address: currentAddress,
            type: 'XION'
          });
          setStep('connected');
          return;
        }
      }
      
      // Fallback to traditional login method if createWallet doesn't work
      console.log('🔄 Fallback to traditional XION login...');
      await xionLogin();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (xionAccount && xionAccount.bech32Address) {
        console.log('✅ XION wallet connected via login:', xionAccount.bech32Address);
        setConnectedWallet({
          address: xionAccount.bech32Address,
          type: 'XION'
        });
        setStep('connected');
      } else {
        throw new Error('Failed to create or connect XION wallet');
      }
    } catch (error: unknown) {
      console.error('❌ XION wallet creation error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          setError('User cancelled wallet creation. Please try again.');
        } else if (error.message.includes('not installed') || error.message.includes('not found')) {
          setError('XION wallet not available. Please ensure you have a compatible browser and try again.');
        } else if (error.message.includes('Login is already in progress')) {
          setError('XION connection is in progress. Please wait a moment and try again.');
        } else {
          setError(`Error creating XION wallet: ${error.message}`);
        }
      } else {
        setError('Unexpected error creating XION wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Connect existing XION wallet
  const connectXIONWallet = async () => {
    if (isLoading) {
      console.warn('🚫 XION wallet connection already in progress');
      return;
    }

    setIsLoading(true);
    try {
      await xionLogin();
      
      if (xionAccount && xionAccount.bech32Address) {
        setConnectedWallet({
          address: xionAccount.bech32Address,
          type: 'XION'
        });
        setStep('connected');
      } else {
        throw new Error('XION connection failed - no valid address returned');
      }
    } catch (error: unknown) {
      console.error('XION connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          setError('User cancelled wallet connection. Please try again.');
        } else if (error.message.includes('not installed') || error.message.includes('not found')) {
          setError('XION wallet not found. Please install XION wallet or use auto-create option.');
        } else if (error.message.includes('Login is already in progress')) {
          setError('XION connection is in progress. Please wait a moment and try again.');
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

  // Connect MetaMask wallet
  const connectMetaMaskWallet = async () => {
    setIsLoading(true);
    try {
      const metaMaskWallet = await WalletService.connectMetaMask();
      setConnectedWallet(metaMaskWallet);
      setStep('connected');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join NoirCheck to verify digital content authenticity</p>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-11 pr-11 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-11 pr-11 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Wallet Selection Step */}
        {step === 'wallet' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Choose Wallet Option</h2>
              <p className="text-gray-400">Select how you want to connect your wallet</p>
            </div>

            <div className="space-y-4">
              {/* Create New XION Wallet */}
              <button
                onClick={() => handleWalletSelection('create')}
                disabled={isLoading}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Plus className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Create New XION Wallet</h3>
                    <p className="text-sm text-gray-400">Automatically create a new XION wallet for you</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Recommended</span>
                      {isMobile() && <Smartphone className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Connect Existing XION Wallet */}
              <button
                onClick={() => handleWalletSelection('xion')}
                disabled={isLoading}
                className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <LinkIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Connect Existing XION Wallet</h3>
                    <p className="text-sm text-gray-400">Connect your existing XION wallet</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Connect MetaMask */}
              <button
                onClick={() => handleWalletSelection('metamask')}
                disabled={isLoading}
                className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <LinkIcon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Connect MetaMask</h3>
                    <p className="text-sm text-gray-400">Use your existing MetaMask wallet</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <div>
                    <div className="text-blue-400 font-medium">
                      {walletOption === 'create' ? 'Creating XION Wallet via Abstraxion...' : 
                       walletOption === 'xion' ? 'Connecting XION Wallet...' : 
                       'Connecting MetaMask...'}
                    </div>
                    <div className="text-sm text-blue-300">
                      {walletOption === 'create' ? 
                        'Using XION Abstraxion to create your new wallet' : 
                        'Please approve the connection in your wallet'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-red-400 font-medium">Connection Error</div>
                    <div className="text-sm text-red-300 mt-1">{error}</div>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => setError('')}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Back to Form
              </button>
            </div>
          </div>
        )}

        {/* Connected Step */}
        {step === 'connected' && connectedWallet && (
          <div className="space-y-6">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <div className="text-green-400 font-medium">Wallet Connected Successfully!</div>
                  <div className="text-sm text-green-300">
                    {connectedWallet.type}: {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-6)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Complete Registration</h2>
              <p className="text-gray-400">Your wallet is connected. Ready to create your account?</p>
            </div>

            <button
              onClick={() => {
                setStep('creating');
                // Create and save account to localStorage
                setTimeout(() => {
                  try {
                    // Use UserStorageService to register and persist the user
                    const newUser = UserStorageService.registerUser({
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email,
                      password: formData.password,
                      username: formData.email, // Use email as username for now
                      address: connectedWallet.address,
                      totalRegistrations: 0,
                      totalVerifications: 0,
                      registrationMethod: walletOption,
                      xionWallet: walletOption === 'create' || walletOption === 'xion' ? {
                        address: connectedWallet.address,
                        publicKey: 'mock-public-key', // In real app, get from XION
                        createdAt: new Date().toISOString(),
                        isAutoCreated: walletOption === 'create',
                        isNewlyCreated: walletOption === 'create'
                      } : undefined,
                      metaMaskWallet: walletOption === 'metamask' ? {
                        address: connectedWallet.address,
                        createdAt: new Date().toISOString()
                      } : undefined
                    });
                    
                    console.log('✅ User successfully registered and saved:', newUser);
                    
                    // Debug: Check all saved users
                    checkSavedUsers();
                    
                    setStep('success');
                    setTimeout(() => onComplete(newUser), 2000);
                  } catch (error) {
                    console.error('❌ Error creating user account:', error);
                    setError('Failed to create account. Please try again.');
                    setStep('connected');
                  }
                }, 2000);
              }}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('wallet')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Back to Wallet Selection
              </button>
            </div>
          </div>
        )}

        {/* Creating Step */}
        {step === 'creating' && (
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Creating Your Account</h2>
              <p className="text-gray-400">Please wait while we set up your NoirCheck account...</p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Account Created Successfully!</h2>
              <p className="text-gray-400">Welcome to NoirCheck. You will be redirected to your dashboard shortly.</p>
            </div>
          </div>
        )}

        {/* Default/Fallback Content */}
        {!['form', 'wallet'].includes(step) && (
          <div className="text-center space-y-6">
            <p className="text-white">Current step: {step}</p>
            <p className="text-gray-400">XION integration is ready.</p>
            
            <button
              onClick={() => setStep('form')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 w-full"
            >
              <UserPlus className="w-5 h-5" />
              <span>Start Registration</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Add default export for compatibility
export default UserRegistrationNew;
