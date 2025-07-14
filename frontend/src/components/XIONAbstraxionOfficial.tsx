/**
 * XION Abstraxion Official Component
 * 
 * Implementation following official XION documentation
 * Provides account abstraction with gasless transactions
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
  useModal,
} from "@burnt-labs/abstraxion";
import { 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Coins
} from 'lucide-react';
import { XIONFaucetService, FaucetResponse } from '@/services/xionFaucet';

// Your contract address (replace with actual contract if you have one)
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export function XIONAbstraxionOfficial() {
  // Abstraxion hooks following official documentation
  const { data: account, isConnected, isConnecting } = useAbstraxionAccount();
  const { client, signArb, logout } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();

  // Component state
  const [, setShowModal] = useModal();
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetResult, setFaucetResult] = useState<FaucetResponse | null>(null);
  const [faucetStatus, setFaucetStatus] = useState<{
    canRequest: boolean;
    remainingTime?: string;
  }>({ canRequest: true });

  // Debug: watch connection states
  useEffect(() => {
    console.log({ isConnected, isConnecting, account });
  }, [isConnected, isConnecting, account]);

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
   * Get account balance
   */
  const getBalance = async () => {
    if (!queryClient || !account?.bech32Address) return;

    setLoading(true);
    try {
      // Query account balance using the REST endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_URL}/cosmos/bank/v1beta1/balances/${account.bech32Address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const xionBalance = data.balances?.find((b: any) => b.denom === 'uxion');
        if (xionBalance) {
          // Convert microXION to XION (divide by 1,000,000)
          const balanceInXion = (parseInt(xionBalance.amount) / 1000000).toFixed(6);
          setBalance(`${balanceInXion} XION`);
        } else {
          setBalance('0 XION');
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error loading balance');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request tokens from faucet
   */
  const requestFaucetTokens = async () => {
    if (!account?.bech32Address) return;

    setFaucetLoading(true);
    setFaucetResult(null);

    try {
      const result = await XIONFaucetService.requestTokens(account.bech32Address);
      setFaucetResult(result);
      
      if (result.success) {
        // Refresh balance after successful faucet request
        setTimeout(() => {
          getBalance();
          checkFaucetStatus();
        }, 3000);
      }
    } catch (error) {
      setFaucetResult({
        success: false,
        error: 'Failed to request tokens'
      });
    } finally {
      setFaucetLoading(false);
    }
  };

  /**
   * Check faucet status
   */
  const checkFaucetStatus = async () => {
    if (!account?.bech32Address) return;

    try {
      const status = await XIONFaucetService.checkFaucetStatus(account.bech32Address);
      setFaucetStatus(status);
    } catch (error) {
      console.error('Failed to check faucet status:', error);
    }
  };

  // Fetch balance when connected
  useEffect(() => {
    if (isConnected && account?.bech32Address) {
      getBalance();
      checkFaucetStatus();
    }
  }, [isConnected, account?.bech32Address]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          XION Abstraxion Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Official XION integration with gasless transactions
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Connection Status
          </h3>
          {isConnecting && (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
        </div>

        {/* Connection Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {account?.bech32Address ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>VIEW ACCOUNT</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>CONNECT WALLET</span>
              </>
            )}
          </button>
        </div>

        {/* Account Information */}
        {account?.bech32Address && (
          <div className="space-y-6">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Wallet Address
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all mr-3">
                  {account.bech32Address}
                </code>
                <button
                  onClick={copyAddress}
                  className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Balance
                </label>
                <button
                  onClick={getBalance}
                  disabled={loading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-1 rounded"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {balance || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Connection Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 block mb-1">Status:</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 block mb-1">Network:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">XION Testnet</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons for Connected Users */}
        {client && (
          <div className="mt-8 space-y-4">
            {/* Faucet Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Testnet Faucet
                  </span>
                </div>
                {faucetStatus.remainingTime && (
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    Next request in {faucetStatus.remainingTime}
                  </span>
                )}
              </div>
              
              <button
                onClick={requestFaucetTokens}
                disabled={faucetLoading || !faucetStatus.canRequest}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-4"
              >
                {faucetLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Get Test Tokens (1 XION)</span>
                  </>
                )}
              </button>

              {/* Faucet Result */}
              {faucetResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  faucetResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                }`}>
                  {faucetResult.success ? (
                    <div>
                      <div className="flex items-center mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="font-medium">Tokens sent successfully!</span>
                      </div>
                      {faucetResult.txHash && (
                        <a
                          href={XIONFaucetService.getExplorerUrl(faucetResult.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-600 dark:text-green-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View transaction
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{faucetResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href={`https://www.mintscan.io/xion-testnet/address/${account?.bech32Address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View in Explorer</span>
            </a>

            {logout && (
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                LOGOUT
              </button>
            )}
          </div>
        )}

        {/* Help Text */}
        {!account?.bech32Address && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                  How to connect:
                </p>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Click "CONNECT WALLET" above</li>
                  <li>• Choose your preferred authentication method</li>
                  <li>• Sign in with Google, email, or existing wallet</li>
                  <li>• Enjoy gasless transactions on XION!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Abstraxion Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />

      {/* Features Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          XION Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Account Abstraction</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No need to manage gas fees or complex transactions
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Multiple Auth Methods</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with Google, email, wallet, or passkey
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Gasless Transactions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Treasury contract covers transaction fees for users
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">zkTLS Security</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced cryptographic security for all transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
