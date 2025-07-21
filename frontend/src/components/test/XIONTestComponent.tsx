/**
 * XION Test Component
 * Simple component to test XION Abstraxion integration
 */

"use client";

import React from 'react';
import { useXIONAuth } from '@/services/useXIONAuth';
import { Wallet, LogIn, LogOut, User, AlertCircle } from 'lucide-react';

export default function XIONTestComponent() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectionError, 
    login, 
    logout
  } = useXIONAuth();

  return (
    <div className="p-6 max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">XION Wallet Test</h2>
      </div>

      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{connectionError}</span>
          </div>
        </div>
      )}

      {isConnected && account ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Connected</span>
            </div>
            <p className="text-sm text-green-700">
              <strong>Address:</strong> {account.bech32Address}
            </p>
          </div>
          
          <button
            onClick={logout}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            {isConnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Connect your XION wallet to get started
          </p>
          
          <button
            onClick={login}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect XION Wallet'}
          </button>
        </div>
      )}
    </div>
  );
}
