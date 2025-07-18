/**
 * XION Test Component
 * Simple component to test XION integration
 */

"use client";

import React from 'react';
import { useXIONAuth } from '@/services/useXIONAuth';

export default function XIONTest() {
  const { account, isConnected, isLoading, error, login, logout } = useXIONAuth();

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        XION Wallet Test
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {isConnected && account ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Connected to XION
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Address:</strong> {account.address}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Type:</strong> {account.type}
            </p>
          </div>
          
          <button
            onClick={logout}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {isLoading ? 'Logging out...' : 'Disconnect XION'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Connect your XION wallet to continue
          </p>
          
          <button
            onClick={login}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect XION Wallet'}
          </button>
        </div>
      )}
    </div>
  );
}
