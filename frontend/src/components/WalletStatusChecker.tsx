'use client';

import { useState, useEffect } from 'react';
import { WalletService } from '@/services/walletService';

interface WalletStatusCheckerProps {
  walletType: 'xion' | 'metamask';
  children?: React.ReactNode;
  onStatusChange?: (isInstalled: boolean) => void;
}

export default function WalletStatusChecker({ 
  walletType, 
  children, 
  onStatusChange 
}: WalletStatusCheckerProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWalletStatus = async () => {
      setIsChecking(true);
      try {
        const installed = await WalletService.isWalletAppInstalled(walletType);
        setIsInstalled(installed);
        onStatusChange?.(installed);
      } catch (error) {
        console.error(`Error checking ${walletType} wallet:`, error);
        setIsInstalled(false);
        onStatusChange?.(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkWalletStatus();
  }, [walletType, onStatusChange]);

  const getWalletDisplayName = () => {
    return walletType === 'xion' ? 'XION Wallet' : 'MetaMask';
  };

  const getWalletIcon = () => {
    if (walletType === 'xion') {
      return (
        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">X</span>
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">M</span>
      </div>
    );
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      );
    }
    
    if (isInstalled === true) {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (isInstalled === false) {
      return (
        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    return null;
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    if (isInstalled === true) return 'Instalada';
    if (isInstalled === false) return 'No instalada';
    return 'Estado desconocido';
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-blue-500';
    if (isInstalled === true) return 'text-green-500';
    if (isInstalled === false) return 'text-red-500';
    return 'text-gray-500';
  };

  const handleInstallWallet = () => {
    if (walletType === 'xion') {
      WalletService.redirectToXIONAppStore();
    } else if (walletType === 'metamask') {
      WalletService.redirectToMetaMaskAppStore();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getWalletIcon()}
          <span className="text-white font-medium">{getWalletDisplayName()}</span>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {isInstalled === false && !isChecking && (
          <button
            onClick={handleInstallWallet}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
          >
            Instalar
          </button>
        )}
      </div>
      
      {children && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
