/**
 * XION Wallet Display Component
 * 
 * Shows wallet information prominently in the user dashboard
 * Displays address, balance, zkTLS status, and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Shield, 
  Coins,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { xionApiService } from '@/services/xionApi';

interface WalletDisplayProps {
  showFullAddress?: boolean;
  showBalance?: boolean;
  showZkTLS?: boolean;
  compact?: boolean;
}

export function XIONWalletDisplay({ 
  showFullAddress = true, 
  showBalance = true, 
  showZkTLS = true,
  compact = false 
}: WalletDisplayProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullAddr, setShowFullAddr] = useState(false);
  const [zkTLSStatus, setZkTLSStatus] = useState({
    enabled: true,
    verified: false,
    level: 'basic' as 'basic' | 'enhanced' | 'full'
  });

  // Refresh wallet data
  const refreshWalletData = async () => {
    if (!user?.address) return;

    setIsLoading(true);
    try {
      // Get balance from XION
      const balances = await xionApiService.getBalance(user.address);
      const xionBalance = balances.find(b => b.denom === 'uxion');
      if (xionBalance) {
        const formattedBalance = (parseInt(xionBalance.amount) / 1000000).toFixed(2);
        setBalance(formattedBalance);
      }

      // Simulate zkTLS status check
      setZkTLSStatus({
        enabled: true,
        verified: Math.random() > 0.5, // Simulate verification status
        level: ['basic', 'enhanced', 'full'][Math.floor(Math.random() * 3)] as any
      });
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWalletData();
  }, [user?.address]);

  // Copy address to clipboard
  const copyAddress = async () => {
    if (user?.address) {
      try {
        await navigator.clipboard.writeText(user.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  // Format address for display
  const formatAddress = (address: string, showFull: boolean = false) => {
    if (showFull) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (!user?.address) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No hay wallet conectada
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                {formatAddress(user.address)}
              </p>
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {showBalance && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {balance} XION
              </p>
            )}
          </div>
          {zkTLSStatus.verified && (
            <Shield className="w-5 h-5 text-green-500" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              XION Wallet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Blockchain habilitado
            </p>
          </div>
        </div>
        <button
          onClick={refreshWalletData}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Address Section */}
      {showFullAddress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Dirección de la Wallet:
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFullAddr(!showFullAddr)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title={showFullAddr ? 'Ocultar dirección completa' : 'Mostrar dirección completa'}
              >
                {showFullAddr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={copyAddress}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Copiar dirección"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={`https://explorer.xion-testnet-2.burnt.com/address/${user.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Ver en explorador"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border break-all">
            {formatAddress(user.address, showFullAddr)}
          </div>
          {copied && (
            <p className="text-green-600 text-xs mt-1">
              ✓ Dirección copiada al portapapeles
            </p>
          )}
        </div>
      )}

      {/* Balance Section */}
      {showBalance && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Balance:
            </span>
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {balance} XION
              </span>
            </div>
          </div>
        </div>
      )}

      {/* zkTLS Status */}
      {showZkTLS && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Estado zkTLS:
            </span>
            <div className="flex items-center space-x-2">
              {zkTLSStatus.verified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {zkTLSStatus.verified ? 'Verificado' : 'Pendiente'}
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Habilitado:</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${zkTLSStatus.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {zkTLSStatus.enabled ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Nivel:</span>
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {zkTLSStatus.level}
              </span>
            </div>
            
            {!zkTLSStatus.verified && (
              <button className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center">
                <Shield className="w-4 h-4 mr-1" />
                Completar Verificación
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center">
          <Coins className="w-4 h-4 mr-2" />
          Faucet
        </button>
        <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center">
          <Shield className="w-4 h-4 mr-2" />
          zkTLS
        </button>
      </div>
    </div>
  );
}
