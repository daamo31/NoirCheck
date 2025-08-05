/**
 * XION Provider para React Native
 * Configuración simple y funcional
 */

import '../../polyfills'; // Import polyfills first
import React, { ReactNode } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion-react-native';

interface XIONProviderProps {
  children: ReactNode;
}

const XIONProvider: React.FC<XIONProviderProps> = ({ children }) => {
  const config = {
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
    gasPrice: "0.001uxion",
    callbackUrl: "noirscheck://",
    contracts: [],
    stake: false,
  };

  return (
    <AbstraxionProvider config={config}>
      {children}
    </AbstraxionProvider>
  );
};

export default XIONProvider;
