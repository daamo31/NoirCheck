/**
 * Componente de Estado de Conexión XION
 */

'use client';

import { useXIONStatus } from '@/hooks/useXIONStatus';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const { connection, services, loading, error, refresh } = useXIONStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'local_mode':
      case 'testnet':
      case 'mainnet':
        return 'text-green-500';
      case 'disconnected':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (error || !connection.connected) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Conectando con XION blockchain...';
    if (error) return 'Sin conexión';
    if (connection.connected) {
      return `Conectado a NoirCheck + XION`;
    }
    return 'Desconectado';
  };

  const getStatusBadge = () => {
    if (!connection.connected) return null;
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        🔹 {connection.networkName || 'XION Local Mode'}
      </span>
    );
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex flex-col">
            <span className={`font-medium ${getStatusColor(connection.status)}`}>
              {getStatusText()}
            </span>
            {connection.connected && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Backend operativo con XION blockchain
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Actualizar estado"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Servicios Detallados */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📊 Servicios Activos:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span>🗄️ Base de datos:</span>
            <span className={getStatusColor(services.database)}>
              {services.database === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔗 XION Blockchain:</span>
            <span className={getStatusColor(services.xion)}>
              {services.xion === 'local_mode' ? '✅ Local mode' : 
               services.xion === 'testnet' ? '✅ Testnet' :
               services.xion === 'mainnet' ? '✅ Mainnet' : '❌ Desconectado'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📁 Almacenamiento:</span>
            <span className={getStatusColor(services.file_storage)}>
              {services.file_storage === 'available' ? '✅ Disponible' : '❌ No disponible'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-400">
            ⚠️ Error de conexión: {error}
          </p>
        </div>
      )}
    </div>
  );
}
