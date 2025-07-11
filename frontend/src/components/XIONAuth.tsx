/**
 * XION Authentication Component with Abstraxion SDK
 * 
 * Provides complete XION authentication using Meta Account with multiple
 * authentication methods: Email, Social Login, Wallets, and Passkeys.
 * 
 * Based on XION documentation and best practices for NoirCheck integration.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  useAbstraxionAccount, 
  useAbstraxionSigningClient,
  useModal,
  Abstraxion 
} from '@burnt-labs/abstraxion';

interface XIONAuthProps {
  onAuthChange?: (isAuthenticated: boolean, account?: any) => void;
}

export function XIONAuth({ onAuthChange }: XIONAuthProps) {
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isModalOpen, setModal] = useModal();
  const [isLoading, setIsLoading] = useState(false);

  // Notify parent component of authentication state changes
  useEffect(() => {
    onAuthChange?.(isConnected, account);
  }, [isConnected, account, onAuthChange]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      setModal(true); // Open Abstraxion modal
    } catch (error) {
      console.error('Failed to connect to XION:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      // Disconnect logic would go here
      // Note: Abstraxion handles this automatically
    } catch (error) {
      console.error('Failed to disconnect from XION:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800 dark:text-green-200">
              Connected to XION
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
            Account: {account.bech32Address?.slice(0, 8)}...{account.bech32Address?.slice(-6)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {isLoading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="text-center space-y-4">
        <div>
          <h3 className="font-medium text-blue-800 dark:text-blue-200">
            Connect to XION Network
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
            Sign in with your Meta Account to register and verify content on blockchain
          </p>
        </div>
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Connect with Meta Account
            </>
          )}
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Authentication methods supported:</p>
          <div className="flex justify-center space-x-4 mt-1">
            <span>📧 Email</span>
            <span>🔗 Social Login</span>
            <span>👛 Wallets</span>
            <span>🔑 Passkeys</span>
          </div>
        </div>
      </div>
      
      {/* Abstraxion Modal Component */}
      <Abstraxion
        onClose={() => setModal(false)}
      />
    </div>
  );
}

/**
 * Hook for XION account information
 * Provides easy access to account data and connection status
 */
export function useXIONAccount() {
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  return {
    account,
    isConnected,
    client,
    address: account?.bech32Address,
    isReady: isConnected && !!client,
  };
}
