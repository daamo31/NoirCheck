'use client';

import { useState } from 'react';
// import WalletStatusChecker from '@/components/WalletStatusChecker'; // Comentado temporalmente - componente no existe
import { WalletService, isMobile, getMobilePlatform } from '@/services/walletService';

export default function WalletDiagnosticPage() {
  const [xionInstalled] = useState<boolean | null>(null);
  const [metamaskInstalled] = useState<boolean | null>(null);
  const [walletConnectSupported, setWalletConnectSupported] = useState<boolean | null>(null);

  const checkWalletConnectSupport = async () => {
    try {
      // Verificar si WalletConnect es soportado
      const supported = await WalletService.isWalletConnectSupported();
      setWalletConnectSupported(supported);
    } catch (error) {
      console.error('Error checking WalletConnect support:', error);
      setWalletConnectSupported(false);
    }
  };

  const deviceInfo = {
    isMobile: isMobile(),
    platform: getMobilePlatform(),
    userAgent: navigator.userAgent,
    isStandalone: (window.navigator as Navigator & { standalone?: boolean }).standalone || false,
    isPWA: window.matchMedia('(display-mode: standalone)').matches
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Diagnóstico de Wallets
          </h1>
          <p className="text-gray-400">
            Verificar la compatibilidad y estado de las wallets en tu dispositivo
          </p>
        </div>

        {/* Información del dispositivo */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 0v12h12V4H4z" clipRule="evenodd" />
            </svg>
            Información del Dispositivo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Dispositivo móvil:</span>
                <span className={deviceInfo.isMobile ? "text-green-400" : "text-red-400"}>
                  {deviceInfo.isMobile ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plataforma:</span>
                <span className="text-white">
                  {deviceInfo.platform || "Desktop"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modo independiente:</span>
                <span className={deviceInfo.isStandalone ? "text-green-400" : "text-gray-400"}>
                  {deviceInfo.isStandalone ? "Sí" : "No"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">PWA:</span>
                <span className={deviceInfo.isPWA ? "text-green-400" : "text-gray-400"}>
                  {deviceInfo.isPWA ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 mb-1">User Agent:</span>
                <span className="text-xs text-gray-500 break-all">
                  {deviceInfo.userAgent}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de las wallets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* <WalletStatusChecker 
            walletType="xion"
            onStatusChange={setXionInstalled}
          >
            {xionInstalled === false && (
              <div className="text-xs text-gray-400">
                XION Wallet es necesaria para la autenticación zkTLS y registro de contenido en blockchain.
              </div>
            )}
          </WalletStatusChecker>

          <WalletStatusChecker 
            walletType="metamask"
            onStatusChange={setMetamaskInstalled}
          >
            {metamaskInstalled === false && (
              <div className="text-xs text-gray-400">
                MetaMask es una alternativa popular para conexiones Web3 y transacciones.
              </div>
            )}
          </WalletStatusChecker> */}
          
          {/* Contenido temporal mientras se restaura WalletStatusChecker */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">XION Wallet</h3>
            <div className="text-gray-300">Estado: {xionInstalled === null ? 'Verificando...' : xionInstalled ? 'Instalado' : 'No instalado'}</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">MetaMask</h3>
            <div className="text-gray-300">Estado: {metamaskInstalled === null ? 'Verificando...' : metamaskInstalled ? 'Instalado' : 'No instalado'}</div>
          </div>
        </div>

        {/* WalletConnect */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              WalletConnect
            </h2>
            <button
              onClick={checkWalletConnectSupport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Verificar
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Soporte para WalletConnect v2:</span>
            <div className="flex items-center space-x-2">
              {walletConnectSupported === null ? (
                <span className="text-gray-500">No verificado</span>
              ) : walletConnectSupported ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-400">Soportado</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-400">No soportado</span>
                </>
              )}
            </div>
          </div>
          
          {walletConnectSupported && (
            <div className="mt-3 text-xs text-gray-400">
              WalletConnect permite conectar con más de 100 wallets diferentes en móvil y desktop.
            </div>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recomendaciones
          </h2>
          
          <div className="space-y-3 text-sm">
            {!xionInstalled && !metamaskInstalled && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-900 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-yellow-400 font-medium">No hay wallets instaladas</p>
                  <p className="text-yellow-300 text-xs mt-1">
                    Para usar NoirCheck necesitas al menos una wallet. Te recomendamos instalar XION Wallet para la mejor experiencia.
                  </p>
                </div>
              </div>
            )}
            
            {deviceInfo.isMobile && (
              <div className="flex items-start space-x-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-900 text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">Dispositivo móvil detectado</p>
                  <p className="text-blue-300 text-xs mt-1">
                    En móviles, las wallets se conectan a través de deep linking. Si tienes problemas, prueba WalletConnect.
                  </p>
                </div>
              </div>
            )}
            
            {xionInstalled && metamaskInstalled && (
              <div className="flex items-start space-x-3 p-3 bg-green-900/20 rounded-lg border border-green-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-medium">Configuración óptima</p>
                  <p className="text-green-300 text-xs mt-1">
                    Tienes múltiples wallets instaladas. Puedes elegir la que prefieras al conectarte.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            Volver a Inicio
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            Actualizar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
