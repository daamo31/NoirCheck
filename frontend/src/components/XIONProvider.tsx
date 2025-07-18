/**
 * XION Provider Wrapper
 * Handles XION configuration and provider setup
 */

"use client";

import React from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';

interface XIONProviderProps {
  children: React.ReactNode;
}

export default function XIONProvider({ children }: XIONProviderProps) {
  // Configuration based on official XION documentation examples
  // Using exact values from the working todo-app-expo-demo
  const treasuryConfig = {
    treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS || "xion1aza0jdzfc7g0u64k8qcvcxfppll0cjeer56k38vpshe3p26q5kzswpywp9",
    gasPrice: "0.001uxion",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: process.env.NEXT_PUBLIC_REST_ENDPOINT || "https://api.xion-testnet-2.burnt.com",
    callbackUrl: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
    // Add contracts configuration if needed
    contracts: [
      process.env.NEXT_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS || "xion1svpts9q2ml4ahgc4tuu95w8cqzv988s6mf5mupt5kt56gvdnklks9hzar4"
    ],
    // Add bank configuration for token operations
    bank: [
      { denom: "uxion", amount: "1000000" }
    ],
    // Disable staking for simplicity
    stake: false
  };

  // Debug: Log configuration to see what's being used
  console.log('XION Treasury Config:', treasuryConfig);

  return (
    <AbstraxionProvider config={treasuryConfig}>
      {children}
    </AbstraxionProvider>
  );
}
