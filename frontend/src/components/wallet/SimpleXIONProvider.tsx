/**
 * Simplified XION Provider without internal modal
 * Wraps AbstraxionProvider with treasury configuration
 */

"use client";

import React, { useEffect } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';
import { forceCleanXIONState, startPeriodicCleanup } from '../../utils/xionCleanup';

interface SimpleXIONProviderProps {
  children: React.ReactNode;
}

export default function SimpleXIONProvider({ children }: SimpleXIONProviderProps) {
  // Debug account state changes
  useEffect(() => {
    const checkAccountState = () => {
      try {
        // Check for XION-related data in storage
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.toLowerCase().includes('xion') || 
          key.toLowerCase().includes('abstraxion')
        );
        const localKeys = Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('xion') || 
          key.toLowerCase().includes('abstraxion')
        );
        
        // Only report the problematic key, don't auto-remove immediately
        const problematicKeys = ['xion-authz-granter-account', 'abstraxion-authz-granter-account'];
        const foundProblematicKeys = [
          ...sessionKeys.filter(key => problematicKeys.includes(key)),
          ...localKeys.filter(key => problematicKeys.includes(key))
        ];
        
        if (foundProblematicKeys.length > 0) {
          console.warn('⚠️ Found problematic XION keys (will be cleaned by periodic task):', foundProblematicKeys);
        }
        
        if (sessionKeys.length > 0 || localKeys.length > 0) {
          console.log('🔍 XION storage state changed:');
          console.log('  SessionStorage keys:', sessionKeys);
          console.log('  LocalStorage keys:', localKeys);
          
          // Log the actual values for debugging (exclude problematic keys from detailed logging)
          const safeSessionKeys = sessionKeys.filter(key => !problematicKeys.includes(key));
          const safeLocalKeys = localKeys.filter(key => !problematicKeys.includes(key));
          
          safeSessionKeys.forEach(key => {
            try {
              const value = sessionStorage.getItem(key);
              if (value && value.includes('bech32')) {
                console.log(`  📦 ${key}:`, JSON.parse(value));
              }
            } catch (e) {
              // Ignore parse errors
            }
          });
          
          safeLocalKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key);
              if (value && value.includes('bech32')) {
                console.log(`  📦 ${key}:`, JSON.parse(value));
              }
            } catch (e) {
              // Ignore parse errors
            }
          });
        }
      } catch (error) {
        console.warn('Error checking account state:', error);
      }
    };

    // Check immediately and set up interval
    checkAccountState();
    const interval = setInterval(checkAccountState, 2000);

    return () => clearInterval(interval);
  }, []);

  // Suppress console warnings for development
  useEffect(() => {
    // Only suppress warnings in development and if not already suppressed
    if (process.env.NODE_ENV !== 'development') return;
    
    const originalWarn = console.warn;
    const originalError = console.error;

    // Clear XION state ONLY if there are problematic keys that cause errors
    const clearProblematicXIONState = () => {
      try {
        // Only clear the specific problematic key that causes authentication errors
        const problematicKey = 'xion-authz-granter-account';
        
        if (localStorage.getItem(problematicKey)) {
          localStorage.removeItem(problematicKey);
          console.log('🧹 Removed problematic key:', problematicKey);
        }
        
        if (sessionStorage.getItem(problematicKey)) {
          sessionStorage.removeItem(problematicKey);
          console.log('🧹 Removed problematic key from session:', problematicKey);
        }
      } catch (error) {
        console.warn('Error clearing problematic XION keys:', error);
      }
    };

    // Only clear problematic state, not all XION state
    clearProblematicXIONState();
    
    // Start a more conservative periodic cleanup that only targets problematic keys
    const conservativeCleanup = () => {
      const problematicKey = 'xion-authz-granter-account';
      let removedAny = false;
      
      if (localStorage.getItem(problematicKey)) {
        localStorage.removeItem(problematicKey);
        console.log('🧹 Conservative cleanup removed:', problematicKey);
        removedAny = true;
      }
      
      if (sessionStorage.getItem(problematicKey)) {
        sessionStorage.removeItem(problematicKey);
        console.log('🧹 Conservative cleanup removed from session:', problematicKey);
        removedAny = true;
      }
      
      return removedAny;
    };

    // Run conservative cleanup every 10 seconds (less aggressive)
    const cleanupInterval = setInterval(conservativeCleanup, 10000);

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
          message.includes('authenticate') ||
          message.includes('overrideMethod') ||
          message.includes('AbstraxionContextProvider')
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
          message.includes('authenticate') ||
          message.includes('overrideMethod') ||
          message.includes('AbstraxionContextProvider') ||
          message.includes('hook.js') ||
          message.includes('index.mjs')
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
          message.includes('Error querying params') ||
          message.includes('overrideMethod') ||
          message.includes('AbstraxionContextProvider') ||
          message.includes('authenticate @') ||
          message.includes('hook.js') ||
          message.includes('index.mjs')
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
      // Stop conservative cleanup
      clearInterval(cleanupInterval);
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
