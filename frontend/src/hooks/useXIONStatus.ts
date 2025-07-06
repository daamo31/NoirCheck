/**
 * Custom hook para gestionar el estado de XION
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

      // Actualizar estado de servicios
      setServices({
        database: healthCheck.services.database as ServiceStatus['database'],
        xion: healthCheck.services.xion as ServiceStatus['xion'],
        file_storage: healthCheck.services.file_storage as ServiceStatus['file_storage'],
      });

      // Actualizar estado de conexión XION
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
      return 'Desconectado';
  }
}
