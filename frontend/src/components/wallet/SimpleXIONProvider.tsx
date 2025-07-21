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
        treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS || "xion1hcuf8dv4n2h6gffez3e0y70gjm20g72mtmcl3qf7t4q0laz5ef0shfm50z",
        gasPrice: "0.001uxion",
        rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443",
        restUrl: process.env.NEXT_PUBLIC_REST_ENDPOINT || "https://api.xion-testnet-2.burnt.com",
        callbackUrl: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
      }}
    >
      {children}
    </AbstraxionProvider>
  );
}
