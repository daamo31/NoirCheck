/**
 * XION Provider para React Native
 * Configuración completa según documentación oficial
 */

import React, { ReactNode } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion-react-native';

interface XIONProviderProps {
  children: ReactNode;
}

const XIONProvider: React.FC<XIONProviderProps> = ({ children }) => {
  const config = {
    rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT || "https://api.xion-testnet-2.burnt.com",
    treasuryContractAddress: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    callbackUrl: process.env.EXPO_PUBLIC_CALLBACK_URL || "noirscheck://",
    contracts: [],
    gasPrice: "0.001uxion",
    stake: false,
  };

  console.log('🔧 XION Provider Config:', {
    rpcUrl: config.rpcUrl,
    restUrl: config.restUrl,
    treasuryContract: config.treasuryContractAddress ? '✅ Configured' : '❌ Missing',
    userMapContract: process.env.EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS ? '✅ Configured' : '❌ Missing',
    callbackUrl: config.callbackUrl
  });

  return (
    <AbstraxionProvider config={config}>
      {children}
    </AbstraxionProvider>
  );
};

export default XIONProvider;