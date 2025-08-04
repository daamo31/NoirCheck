/**
 * XION Abstraxion Provider for React Native
 * Using official @burnt-labs/abstraxion-react-native package
 */

import '../utils/polyfills'; // Import polyfills first!
import React from 'react';
import { AbstraxionProvider, AbstraxionConfig } from '@burnt-labs/abstraxion-react-native';

interface XIONProviderProps {
  children: React.ReactNode;
}

// Official XION React Native configuration
const abstraxionConfig: AbstraxionConfig = {
  // Network configuration (testnet by default)
  rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
  gasPrice: "0.001uxion",
  
  // Optional configurations
  callbackUrl: "noirscheck://", // Your app's deep link scheme
  treasury: undefined, // Add treasury contract if needed
  
  // Contract grants (add your contracts here)
  contracts: [
    // Add any contract addresses that need permissions
  ],
};

export function XIONProvider({ children }: XIONProviderProps) {
  return (
    <AbstraxionProvider config={abstraxionConfig}>
      {children}
    </AbstraxionProvider>
  );
} 

