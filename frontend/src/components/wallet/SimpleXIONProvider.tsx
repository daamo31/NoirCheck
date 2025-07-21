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
           message.includes('cannot authenticate'))
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
           message.includes('cannot authenticate'))
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
        treasury: "xion1h4ux0f4eay9xr5l4jur26na52qzgptmgj6dcep8xhg1r4jwl5fpszekr5s",
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
