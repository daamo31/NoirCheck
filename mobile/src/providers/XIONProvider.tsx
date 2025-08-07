/**
 * XION Provider simplificado para React Native
 * Versión temporal sin AbstraxionProvider para evitar problemas de Metro
 */

import React, { ReactNode } from 'react';

interface XIONProviderProps {
  children: ReactNode;
}

const XIONProvider: React.FC<XIONProviderProps> = ({ children }) => {
  const config = {
    rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT || "https://api.xion-testnet-2.burnt.com",
    treasuryContractAddress: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    callbackUrl: process.env.EXPO_PUBLIC_CALLBACK_URL || "noirscheck://",
  };

  console.log('🔧 XION Provider Config:', {
    rpcUrl: config.rpcUrl,
    restUrl: config.restUrl,
    treasuryContract: config.treasuryContractAddress ? '✅ Configured' : '❌ Missing',
    userMapContract: process.env.EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS ? '✅ Configured' : '❌ Missing',
    callbackUrl: config.callbackUrl
  });

  // Temporal: Solo envolver children sin AbstraxionProvider
  return <>{children}</>;
};

export default XIONProvider;