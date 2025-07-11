/**
 * Custom hook for managing XION status
 * 
 * This hook provides real-time monitoring of XION blockchain connectivity
 * and overall system status. It manages connection state, service health,
 * and provides methods for status checking and refresh.
 * 
 * Features:
 * - Real-time XION connection monitoring
 * - Service health status tracking
 * - Error handling and recovery
 * - Automatic status refresh
 * - Network information display
 */

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { XIONConnection, ServiceStatus } from '@/types';

export function useXIONStatus() {
  const [connection, setConnection] = useState<XIONConnection>({
    connected: false,
    status: 'disconnected',
  });
  const [services, setServices] = useState<ServiceStatus>({
    database: 'disconnected',
    xion: 'disconnected',
    file_storage: 'unavailable',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [healthCheck] = await Promise.all([
        apiService.healthCheck(),
        apiService.getMobileStatus(),
      ]);

      // Update services status
      setServices({
        database: healthCheck.services.database as ServiceStatus['database'],
        xion: healthCheck.services.xion as ServiceStatus['xion'],
        file_storage: healthCheck.services.file_storage as ServiceStatus['file_storage'],
      });

      // Update XION connection status
      const xionConnected = healthCheck.services.xion !== 'disconnected';
      setConnection({
        connected: xionConnected,
        status: healthCheck.services.xion as XIONConnection['status'],
        networkName: getNetworkName(healthCheck.services.xion),
      });

    } catch (err) {
      console.error('Error checking XION status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnection({
        connected: false,
        status: 'disconnected',
      });
      setServices({
        database: 'error',
        xion: 'error',
        file_storage: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    connection,
    services,
    loading,
    error,
    refresh: checkStatus,
  };
}

function getNetworkName(status: string): string {
  switch (status) {
    case 'local_mode':
      return 'XION Local Mode';
    case 'testnet':
      return 'XION Testnet';
    case 'mainnet':
      return 'XION Mainnet';
    default:
      return 'Disconnected';
  }
}
