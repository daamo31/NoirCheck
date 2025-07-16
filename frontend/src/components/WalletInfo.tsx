/**
 * Wallet Info Component
 * 
 * Displays detailed information about the user's XION wallet and connection status.
 * Shows address, balance, connection status, and provides wallet management functions.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Coins,
  Link,
  Shield,
  Plus,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { XIONWalletConnection } from './XIONWalletConnection';
import { XIONWalletTutorial } from './XIONWalletTutorial';

interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  network: string;
  lastUpdate: Date;
}

export function WalletInfo() {
  const { user, logout } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeView, setActiveView] = useState<'info' | 'connect' | 'tutorial'>('info');

  // Mock XION wallet data (replace with actual XION integration)
  useEffect(() => {
    if (user?.address) {
      setWalletInfo({
        address: user.address,
        balance: '0.00 XION',
        isConnected: true,
        network: 'XION Testnet',
        lastUpdate: new Date()
      });
    }
  }, [user]);

  /**
   * Copy wallet address to clipboard
   */
  const copyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  /**
   * Refresh wallet information
   */
  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh wallet data
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (walletInfo) {
        setWalletInfo({
          ...walletInfo,
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle logout with proper cleanup
   */
  const handleLogout = async () => {
    try {
      await logout();
      // Additional cleanup if needed
      setWalletInfo(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user || !walletInfo) {
    return (
      <div className="space-y-6">
        {/* View Selector */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('connect')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'connect'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Connect Wallet
          </button>
          <button
            onClick={() => setActiveView('tutorial')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'tutorial'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-1" />
            Setup Guide
          </button>
        </div>

        {/* Content based on active view */}
        {activeView === 'connect' && <XIONWalletConnection />}
        {activeView === 'tutorial' && <XIONWalletTutorial />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Wallet className="w-6 h-6 mr-2" />
            Wallet Information
          </h2>
          <button
            onClick={refreshWallet}
            disabled={isLoading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Refresh wallet data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center mb-4">
          {walletInfo.isConnected ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Disconnected</span>
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wallet Address
          </label>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
              {walletInfo.address}
            </code>
            <button
              onClick={copyAddress}
              className="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              title="Copy address"
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Balance
          </label>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Coins className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {walletInfo.balance}
            </span>
          </div>
        </div>

        {/* Network */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network
          </label>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Link className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-gray-800 dark:text-gray-200">{walletInfo.network}</span>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Last updated: {walletInfo.lastUpdate.toLocaleString()}
        </div>
      </div>

      {/* XION Integration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Shield className="w-5 h-5 mr-2" />
          XION Integration
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">zkTLS Status</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Blockchain Connection</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
              Connected
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Authentication Method</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
              XION Wallet
            </span>
          </div>
        </div>
      </div>

      {/* User Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => window.open('https://explorer.xion.burnt.com', '_blank')}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on XION Explorer
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
