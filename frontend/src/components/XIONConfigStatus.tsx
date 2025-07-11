/**
 * XION Configuration Status Component
 * 
 * Displays the current status of XION integration including:
 * - Contract addresses and configuration
 * - Connection status
 * - Treasury balance
 * - Missing configuration warnings
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useXIONAccount } from './XIONAuth';
import { useXIONContract, useXIONContractConfig } from '@/hooks/useXIONContract';

export function XIONConfigStatus() {
  const { isConnected, address } = useXIONAccount();
  const { isInitialized, contractInfo, getTreasuryBalance } = useXIONContract();
  const { config, isFullyConfigured, missingConfig } = useXIONContractConfig();
  const [treasuryBalance, setTreasuryBalance] = useState<{ balance: string; denom: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load treasury balance when component mounts
  useEffect(() => {
    if (isInitialized) {
      loadTreasuryBalance();
    }
  }, [isInitialized]);

  const loadTreasuryBalance = async () => {
    setIsRefreshing(true);
    try {
      const balance = await getTreasuryBalance();
      setTreasuryBalance(balance);
    } catch (error) {
      console.error('Failed to load treasury balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Not configured';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseInt(balance);
    return (num / 1000000).toFixed(2); // Convert uxion to XION
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            XION Configuration Status
          </h3>
          <div className={`flex items-center space-x-2 text-sm ${
            isFullyConfigured ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {isFullyConfigured ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{isFullyConfigured ? 'Fully Configured' : 'Needs Configuration'}</span>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Registry Contract
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatAddress(config.contentRegistry)}
                </code>
                {config.contentRegistry && (
                  <button
                    onClick={() => copyToClipboard(config.contentRegistry!)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Treasury Contract
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatAddress(config.treasury)}
                </code>
                {config.treasury && (
                  <button
                    onClick={() => copyToClipboard(config.treasury!)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Network Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                RPC Endpoint
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {config.rpcUrl || 'Default XION testnet'}
                </code>
                {config.rpcUrl && (
                  <a
                    href={config.rpcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                REST Endpoint
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {config.restUrl || 'Default XION testnet'}
                </code>
                {config.restUrl && (
                  <a
                    href={config.restUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Missing Configuration Warning */}
        {!isFullyConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Missing Configuration
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  The following environment variables are missing:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {missingConfig.map((key) => (
                    <li key={key}><code>{key}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection and Treasury Status */}
      {isConnected && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Connection Status
            </h3>
            <button
              onClick={loadTreasuryBalance}
              disabled={isRefreshing}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connected Account
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <code className="text-sm text-gray-600 dark:text-gray-400">
                  {formatAddress(address)}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Treasury Balance
              </label>
              <div className="flex items-center space-x-2">
                {treasuryBalance ? (
                  <>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {formatBalance(treasuryBalance.balance)} XION
                    </span>
                    <span className={`text-xs ${
                      parseInt(treasuryBalance.balance) > 1000000 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {parseInt(treasuryBalance.balance) > 1000000 ? 'Funded' : 'Low Balance'}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!isFullyConfigured && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Setup Instructions
          </h3>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>1. Go to <a href="https://quickstart.dev.testnet.burnt.com" target="_blank" rel="noopener noreferrer" className="underline">XION Quick Launch</a></p>
            <p>2. Connect with your Meta Account</p>
            <p>3. Select "Custom Contract" for content registry</p>
            <p>4. Launch contracts and fund Treasury</p>
            <p>5. Copy the generated environment variables to your <code>.env.local</code> file</p>
          </div>
        </div>
      )}
    </div>
  );
}
