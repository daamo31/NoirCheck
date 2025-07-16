/**
 * XION Wallet Connection Component (Official Implementation)
 * 
 * Uses the official @burnt-labs/abstraxion library for wallet connection
 * Implements account abstraction with gasless transactions
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ExternalLink,
  RefreshCw,
  User,
  Copy,
  LogOut,
  Coins
} from 'lucide-react';
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
  useModal,
} from "@burnt-labs/abstraxion";

export function XIONWalletConnectionOfficial() {
  // Official XION hooks
  const { data: account, isConnected, isConnecting } = useAbstraxionAccount();
  const { client, signArb, logout } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [showModal, setShowModal] = useModal();

  // Local state
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Debug connection state
  useEffect(() => {
    console.log('XION Debug:', { isConnected, isConnecting, account, showModal });
  }, [isConnected, isConnecting, account, showModal]);

  /**
   * Fetch account balance
   */
  const getBalance = async () => {
    if (!account?.bech32Address || !queryClient) return;

    setIsLoadingBalance(true);
    try {
      // Use the correct method for getting balance
      const balance = await queryClient.getBalance(account.bech32Address, 'uxion');
      
      if (balance && balance.amount) {
        // Convert microXION to XION (divide by 1,000,000)
        const xionAmount = (parseInt(balance.amount) / 1_000_000).toFixed(6);
        setBalance(`${xionAmount} XION`);
      } else {
        setBalance('0.000000 XION');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Fallback to a simulated balance for development
      setBalance('0.000000 XION');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  /**
   * Copy address to clipboard
   */
  const copyAddress = async () => {
    if (account?.bech32Address) {
      try {
        await navigator.clipboard.writeText(account.bech32Address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (logout) {
      logout();
      setBalance(null);
    }
  };

  // Load balance when account connects
  useEffect(() => {
    if (isConnected && account?.bech32Address) {
      getBalance();
    }
  }, [isConnected, account?.bech32Address, queryClient]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          XION Wallet Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with account abstraction and gasless transactions
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Connection Status
          </h3>
          {isConnected && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>

        {/* Connect Button */}
        <div className="mb-4">
          {!isConnected ? (
            <button
              onClick={() => setShowModal(true)}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  CONNECTING...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  CONNECT WALLET
                </>
              )}
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <User className="w-4 h-4 mr-2" />
                VIEW ACCOUNT
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Account Information */}
        {account?.bech32Address && (
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wallet Address
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                  {account.bech32Address}
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Balance
                </label>
                <button
                  onClick={getBalance}
                  disabled={isLoadingBalance}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {isLoadingBalance ? 'Loading...' : (balance || 'Unknown')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`https://www.mintscan.io/xion-testnet/address/${account.bech32Address}`, '_blank')}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Explorer
              </button>
              
              {logout && (
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          XION Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Account Abstraction</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Gasless Transactions</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
              Enabled
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Multi-Auth Support</span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* XION Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </div>
  );
}
