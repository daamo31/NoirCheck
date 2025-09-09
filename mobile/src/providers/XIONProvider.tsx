/**
 * XION Provider con AbstraxionProvider real
 * Integración completa con XION testnet
 */

import React, { ReactNode } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion-react-native';

interface XIONProviderProps {
  children: ReactNode;
}

const XIONProvider: React.FC<XIONProviderProps> = ({ children }) => {
  const config = {
    treasury: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS || "",
    gasPrice: "0.001uxion",
    rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT || "https://api.xion-testnet-2.burnt.com",
    callbackUrl: process.env.EXPO_PUBLIC_CALLBACK_URL || "noirscheck://",
  };

  console.log('🔧 XION Provider Config:', {
    treasury: config.treasury ? '✅ Configured' : '❌ Missing',
    rpcUrl: config.rpcUrl,
    restUrl: config.restUrl,
    callbackUrl: config.callbackUrl,
    gasPrice: config.gasPrice
  });

  return (
    <AbstraxionProvider
      config={{
        treasury: config.treasury,
        gasPrice: config.gasPrice,
        rpcUrl: config.rpcUrl,
        restUrl: config.restUrl,
        callbackUrl: config.callbackUrl,
      }}
    >
      {children}
    </AbstraxionProvider>
  );
};

export default XIONProvider;