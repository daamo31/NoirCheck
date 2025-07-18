/**
 * Fully Custom XION Modal
 * Implements XION authentication without using internal Abstraxion modal
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useModal, useAbstraxionAccount } from '@burnt-labs/abstraxion';
import { X, Loader2 } from 'lucide-react';

interface FullyCustomXIONModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullyCustomXIONModal({ isOpen, onClose }: FullyCustomXIONModalProps) {
  const [showModal, setShowModal] = useModal();
  const abstraxionAccount = useAbstraxionAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [authStep, setAuthStep] = useState<'start' | 'connecting' | 'success' | 'error'>('start');
  const [error, setError] = useState<string | null>(null);

  // Sync external isOpen state with internal modal state
  useEffect(() => {
    if (isOpen !== showModal) {
      setShowModal(isOpen);
    }
  }, [isOpen, showModal, setShowModal]);

  // Handle connection state changes
  useEffect(() => {
    if (abstraxionAccount?.isConnected) {
      setAuthStep('success');
      setIsConnecting(false);
      // Auto-close after showing success
      setTimeout(() => {
        setShowModal(false);
        onClose();
        setAuthStep('start');
      }, 2000);
    } else if (abstraxionAccount?.isConnecting) {
      setAuthStep('connecting');
    }
  }, [abstraxionAccount?.isConnected, abstraxionAccount?.isConnecting, setShowModal, onClose]);

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
      setError(err instanceof Error ? err.message : 'Connection failed');
      setAuthStep('error');
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
    setAuthStep('start');
    setError(null);
    setIsConnecting(false);
  };

  const handleRetry = () => {
    setError(null);
    setAuthStep('start');
    handleConnect();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="xion-modal-title" aria-describedby="xion-modal-description">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="xion-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect XION Wallet
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div id="xion-modal-description" className="sr-only">
            Connect your XION wallet to authenticate with NoirCheck using Meta Accounts
          </div>
          
          {authStep === 'start' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
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
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
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
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
      </div>
    </div>
  );
}
