"use client";

import React, { useEffect } from "react";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

interface SimpleXIONProviderProps {
  children: React.ReactNode;
}

export default function SimpleXIONProvider({ children }: SimpleXIONProviderProps) {
  // Suppress Radix UI accessibility warnings from Abstraxion
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
      
      // Suppress specific Radix UI warnings from Abstraxion
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('Missing Description') ||
        message.includes('aria-describedby') ||
        message.includes('accessible for screen reader users')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
      
      // Suppress specific Radix UI errors from Abstraxion
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('Missing Description') ||
        message.includes('aria-describedby')
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
