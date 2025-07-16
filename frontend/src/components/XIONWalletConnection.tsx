/**
 * XION Wallet Connection Component
 * 
 * Official integration with XION Abstraxion for wallet connection and management.
 * Uses the @burnt-labs/abstraxion library for seamless account abstraction.
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
  Plus,
  Shield,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';
import { 
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
  useModal
} from "@burnt-labs/abstraxion";
import { useAuth } from '@/contexts/AuthContext';
import { XIONWalletCreator } from './XIONWalletCreator';

// Extend Window interface for Keplr
declare global {
  interface Window {
    keplr?: any;
  }
}

// XION Configuration
const XION_CONFIG = {
  chainId: 'xion-testnet-1',
  chainName: 'XION Testnet',
  rpc: 'https://testnet-rpc.xion.io',
  rest: 'https://testnet-api.xion.io'
};

// Wallet Configuration
const WALLET_CONFIG = {
  keplr: {
    chainId: XION_CONFIG.chainId,
    chainName: XION_CONFIG.chainName,
    rpc: XION_CONFIG.rpc,
    rest: XION_CONFIG.rest,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'xion',
      bech32PrefixAccPub: 'xionpub',
      bech32PrefixValAddr: 'xionvaloper',
      bech32PrefixValPub: 'xionvaloperpub',
      bech32PrefixConsAddr: 'xionvalcons',
      bech32PrefixConsPub: 'xionvalconspub',
    },
    currencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XION',
        coinMinimalDenom: 'uxion',
        coinDecimals: 6,
      },
    ],
    stakeCurrency: {
      coinDenom: 'XION',
      coinMinimalDenom: 'uxion',
      coinDecimals: 6,
    },
  },
};

type WalletType = 'abstraxion' | 'keplr' | 'walletconnect';

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  recommended?: boolean;
}

export function XIONWalletConnection() {
  const { user, login } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [showWalletCreator, setShowWalletCreator] = useState(false);

  // Check wallet availability on component mount
  useEffect(() => {
    checkWalletAvailability();
  }, []);

  /**
   * Check which wallets are available in the current environment
   */
  const checkWalletAvailability = async () => {
    const options: WalletOption[] = [
      {
        id: 'abstraxion',
        name: 'XION Abstraxion',
        description: 'Official XION wallet integration with zkTLS',
        icon: <Wallet className="w-6 h-6" />,
        available: true,
        recommended: true
      },
      {
        id: 'keplr',
        name: 'Keplr Wallet',
        description: 'Popular Cosmos ecosystem wallet',
        icon: <Globe className="w-6 h-6" />,
        available: typeof window !== 'undefined' && !!window.keplr
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        description: 'Connect mobile wallets via QR code',
        icon: <Smartphone className="w-6 h-6" />,
        available: true
      }
    ];

    setWalletOptions(options);
  };

  /**
   * Connect to XION using Abstraxion (recommended)
   */
  const connectAbstraxion = async () => {
    try {
      setConnectionError(null);
      setIsConnecting(true);

      // Dynamic import to prevent SSR issues
      const { AbstraxionProvider, useAbstraxionAccount, useModal } = await import('@burnt-labs/abstraxion');
      
      // Enable XION in SafeXIONProvider
      localStorage.setItem('noircheck_enable_xion', 'true');
      
      // Trigger page reload to enable XION provider
      window.location.reload();
      
    } catch (error) {
      console.error('Abstraxion connection failed:', error);
      setConnectionError('Failed to connect with XION Abstraxion. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Connect to XION using Keplr wallet
   */
  const connectKeplr = async () => {
    try {
      setConnectionError(null);
      setIsConnecting(true);

      if (!window.keplr) {
        throw new Error('Keplr wallet not found. Please install Keplr extension.');
      }

      // Add XION chain to Keplr
      await window.keplr.experimentalSuggestChain(WALLET_CONFIG.keplr);
      
      // Enable XION chain
      await window.keplr.enable(XION_CONFIG.chainId);
      
      // Get account info
      const key = await window.keplr.getKey(XION_CONFIG.chainId);
      
      // Create user session with Keplr address
      // Note: This would need to be implemented in the auth context
      console.log('Keplr connected:', key.bech32Address);
      
      // For now, we'll store the connection info
      localStorage.setItem('noircheck_wallet_type', 'keplr');
      localStorage.setItem('noircheck_wallet_address', key.bech32Address);

    } catch (error) {
      console.error('Keplr connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(`Keplr connection failed: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Connect using WalletConnect
   */
  const connectWalletConnect = async () => {
    try {
      setConnectionError(null);
      setIsConnecting(true);

      // This would require WalletConnect integration
      // For now, show a placeholder
      setConnectionError('WalletConnect integration coming soon!');
      
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      setConnectionError('WalletConnect connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handle wallet connection based on selected type
   */
  const handleConnect = async (walletType: WalletType) => {
    setSelectedWallet(walletType);

    switch (walletType) {
      case 'abstraxion':
        await connectAbstraxion();
        break;
      case 'keplr':
        await connectKeplr();
        break;
      case 'walletconnect':
        await connectWalletConnect();
        break;
    }
  };

  /**
   * Install wallet instructions
   */
  const getInstallUrl = (walletType: WalletType) => {
    switch (walletType) {
      case 'keplr':
        return 'https://www.keplr.app/download';
      case 'abstraxion':
        return 'https://www.burnt.com/xion';
      default:
        return '#';
    }
  };

  // If user wants to create a new wallet, show the creator
  if (showWalletCreator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New XION Wallet
          </h2>
          <button
            onClick={() => setShowWalletCreator(false)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ← Back to connection options
          </button>
        </div>
        <XIONWalletCreator />
      </div>
    );
  }

  // If user is already connected, show connection status
  if (user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Wallet Connected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your XION wallet is successfully connected
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 inline-block">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                {user.address}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connect Your XION Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred wallet to connect to the XION blockchain
        </p>
        
        {/* Create New Wallet Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowWalletCreator(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New XION Wallet
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Don't have a wallet? Create one directly from NoirCheck
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or connect existing wallet
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {connectionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">{connectionError}</p>
          </div>
        </div>
      )}

      {/* Wallet Options */}
      <div className="grid gap-4">
        {walletOptions.map((wallet) => (
          <div
            key={wallet.id}
            className={`relative bg-white dark:bg-gray-800 border rounded-lg p-6 transition-all ${
              wallet.available
                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
                : 'border-gray-100 dark:border-gray-800 opacity-60'
            } ${wallet.recommended ? 'ring-2 ring-blue-500/20' : ''}`}
            onClick={() => wallet.available && !isConnecting && handleConnect(wallet.id)}
          >
            {/* Recommended Badge */}
            {wallet.recommended && (
              <div className="absolute -top-2 left-4">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              </div>
            )}

            <div className="flex items-center">
              {/* Wallet Icon */}
              <div className={`flex-shrink-0 ${wallet.available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                {wallet.icon}
              </div>

              {/* Wallet Info */}
              <div className="ml-4 flex-1">
                <h3 className={`text-lg font-semibold ${wallet.available ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                  {wallet.name}
                </h3>
                <p className={`text-sm ${wallet.available ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  {wallet.description}
                </p>
              </div>

              {/* Status/Action */}
              <div className="ml-4">
                {isConnecting && selectedWallet === wallet.id ? (
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                ) : wallet.available ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <a
                    href={getInstallUrl(wallet.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <span className="text-sm">Install</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={checkWalletAvailability}
          disabled={isConnecting}
          className="inline-flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
          Refresh wallet availability
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          New to XION? {' '}
          <a
            href="https://docs.burnt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Learn more about XION wallets
          </a>
        </p>
      </div>
    </div>
  );
}
