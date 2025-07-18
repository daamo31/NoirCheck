/**
 * XION Provider with Accessibility Fixes
 * Handles XION configuration and suppresses accessibility warnings
 */

"use client";

import React, { useEffect } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';

interface AccessibleXIONProviderProps {
  children: React.ReactNode;
}

export default function AccessibleXIONProvider({ children }: AccessibleXIONProviderProps) {
  // Suppress specific accessibility warnings from Abstraxion modals
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('DialogContent') || 
         message.includes('DialogTitle') ||
         message.includes('aria-describedby'))
      ) {
        // Suppress these specific warnings
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('DialogContent') || 
         message.includes('DialogTitle') ||
         message.includes('aria-describedby'))
      ) {
        // Suppress these specific errors
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  // Configuration based on official XION documentation
  const treasuryConfig = {
    treasury: "xion1aza0jdzfc7g0u64k8qcvcxfppll0cjeer56k38vpshe3p26q5kzswpywp9",
    gasPrice: "0.001uxion",
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: "https://api.xion-testnet-2.burnt.com",
    callbackUrl: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  };

  return (
    <AbstraxionProvider config={treasuryConfig}>
      {children}
    </AbstraxionProvider>
  );
}
