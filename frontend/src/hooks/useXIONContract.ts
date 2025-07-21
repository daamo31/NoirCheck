/**
 * Custom hook for XION contract interactions
 * 
 * Provides easy-to-use methods for registering and verifying content
 * on XION blockchain with proper error handling and loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
import { XIONContractService, type RegistrationResult, type VerificationResult } from '@/services/xionContract';
import { useXIONAuth } from '@/services/useXIONAuth';

export function useXIONContract() {
  const { client } = useAbstraxionSigningClient();
  const { account, isConnected } = useXIONAuth();
  const address = account?.bech32Address;
  const [contractService, setContractService] = useState<XIONContractService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract service when client and address are available
  useEffect(() => {
    const initializeService = async () => {
      if (client && address && isConnected) {
        try {
          const service = new XIONContractService();
          await service.initialize(client, address);
          setContractService(service);
          setIsInitialized(true);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize contract service');
          setIsInitialized(false);
        }
      } else {
        setContractService(null);
        setIsInitialized(false);
      }
    };

    initializeService();
  }, [client, address, isConnected]);

  /**
   * Register content on XION blockchain
   */
  const registerContent = useCallback(async (
    contentHash: string,
    metadata: {
      filename?: string;
      description?: string;
      file_size?: number;
      content_type?: string;
    }
  ): Promise<RegistrationResult> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    try {
      setError(null);
      return await contractService.registerContent(contentHash, metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [contractService]);

  /**
   * Verify content on XION blockchain
   */
  const verifyContent = useCallback(async (
    contentHash: string
  ): Promise<VerificationResult> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    try {
      setError(null);
      return await contractService.verifyContent(contentHash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [contractService]);

  /**
   * Get Treasury balance for monitoring
   */
  const getTreasuryBalance = useCallback(async () => {
    if (!contractService) {
      return null;
    }

    try {
      return await contractService.getTreasuryBalance();
    } catch (err) {
      console.warn('Failed to get treasury balance:', err);
      return null;
    }
  }, [contractService]);

  /**
   * Get contract configuration information
   */
  const getContractInfo = useCallback(() => {
    return contractService?.getContractInfo() || {
      contentRegistry: null,
      treasury: null,
      rpcUrl: null,
      restUrl: null,
      isConfigured: false
    };
  }, [contractService]);

  return {
    // State
    isInitialized,
    isConnected,
    error,
    contractInfo: getContractInfo(),

    // Actions
    registerContent,
    verifyContent,
    getTreasuryBalance,

    // Utils
    clearError: () => setError(null),
  };
}

/**
 * Hook for monitoring XION contract configuration
 * Useful for setup and debugging
 */
export function useXIONContractConfig() {
  const config = {
    contentRegistry: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null,
    treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || null,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || null,
    restUrl: process.env.NEXT_PUBLIC_REST_URL || null,
  };

  const isFullyConfigured = !!(
    config.contentRegistry && 
    config.treasury && 
    config.rpcUrl && 
    config.restUrl
  );

  const getMissingConfig = () => {
    const missing: string[] = [];
    if (!config.contentRegistry) missing.push('NEXT_PUBLIC_CONTRACT_ADDRESS');
    if (!config.treasury) missing.push('NEXT_PUBLIC_TREASURY_ADDRESS');
    if (!config.rpcUrl) missing.push('NEXT_PUBLIC_RPC_URL');
    if (!config.restUrl) missing.push('NEXT_PUBLIC_REST_URL');
    return missing;
  };

  return {
    config,
    isFullyConfigured,
    missingConfig: getMissingConfig(),
  };
}
