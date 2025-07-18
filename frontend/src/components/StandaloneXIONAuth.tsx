/**
 * Standalone XION Authentication Component
 * Does not rely on Abstraxion's internal modal
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

interface StandaloneXIONAuthProps {
  trigger?: React.ReactNode;
  onSuccess?: (account: any) => void;
  onError?: (error: string) => void;
}

export default function StandaloneXIONAuth({ 
  trigger, 
  onSuccess, 
  onError 
}: StandaloneXIONAuthProps) {
  const abstraxionAccount = useAbstraxionAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authStep, setAuthStep] = useState<'start' | 'connecting' | 'success' | 'error'>('start');
  const [error, setError] = useState<string | null>(null);

  // Handle connection state changes
  useEffect(() => {
    if (abstraxionAccount?.isConnected) {
      setAuthStep('success');
      setIsConnecting(false);
      onSuccess?.(abstraxionAccount.data);
      
      // Auto-close after showing success
      setTimeout(() => {
        setIsOpen(false);
        setAuthStep('start');
      }, 2000);
    } else if (abstraxionAccount?.isConnecting) {
      setAuthStep('connecting');
      setIsConnecting(true);
    }
  }, [abstraxionAccount?.isConnected, abstraxionAccount?.isConnecting, onSuccess]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setAuthStep('connecting');
    setError(null);

    try {
      if (abstraxionAccount?.login) {
        await abstraxionAccount.login();
      } else {
        throw new Error('XION login method not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setAuthStep('error');
      setIsConnecting(false);
      onError?.(errorMessage);
    }
  };

  const handleRetry = () => {
    setError(null);
    setAuthStep('start');
    handleConnect();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setAuthStep('start');
      setError(null);
      setIsConnecting(false);
    }
  };

  const defaultTrigger = (
    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
      <Wallet className="w-4 h-4" />
      Connect XION Wallet
    </button>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {trigger || defaultTrigger}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">
            Connect XION Wallet
          </Dialog.Title>
          
          <Dialog.Description className="sr-only">
            Connect your XION wallet to authenticate with NoirCheck using Meta Accounts
          </Dialog.Description>

          <div className="p-6">
            {authStep === 'start' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Connect Your XION Wallet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign in with your email, social account, or existing wallet to create or connect your Meta Account
                </p>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isConnecting ? 'Connecting...' : 'Connect XION Wallet'}
                </button>
              </div>
            )}

            {authStep === 'connecting' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Connecting...
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please complete the authentication process in the popup window
                </p>
              </div>
            )}

            {authStep === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Successfully Connected!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your XION wallet is now connected to NoirCheck
                </p>
                {abstraxionAccount?.data?.bech32Address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    {abstraxionAccount.data.bech32Address}
                  </p>
                )}
              </div>
            )}

            {authStep === 'error' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Connection Failed
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {error || 'Unable to connect to XION wallet'}
                </p>
                <button
                  onClick={handleRetry}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
