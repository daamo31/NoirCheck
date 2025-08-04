/**
 * XION Abstraxion Provider for React Native
 * Provides XION blockchain integration with Abstraxion modals
 */

import '../utils/polyfills'; // Import polyfills first!
import React, { useEffect } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';

interface XIONProviderProps {
  children: React.ReactNode;
}

export function XIONProvider({ children }: XIONProviderProps) {
  // Suppress console warnings from Abstraxion in React Native
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
      
      // Suppress specific Abstraxion warnings that don't apply to React Native
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('Missing Description') ||
        message.includes('aria-describedby') ||
        message.includes('accessible for screen reader users') ||
        message.includes('Radix UI')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
      
      // Suppress specific Abstraxion errors that don't apply to React Native
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('Missing Description') ||
        message.includes('aria-describedby') ||
        message.includes('Radix UI')
      ) {
        return; // Suppress these errors
      }
      
      originalError.apply(console, args);
    };

    // Cleanup function
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <AbstraxionProvider
      config={{
        restUrl: "https://api.xion-testnet-2.burnt.com", 
        rpcUrl: "https://rpc.xion-testnet-2.burnt.com"
      }}
    >
      {children}
    </AbstraxionProvider>
  );
}

export default XIONProvider;
