/**
 * NoirCheck - Safe XION Provider
 * Wrapper for AbstraxionProvider that handles authentication errors gracefully
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';
import { getXIONConfig } from '@/config/xion';

interface SafeXIONProviderProps {
  children: ReactNode;
}

export function SafeXIONProvider({ children }: SafeXIONProviderProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Capturar errores de XION
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Missing keypair or granter')) {
        setHasError(true);
        setErrorMessage('XION no configurado. Conéctate manualmente desde la aplicación.');
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">
              Configuración XION Pendiente
            </h2>
            <p className="text-yellow-300/80 text-sm">
              {errorMessage}
            </p>
          </div>
          
          <button
            onClick={() => setHasError(false)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <AbstraxionProvider config={getXIONConfig()}>
        {children}
      </AbstraxionProvider>
    );
  } catch (error) {
    console.warn('XION Provider error:', error);
    setHasError(true);
    setErrorMessage('Error inicializando XION. Verifica la configuración.');
    return null;
  }
}
