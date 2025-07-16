'use client';

import { useState, useEffect } from 'react';
import { WalletService, isMobile } from '@/services/walletService';

export interface WalletStatus {
  xionInstalled: boolean;
  metamaskInstalled: boolean;
  hasAnyWallet: boolean;
  isMobile: boolean;
  isChecking: boolean;
  walletConnectSupported: boolean;
}

export function useWalletStatus() {
  const [status, setStatus] = useState<WalletStatus>({
    xionInstalled: false,
    metamaskInstalled: false,
    hasAnyWallet: false,
    isMobile: false,
    isChecking: true,
    walletConnectSupported: false
  });

  const checkWalletStatus = async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const isMobileDevice = isMobile();
      
      const [xionInstalled, metamaskInstalled, walletConnectSupported] = await Promise.all([
        WalletService.isWalletAppInstalled('xion'),
        WalletService.isWalletAppInstalled('metamask'),
        WalletService.isWalletConnectSupported()
      ]);
      
      setStatus({
        xionInstalled,
        metamaskInstalled,
        hasAnyWallet: xionInstalled || metamaskInstalled,
        isMobile: isMobileDevice,
        isChecking: false,
        walletConnectSupported
      });
    } catch (error) {
      console.error('Error checking wallet status:', error);
      setStatus(prev => ({
        ...prev,
        isChecking: false,
        hasAnyWallet: false
      }));
    }
  };

  useEffect(() => {
    checkWalletStatus();
  }, []);

  return {
    ...status,
    refreshStatus: checkWalletStatus
  };
}
