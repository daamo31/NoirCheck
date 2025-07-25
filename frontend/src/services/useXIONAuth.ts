/**
 * Custom XION Authentication Hook
 * Provides a cleaner interface for XION wallet authentication with keypair management
 */

import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
import { useEffect, useState } from 'react';
import { xionKeypairService, XIONWalletState } from './xionKeypairService';

export function useXIONAuth() {
  const abstraxionAccount = useAbstraxionAccount();
  const [isShowingModal, setIsShowingModal] = useModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<XIONWalletState>({
    isConnected: false,
    address: null,
    keypair: null,
    granter: null
  });

  // Enhanced connection state
  const isConnected = Boolean(abstraxionAccount?.isConnected) || walletState.isConnected;
  const account = abstraxionAccount?.data || walletState.address; // Use 'data' instead of 'account'

  // Initialize keypair service on mount
  useEffect(() => {
    const initializeKeypairService = async () => {
      try {
        await xionKeypairService.initialize();
        const currentState = xionKeypairService.getWalletState();
        setWalletState(currentState);
        
        if (currentState.isConnected) {
          console.log('🔑 XION keypair service initialized with existing wallet');
        } else {
          console.log('🔍 XION keypair service initialized, no existing wallet found');
        }
      } catch (error) {
        console.error('❌ Failed to initialize XION keypair service:', error);
        setConnectionError('Failed to initialize wallet service');
      }
    };

    initializeKeypairService();
  }, []);

  // Suppress specific XION authentication errors
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
      if (message.includes('Missing keypair or granter') || 
          message.includes('cannot authenticate') ||
          message.includes('overrideMethod') ||
          message.includes('AbstraxionContextProvider')) {
        return; // Suppress these specific errors
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
      if (message.includes('Missing keypair or granter') || 
          message.includes('cannot authenticate') ||
          message.includes('overrideMethod') ||
          message.includes('AbstraxionContextProvider')) {
        return; // Suppress these specific warnings
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Handle connection state changes
  useEffect(() => {
    // Only log if this is a new connection, not an auto-restored session
    if (isConnected && account && isConnecting) {
      setIsConnecting(false);
      setConnectionError(null);
      console.log('✅ XION wallet connected successfully:', account.bech32Address);
    } else if (abstraxionAccount?.isConnecting) {
      setIsConnecting(true);
      setConnectionError(null);
      console.log('🔄 XION wallet connecting...');
    } else if (isConnected && account && !isConnecting) {
      // This is likely an auto-restored session - don't log it as a "successful connection"
      console.log('🔄 XION session restored:', account.bech32Address);
    }
  }, [isConnected, account, abstraxionAccount?.isConnecting, isConnecting]);

  // Improved login function with duplicate prevention
  const login = async (): Promise<void> => {
    // Prevent multiple simultaneous login attempts
    if (isConnecting) {
      console.warn('🚫 Login already in progress, skipping duplicate attempt');
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      console.log('🚀 Initiating XION wallet login...');
      
      // Show the modal first
      setIsShowingModal(true);
      
      // Wait a bit for modal to appear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger the connection
      if (abstraxionAccount?.login) {
        await abstraxionAccount.login();
      } else {
        throw new Error('XION login method not available');
      }
      
    } catch (error) {
      console.error('❌ XION login failed:', error);
      
      // Enhanced error handling for network issues
      let errorMessage = 'Login failed';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('User denied') || error.message.includes('cancelled')) {
          errorMessage = 'User cancelled the login process.';
        } else if (error.message.includes('not supported')) {
          errorMessage = 'XION wallet is not supported on this device/browser.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setConnectionError(errorMessage);
      setIsConnecting(false);
      setIsShowingModal(false);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 Logging out from XION wallet...');
      
      if (abstraxionAccount?.logout) {
        await abstraxionAccount.logout();
      }
      
      // Clear keypair service state
      await xionKeypairService.clearWalletState();
      setWalletState({
        isConnected: false,
        address: null,
        keypair: null,
        granter: null
      });
      
      setIsConnecting(false);
      setConnectionError(null);
      setIsShowingModal(false);
      
      console.log('✅ XION wallet logged out successfully');
    } catch (error) {
      console.error('❌ XION logout failed:', error);
      throw error;
    }
  };

  // Create new XION wallet
  const createWallet = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      console.log('🔑 Creating new XION wallet...');
      
      // Create new keypair through service
      const newKeypair = await xionKeypairService.createNewKeypair();
      
      // Update local state
      const newState = xionKeypairService.getWalletState();
      setWalletState(newState);
      
      setIsConnecting(false);
      console.log('✅ New XION wallet created:', newKeypair.address);
    } catch (error) {
      console.error('❌ Failed to create XION wallet:', error);
      setConnectionError('Failed to create new wallet');
      setIsConnecting(false);
      throw error;
    }
  };

  // Connect to existing XION wallet
  const connectWallet = async (mnemonic: string): Promise<void> => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      console.log('🔗 Connecting to existing XION wallet...');
      
      // Connect through service
      const existingKeypair = await xionKeypairService.connectExistingKeypair(mnemonic);
      
      // Update local state
      const newState = xionKeypairService.getWalletState();
      setWalletState(newState);
      
      setIsConnecting(false);
      console.log('✅ Connected to existing XION wallet:', existingKeypair.address);
    } catch (error) {
      console.error('❌ Failed to connect to existing XION wallet:', error);
      setConnectionError('Failed to connect to existing wallet');
      setIsConnecting(false);
      throw error;
    }
  };

  // Check if wallet is ready for operations
  const isWalletReady = (): boolean => {
    return xionKeypairService.isReadyForOperations();
  };

  // Get current wallet address
  const getCurrentAddress = (): string | null => {
    const state = xionKeypairService.getWalletState();
    return state.address || (account ? account.bech32Address : null);
  };

  return {
    // Connection state
    isConnected: isConnected || walletState.isConnected,
    account: account ? {
      ...account,
      // Ensure address is available with fallback
      address: account.bech32Address || walletState.address || '',
      bech32Address: account.bech32Address || walletState.address || ''
    } : (walletState.address ? {
      address: walletState.address,
      bech32Address: walletState.address
    } : null),
    isConnecting,
    connectionError,
    
    // Wallet state from keypair service
    walletState,
    isWalletReady: isWalletReady(),
    currentAddress: getCurrentAddress(),
    
    // Aliases for backward compatibility
    isLoading: isConnecting,
    error: connectionError,
    
    // Modal state
    isShowingModal,
    setIsShowingModal,
    
    // Actions
    login,
    logout,
    createWallet,
    connectWallet,
    
    // Raw account data for advanced usage
    rawAccount: abstraxionAccount,
  };
}
