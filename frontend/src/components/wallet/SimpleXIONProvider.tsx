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
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('DialogContent') ||
         message.includes('DialogTitle') ||
         message.includes('Missing Description') ||
         message.includes('aria-describedby') ||
         message.includes('VisuallyHidden') ||
         message.includes('screen reader users'))
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
         message.includes('screen reader users'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <AbstraxionProvider
      config={{
        treasury: "xion1h7x7sl56h9zrvaafg6rfnx6hec7x4y8zfc3jl5",
        gasPrice: "0.001uxion",
        rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
        restUrl: "https://api.xion-testnet-2.burnt.com",
        callbackUrl: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
      }}
    >
      {children}
    </AbstraxionProvider>
  );
}
