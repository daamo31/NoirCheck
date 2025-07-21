/**
 * Simplified XION Provider without internal modal
 * Wraps AbstraxionProvider with treasury configuration
 */

"use client";

import React, { useEffect } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';

interface SimpleXIONProviderProps {
  children: React.ReactNode;
}

export default function SimpleXIONProvider({ children }: SimpleXIONProviderProps) {
  // Suppress console warnings for development
  useEffect(() => {
    // Only suppress warnings in development and if not already suppressed
    if (process.env.NODE_ENV !== 'development') return;
    
    const originalWarn = console.warn;
    const originalError = console.error;

    // Clear any existing XION state on provider mount
    const clearXIONState = () => {
      try {
        if (typeof window !== 'undefined') {
          // Clear all XION related storage
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('xion') || key.includes('abstraxion') || key.includes('XION') || key.includes('wallet')) {
              sessionStorage.removeItem(key);
            }
          });
          Object.keys(localStorage).forEach(key => {
            if (key.includes('xion') || key.includes('abstraxion') || key.includes('XION') || key.includes('wallet')) {
              localStorage.removeItem(key);
            }
          });
          console.log('🧹 Cleared XION state on provider mount');
        }
      } catch (error) {
        console.warn('Error clearing XION state:', error);
      }
    };

    clearXIONState();

    // Throttle console overrides to prevent timing issues
    const timeoutId = setTimeout(() => {
      console.warn = (...args) => {
        const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
        if (
          message.includes('DialogContent') ||
          message.includes('DialogTitle') ||
          message.includes('Missing Description') ||
          message.includes('aria-describedby') ||
          message.includes('VisuallyHidden') ||
          message.includes('screen reader users') ||
          message.includes('Missing keypair or granter') ||
          message.includes('cannot authenticate') ||
          message.includes('Error querying params') ||
          message.includes('decoding bech32 failed') ||
          message.includes('invalid checksum') ||
          message.includes('Login is already in progress') ||
          message.includes('Missing `Description`') ||
          message.includes('For more information, see https://radix-ui.com') ||
          message.includes('If you want to hide the `DialogTitle`') ||
          message.includes('keypair') ||
          message.includes('granter') ||
          message.includes('authenticate')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
        if (
          message.includes('DialogContent') ||
          message.includes('DialogTitle') ||
          message.includes('Missing Description') ||
          message.includes('aria-describedby') ||
          message.includes('VisuallyHidden') ||
          message.includes('screen reader users') ||
          message.includes('Missing keypair or granter') ||
          message.includes('cannot authenticate') ||
          message.includes('Error querying params') ||
          message.includes('decoding bech32 failed') ||
          message.includes('invalid checksum') ||
          message.includes('Login is already in progress') ||
          message.includes('Query failed with') ||
          message.includes('treasury::state::Params') ||
          message.includes('not found: query wasm contract failed') ||
          message.includes('unknown request') ||
          message.includes('queryAbci') ||
          message.includes('queryContractSmart') ||
          message.includes('AAClient') ||
          message.includes('queryTreasuryContract') ||
          message.includes('keypair') ||
          message.includes('granter') ||
          message.includes('authenticate')
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      // También interceptar console.log para XION
      const originalLog = console.log;
      console.log = (...args) => {
        const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
        if (
          message.includes('Login is already in progress') ||
          message.includes('Missing keypair or granter') ||
          message.includes('cannot authenticate') ||
          message.includes('Error querying params')
        ) {
          return;
        }
        originalLog.apply(console, args);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      console.warn = originalWarn;
      console.error = originalError;
      // console.log se restaurará automáticamente al recargar
    };
  }, []);

  return (
    <AbstraxionProvider
      config={{
        treasury: "xion13uwmwzdes7urtjyv7mye8ty6uk0vsgdrh2a2k94tp0yxx9vv3e9qazapyu", // Official XION example treasury
        gasPrice: "0.001uxion",
        rpcUrl: "https://rpc.xion-testnet-2.burnt.com/",
        restUrl: "https://api.xion-testnet-2.burnt.com/",
        callbackUrl: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
      }}
    >
      {children}
    </AbstraxionProvider>
  );
}
