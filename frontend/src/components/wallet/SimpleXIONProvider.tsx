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

    // Throttle console overrides to prevent timing issues
    const timeoutId = setTimeout(() => {
      console.warn = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' &&
          (message.includes('DialogContent') ||
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
           message.includes('Login is already in progress'))
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' &&
          (message.includes('DialogContent') ||
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
           message.includes('Login is already in progress'))
        ) {
          return;
        }
        originalError.apply(console, args);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      console.warn = originalWarn;
      console.error = originalError;
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
