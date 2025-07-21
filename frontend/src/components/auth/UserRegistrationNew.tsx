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

import { useState, useEffect, useRef } from 'react';
import { UserPlus, ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, ExternalLink, Plus, Link as LinkIcon, AlertTriangle, Smartphone, Loader2 } from 'lucide-react';
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
  const clickDebounceMs = 1000; // 1 segundo de debounce (reducido)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentMounted = useRef<boolean>(false);

  // XION authentication hook
  const { account: xionAccount, login: xionLogin } = useXIONAuth();
  
  // Mark component as mounted
  useEffect(() => {
    componentMounted.current = true;
    
    // Try to restore form data from localStorage
    try {
      const savedFormData = localStorage.getItem('noircheck_registration_form');
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData);
        setFormData(parsedFormData);
        console.log('📋 Form data restored from localStorage');
        // If we have saved form data, go directly to wallet selection
        setStep('wallet');
      }
    } catch (error) {
      console.warn('⚠️ Could not restore form data from localStorage:', error);
    }
    
    // Clear any existing XION/wallet state on component mount
    const clearExistingState = () => {
      try {
        if (typeof window !== 'undefined') {
          // Clear XION related storage
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('xion') || key.includes('abstraxion') || key.includes('XION')) {
              sessionStorage.removeItem(key);
              console.log('Cleared sessionStorage key:', key);
            }
          });
          Object.keys(localStorage).forEach(key => {
            if (key.includes('xion') || key.includes('abstraxion') || key.includes('XION')) {
              localStorage.removeItem(key);
              console.log('Cleared localStorage key:', key);
            }
          });
        }
      } catch (error) {
        console.warn('Error clearing storage on mount:', error);
      }
    };
    
    clearExistingState();
    
    return () => {
      componentMounted.current = false;
    };
  }, []);
  
  // Handle XION redirect return
  useEffect(() => {
    const handleXIONReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const granted = urlParams.get('granted');
      const granter = urlParams.get('granter');
      
      if (granted === 'true' && granter) {
        console.log('🎉 XION wallet creation returned successfully!');
        console.log('👤 Granter address:', granter);
        
        // Clean URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('granted');
        url.searchParams.delete('granter');
        window.history.replaceState({}, '', url.toString());
        
        // Set loading state
        setIsLoading(true);
        setWalletOption('create');
        setStep('wallet');
        
        // Wait a moment for XION state to be available
        setTimeout(async () => {
          if (xionAccount && xionAccount.bech32Address) {
            console.log('✅ XION account available after return:', xionAccount.bech32Address);
            
            const xionWallet = {
              type: 'xion',
              address: xionAccount.bech32Address,
              publicKey: '',
              isExisting: false,
              isNewlyCreated: true
            };
            
            setConnectedWallet(xionWallet);
            setStep('connected');
            setIsLoading(false);
            
            // If we have form data in localStorage, retrieve it and proceed
            const savedFormData = localStorage.getItem('noircheck_registration_form');
            if (savedFormData) {
              try {
                const parsedFormData = JSON.parse(savedFormData);
                setFormData(parsedFormData);
                console.log('📝 Form data retrieved from localStorage, proceeding to create account...');
                await handleCreateAccount(xionWallet);
              } catch (error) {
                console.error('Error parsing saved form data:', error);
              }
            }
          } else {
            console.log('⏳ XION account not yet available, waiting...');
            // Retry after another delay
            setTimeout(() => {
              if (xionAccount && xionAccount.bech32Address) {
                const xionWallet = {
                  type: 'xion',
                  address: xionAccount.bech32Address,
                  publicKey: '',
                  isExisting: false,
                  isNewlyCreated: true
                };
                
                setConnectedWallet(xionWallet);
                setStep('connected');
                setIsLoading(false);
              } else {
                setIsLoading(false);
                setError('XION wallet was created but connection failed. Please try connecting again.');
              }
            }, 2000);
          }
        }, 1000);
      }
    };

    handleXIONReturn();
  }, [xionAccount]);
  
  // Auto-reset debounce if loading state gets stuck
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to reset loading state after 30 seconds (safety fallback)
      timeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Loading state reset after timeout - safety fallback');
        setIsLoading(false);
        setIsManualXIONProcess(false);
        lastClickTime.current = 0;
      }, 30000);
    } else {
      // Clear timeout when loading completes normally
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);
  
  // Function to clear all XION state
  const clearXIONState = () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear all XION related storage más agresivamente
        const keysToRemove: string[] = [];
        
        // Check sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.toLowerCase().includes('xion') || 
              key.toLowerCase().includes('abstraxion') || 
              key.toLowerCase().includes('wallet') ||
              key.toLowerCase().includes('auth') ||
              key.toLowerCase().includes('account')) {
            keysToRemove.push(`session:${key}`);
            sessionStorage.removeItem(key);
          }
        });
        
        // Check localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes('xion') || 
              key.toLowerCase().includes('abstraxion') || 
              key.toLowerCase().includes('wallet') ||
              key.toLowerCase().includes('auth') ||
              key.toLowerCase().includes('account')) {
            keysToRemove.push(`local:${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Force clear some known XION storage keys
        const knownXionKeys = [
          'xion-account',
          'abstraxion-account', 
          'abstraxion-signer',
          'wallet-connect',
          'wc@2:client:0.3//session',
          'wc@2:core:0.3//keychain'
        ];
        
        knownXionKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
          } catch (e) {
            // Ignore errors
          }
        });
        
        if (keysToRemove.length > 0) {
          console.log('🧹 Cleared XION storage keys:', keysToRemove);
        }
        
        // Reset component state
        setConnectedWallet(null);
        setIsLoading(false);
        setIsManualXIONProcess(false);
        lastClickTime.current = 0;
        
        // Force page reload if we're really stuck
        if (keysToRemove.length > 5) {
          console.log('🔄 Many keys found, considering page reload...');
        }
      }
    } catch (error) {
      console.warn('Error clearing XION state:', error);
    }
  };

  // Auto-process XION registration when account becomes available (for auto-detection, not manual process)
  useEffect(() => {
    // TEMPORALMENTE DESHABILITADO para evitar conflictos
    // Solo permitir flujo manual por ahora
    return;
    
    const handleXIONConnection = async () => {
      // Only proceed if:
      // 1. We have a XION account
      // 2. We don't already have a connected wallet (to avoid double processing)
      // 3. We're not in a manual XION process (to avoid conflicts)
      // 4. We have the required form data
      // 5. We're on the wallet selection step (not form step)
      if (
        xionAccount?.bech32Address && 
        !connectedWallet && 
        !isManualXIONProcess &&
        !isLoading &&
        step === 'wallet' &&
        formData.email && 
        formData.firstName && 
        formData.password
      ) {
        console.log('🚀 Auto-processing XION registration for:', xionAccount.bech32Address);
        
        try {
          setIsLoading(true);
          
          // Set the connected wallet
          const xionWallet = {
            type: 'xion',
            address: xionAccount.bech32Address,
            publicKey: '',
            isExisting: false,
            isNewlyCreated: true
          };
          
          setConnectedWallet(xionWallet);
          
          // Create the user account
          const userData = {
            email: formData.email.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            password: formData.password, // This will be hashed by registerUser
            username: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            totalRegistrations: 0,
            totalVerifications: 0,
            address: xionAccount.bech32Address,
            registrationMethod: 'xion' as const,
            xionWallet: {
              address: xionAccount.bech32Address,
              publicKey: '',
              createdAt: new Date().toISOString(),
              isAutoCreated: true,
              isNewlyCreated: true
            }
          };
          
          // Save user locally
          const newUser = UserStorageService.registerUser(userData);
          
          try {
            // Try to register in backend
            const response = await fetch('http://localhost:8000/users/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                address: newUser.address,
                username: newUser.username,
                email: newUser.email
              }),
            });
            
            if (response.ok) {
              console.log('✅ User registered in backend successfully');
            }
          } catch (backendError) {
            console.warn('⚠️ Backend registration failed, but continuing with local user:', backendError);
          }
          
          console.log('✅ XION account registration completed successfully');
          
          // Trigger onComplete callback to redirect to dashboard
          onComplete(newUser);
          
        } catch (error) {
          console.error('❌ Auto XION registration failed:', error);
          setError(error instanceof Error ? error.message : 'Registration failed');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleXIONConnection();
  }, [xionAccount, connectedWallet, isManualXIONProcess, formData, onComplete, step, isLoading]);

  // Helper function to generate valid XION addresses for development
  const generateValidXionAddress = (): string => {
    // For development, use a known pattern that works with XION testnet
    // This generates addresses similar to the official examples
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'xion1';
    
    // Generate 38 characters after 'xion1' (typical bech32 length)
    for (let i = 0; i < 38; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
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

  // Debounce helper function
  const canProceedWithClick = (): boolean => {
    // Si ya estamos cargando, no permitir más clics
    if (isLoading) {
      console.warn('🚫 Action blocked - operation already in progress');
      return false;
    }
    
    // Solo aplicar debounce después del primer clic
    const now = Date.now();
    if (lastClickTime.current > 0 && now - lastClickTime.current < clickDebounceMs) {
      console.warn('🚫 Action blocked by debounce - please wait between clicks');
      return false;
    }
    
    lastClickTime.current = now;
    return true;
  };

  const handleWalletSelection = async (option: WalletOption) => {
    console.log('🚀 handleWalletSelection called with option:', option);
    
    // Solo verificar el debounce si no estamos cargando
    if (!canProceedWithClick()) {
      console.log('❌ canProceedWithClick returned false');
      return;
    }

    console.log('✅ Proceeding with wallet selection:', option);
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
    // Prevent multiple simultaneous attempts
    if (isLoading) {
      console.warn('🚫 XION wallet creation already in progress');
      return;
    }

    console.log('🚀 Starting XION wallet creation process...');
    setIsLoading(true);
    setIsManualXIONProcess(true);
    setError(''); // Clear any previous errors
    
    try {
      // Clear any existing XION state to prevent conflicts
      console.log('🧹 Clearing existing XION state...');
      clearXIONState();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📞 Calling XION login...');
      
      // Create new XION wallet using XION Abstraxion
      await xionLogin();
      
      // Wait a moment for the account to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ XION login completed, checking account...', xionAccount);
      
      if (xionAccount && xionAccount.bech32Address) {
        console.log('🎉 XION account created successfully:', xionAccount.bech32Address);
        
        const xionWallet = {
          type: 'xion',
          address: xionAccount.bech32Address,
          publicKey: '',
          isExisting: false,
          isNewlyCreated: true
        };
        
        setConnectedWallet(xionWallet);
        console.log('✅ Wallet state updated, proceeding to account creation...');
        
        // Small delay to let state update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Proceed to create account with the new wallet
        await handleCreateAccount(xionWallet);
      } else {
        console.warn('⚠️ XION account creation completed but no valid address returned');
        setError('XION wallet creation completed but no address was generated. Please try again.');
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
          // Auto-retry after a delay
          setTimeout(() => {
            console.log('🔄 Auto-retrying XION wallet creation...');
            setIsLoading(false);
            setIsManualXIONProcess(false);
            setError('');
          }, 3000);
          return;
        } else {
          setError(`Error creating XION wallet: ${error.message}`);
        }
      } else {
        setError('Unexpected error creating XION wallet. Please try again.');
      }
    } finally {
      // Only reset state if we're not auto-retrying
      if (!error || !error.toString().includes('Login is already in progress')) {
        setIsLoading(false);
        setIsManualXIONProcess(false);
      }
    }
  };

  const connectXIONWallet = async () => {
    // Prevent multiple simultaneous attempts
    if (isLoading) {
      console.warn('🚫 XION wallet connection already in progress');
      return;
    }

    setIsLoading(true);
    try {
      await xionLogin();
      
      if (xionAccount && xionAccount.bech32Address) {
        const xionWallet = {
          type: 'xion',
          address: xionAccount.bech32Address,
          publicKey: '', // PublicKey no está disponible en el tipo AbstraxionAccount
          isExisting: true
        };
        
        setConnectedWallet(xionWallet);
      } else {
        throw new Error('XION connection failed - no valid address returned');
      }
    } catch (error: unknown) {
      console.error('XION connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          setError('User cancelled wallet connection. Please try again.');
        } else if (error.message.includes('not installed')) {
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

  const handleCreateAccount = async (walletInfo?: {address: string; type: string}) => {
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
      console.log('Wallet info passed:', walletInfo);
      console.log('XION account:', xionAccount);
      console.log('Wallet option:', walletOption);

      // Usar walletInfo si se proporciona, sino usar connectedWallet
      const currentWallet = walletInfo || connectedWallet;
      
      // Verificar que tenemos una wallet conectada
      if (!currentWallet) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      let userWalletInfo;
      
      if (walletOption === 'create') {
        // Create new XION wallet - use the real XION address from xionAccount
        // The wallet is already created by this point through xionLogin()
        const xionAddress = xionAccount?.bech32Address || currentWallet.address;
        userWalletInfo = {
          xionWallet: {
            address: xionAddress,
            publicKey: generateMockPublicKey(), // Mock publicKey for development
            createdAt: new Date().toISOString(),
            isAutoCreated: false,
            isNewlyCreated: true
          }
        };
      } else if (walletOption === 'xion' && currentWallet) {
        // Use connected XION wallet - use the real XION address from xionAccount
        const xionAddress = xionAccount?.bech32Address || currentWallet.address;
        userWalletInfo = {
          xionWallet: {
            address: xionAddress,
            publicKey: generateMockPublicKey(), // Mock publicKey for development
            createdAt: new Date().toISOString(),
            isAutoCreated: false
          }
        };
      } else if (walletOption === 'metamask' && currentWallet) {
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
            address: currentWallet.address,
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
      
      // Clean up form data from localStorage
      try {
        localStorage.removeItem('noircheck_registration_form');
        console.log('🧹 Form data cleaned from localStorage');
      } catch (error) {
        console.warn('⚠️ Could not clean form data from localStorage:', error);
      }
      
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
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔵 Create XION Wallet button clicked, isLoading:', isLoading);
                  if (!isLoading) {
                    handleWalletSelection('create');
                  } else {
                    console.log('❌ Blocked by isLoading');
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  isLoading && walletOption === 'create'
                    ? 'bg-blue-500/30 border-blue-400 opacity-90 cursor-wait' 
                    : isLoading 
                      ? 'opacity-50 cursor-not-allowed bg-gray-500/20 border-gray-500/50' 
                      : 'bg-blue-500/20 border-blue-500/50 cursor-pointer hover:bg-blue-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isLoading && walletOption === 'create' ? (
                    <Loader2 className="w-6 h-6 text-blue-400 mt-1 animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6 text-blue-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-blue-300 font-medium mb-1 flex items-center">
                      Create New XION Wallet (Recommended)
                      {isLoading && walletOption === 'create' && (
                        <span className="ml-2 text-xs text-blue-400 flex items-center">
                          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                          {isManualXIONProcess ? 'Creating wallet...' : 'Processing...'}
                        </span>
                      )}
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Create a new XION wallet using official Abstraxion service. 
                      Real blockchain integration with Meta Account authentication.
                      {isMobile() && ' Optimized for mobile experience.'}
                      {isLoading && walletOption === 'create' && (
                        <>
                          <br />
                          <span className="text-blue-300 text-xs mt-1 block">
                            🔄 {isManualXIONProcess ? 'Creating your secure XION wallet...' : 'Processing...'}
                          </span>
                          <span className="text-blue-400 text-xs mt-1 block">
                            This may take a few moments. Please don't close this page.
                          </span>
                        </>
                      )}
                      {!isLoading && (
                        <>
                          <br />
                          <span className="text-green-300 text-xs mt-1 block">
                            ✓ Click to create your new XION wallet securely
                          </span>
                        </>
                      )}
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
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    handleWalletSelection('xion');
                  }
                }}
                className={`bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 transition-all ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:bg-purple-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isLoading && walletOption === 'xion' ? (
                    <Loader2 className="w-6 h-6 text-purple-400 mt-1 animate-spin" />
                  ) : (
                    <LinkIcon className="w-6 h-6 text-purple-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-purple-300 font-medium mb-1">
                      Connect Existing XION Wallet
                      {isLoading && walletOption === 'xion' && (
                        <span className="ml-2 text-xs text-purple-400">Connecting...</span>
                      )}
                    </h3>
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
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    handleWalletSelection('metamask');
                  }
                }}
                className={`bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 transition-all ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:bg-orange-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isLoading && walletOption === 'metamask' ? (
                    <Loader2 className="w-6 h-6 text-orange-400 mt-1 animate-spin" />
                  ) : (
                    <ExternalLink className="w-6 h-6 text-orange-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-orange-300 font-medium mb-1">
                      Conectar MetaMask Wallet
                      {isLoading && walletOption === 'metamask' && (
                        <span className="ml-2 text-xs text-orange-400">Connecting...</span>
                      )}
                    </h3>
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

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-red-200 text-sm mb-2">
                      {error}
                    </div>
                    
                    {/* Troubleshooting suggestions */}
                    {error.includes('Login is already in progress') && (
                      <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
                        <div className="text-yellow-200 text-xs">
                          <strong>💡 Troubleshooting:</strong><br />
                          • Another XION process is running<br />
                          • Try waiting 30 seconds and retry<br />
                          • If issue persists, reload the page
                        </div>
                      </div>
                    )}
                    
                    {error.includes('not available') && (
                      <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
                        <div className="text-yellow-200 text-xs">
                          <strong>💡 Troubleshooting:</strong><br />
                          • Check your internet connection<br />
                          • Try refreshing the page<br />
                          • Ensure browser allows popups
                        </div>
                      </div>
                    )}
                    
                    <div className="space-x-2">
                      {error.includes('Login is already in progress') && (
                        <>
                          <button
                            onClick={() => {
                              clearXIONState();
                              setError('');
                            }}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Clear XION State & Retry
                          </button>
                          <button
                            onClick={() => {
                              clearXIONState();
                              window.location.reload();
                            }}
                            className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Reload Page
                          </button>
                        </>
                      )}
                      {!error.includes('Login is already in progress') && (
                        <>
                          <button
                            onClick={() => {
                              setError('');
                            }}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => {
                              clearXIONState();
                              setError('');
                              // Retry wallet creation
                              if (walletOption === 'create') {
                                setTimeout(() => handleWalletSelection('create'), 500);
                              }
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Try Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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

        {/* Connected Step */}
        {step === 'connected' && connectedWallet && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
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

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-center text-red-200 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {error}
                </div>
                <div className="mt-2 space-x-2">
                  {error.includes('Login is already in progress') && (
                    <>
                      <button
                        onClick={() => {
                          clearXIONState();
                          setError('');
                        }}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Clear XION State & Retry
                      </button>
                      <button
                        onClick={() => {
                          clearXIONState();
                          window.location.reload();
                        }}
                        className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Reload Page
                      </button>
                    </>
                  )}
                  {!error.includes('Login is already in progress') && (
                    <button
                      onClick={() => {
                        setError('');
                      }}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('wallet')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back to Wallet Selection
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
