/**
 * Custom XION Authentication Modal
 * A cleaner implementation that wraps the Abstraxion modal properly
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useModal, useAbstraxionAccount } from '@burnt-labs/abstraxion';
import { X } from 'lucide-react';

export default function CustomXIONModal() {
  const [showModal, setShowModal] = useModal();
  const abstraxionAccount = useAbstraxionAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-close modal when user successfully connects
  useEffect(() => {
    if (abstraxionAccount?.isConnected && showModal) {
      setIsConnecting(false);
      // Wait a bit to show success, then close
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    }
  }, [abstraxionAccount?.isConnected, showModal, setShowModal]);

  const handleClose = () => {
    setShowModal(false);
    setIsConnecting(false);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (abstraxionAccount?.login) {
        await abstraxionAccount.login();
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnecting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect XION Wallet
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {abstraxionAccount?.isConnected ? (
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
            </div>
          ) : (
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
                Connect your XION wallet to authenticate with NoirCheck using Meta Accounts
              </p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Connect XION Wallet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
