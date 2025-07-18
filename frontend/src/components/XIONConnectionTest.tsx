/**
 * XION Connection Test Component
 * Tests XION integration with debugging information
 */

"use client";

import React, { useState } from 'react';
import { useModal, useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
import { Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function XIONConnectionTest() {
  const [, setShowModal] = useModal();
  const abstraxionAccount = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      console.log('Attempting to connect XION wallet...');
      console.log('Abstraxion Account:', abstraxionAccount);
      console.log('Signing Client:', signingClient);
      
      if (abstraxionAccount?.login) {
        await abstraxionAccount.login();
        console.log('Login method called successfully');
      } else {
        console.log('Opening modal...');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (abstraxionAccount?.logout) {
        abstraxionAccount.logout();
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        XION Connection Test
      </h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
          Connection Status
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {abstraxionAccount?.isConnected ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              Connected: {abstraxionAccount?.isConnected ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {abstraxionAccount?.isConnecting ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              Connecting: {abstraxionAccount?.isConnecting ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {signingClient ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              Signing Client: {signingClient ? 'Available' : 'Not Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      {abstraxionAccount?.data && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">
            Account Information
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-green-700 dark:text-green-300">
              <strong>Address:</strong> {abstraxionAccount.data.bech32Address}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {connectionError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="font-semibold mb-2 text-red-800 dark:text-red-200">
            Connection Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {connectionError}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {abstraxionAccount?.isConnected ? (
          <button
            onClick={handleDisconnect}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isConnecting ? 'Connecting...' : 'Connect XION Wallet'}
          </button>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
          Debug Information
        </h3>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <p>Abstraxion Account Object: {abstraxionAccount ? 'Available' : 'Not Available'}</p>
          <p>Login Method: {typeof abstraxionAccount?.login === 'function' ? 'Available' : 'Not Available'}</p>
          <p>Logout Method: {typeof abstraxionAccount?.logout === 'function' ? 'Available' : 'Not Available'}</p>
          <p>Client Available: {signingClient ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
