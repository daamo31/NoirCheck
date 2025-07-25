/**
 * Custom XION Authentication Hook
 * Provides a cleaner interface for XION wallet authentication
 */

import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
import { useEffect, useState } from 'react';

export function useXIONAuth() {
  const abstraxionAccount = useAbstraxionAccount();
  const [isShowingModal, setIsShowingModal] = useModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Enhanced connection state
  const isConnected = Boolean(abstraxionAccount?.isConnected);
  const account = abstraxionAccount?.data; // Use 'data' instead of 'account'

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
      
      setIsConnecting(false);
      setConnectionError(null);
      setIsShowingModal(false);
      
      console.log('✅ XION wallet logged out successfully');
    } catch (error) {
      console.error('❌ XION logout failed:', error);
      throw error;
    }
  };

  return {
    // Connection state
    isConnected,
    account: account ? {
      ...account,
      // Ensure address is available with fallback
      address: account.bech32Address || '',
      bech32Address: account.bech32Address || ''
    } : null,
    isConnecting,
    connectionError,
    
    // Aliases for backward compatibility
    isLoading: isConnecting,
    error: connectionError,
    
    // Modal state
    isShowingModal,
    setIsShowingModal,
    
    // Actions
    login,
    logout,
    
    // Raw account data for advanced usage
    rawAccount: abstraxionAccount,
  };
}
