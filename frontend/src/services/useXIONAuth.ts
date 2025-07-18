/**
 * Custom hook for XION wallet authentication
 * Provides a clean interface for components to interact with XION Abstraxion
 */

"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient, useModal } from '@burnt-labs/abstraxion';
import { WalletAccount } from './walletService';

export interface XIONAuthState {
  account: WalletAccount | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useXIONAuth() {
  const abstraxionAccount = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [, setShowModal] = useModal();
  
  const [state, setState] = useState<XIONAuthState>({
    account: null,
    isConnected: false,
    isLoading: false,
    error: null
  });

  // Update state when Abstraxion account changes
  useEffect(() => {
    if (abstraxionAccount?.data?.bech32Address) {
      setState(prev => {
        // Only update if something actually changed
        if (prev.account?.address !== abstraxionAccount.data.bech32Address || 
            prev.isConnected !== abstraxionAccount.isConnected) {
          return {
            ...prev,
            account: {
              address: abstraxionAccount.data.bech32Address,
              publicKey: abstraxionAccount.data.bech32Address, // For now, use address as public key
              type: 'xion'
            },
            isConnected: abstraxionAccount.isConnected,
            error: null
          };
        }
        return prev;
      });
    } else {
      setState(prev => {
        // Only update if something actually changed
        if (prev.account !== null || prev.isConnected !== false) {
          return {
            ...prev,
            account: null,
            isConnected: false,
            error: null
          };
        }
        return prev;
      });
    }
  }, [abstraxionAccount?.data?.bech32Address, abstraxionAccount?.isConnected]);

  // Login function
  const login = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use the login function from useAbstraxionAccount
      if (abstraxionAccount?.login) {
        await abstraxionAccount.login();
      } else {
        // Fallback to showing the modal
        setShowModal(true);
      }
      
      // Wait a bit for the auth state to update
      setTimeout(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `XION login failed: ${errorMessage}`
      }));
      throw error;
    }
  }, [abstraxionAccount, setShowModal]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use the logout function from useAbstraxionAccount
      if (abstraxionAccount?.logout) {
        abstraxionAccount.logout();
      }
      // Also try the logout from signing client
      if (signingClient && 'logout' in signingClient && typeof signingClient.logout === 'function') {
        (signingClient as any).logout();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `XION logout failed: ${errorMessage}`
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [abstraxionAccount, signingClient]);

  // Check if XION is available
  const isXIONAvailable = useCallback((): boolean => {
    return !!signingClient;
  }, [signingClient]);

  return {
    ...state,
    login,
    logout,
    isXIONAvailable,
    signingClient,
    abstraxionAccount
  };
}
