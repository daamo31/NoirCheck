'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletStatus } from '@/hooks/useWalletStatus';

export default function Navigation() {
  const pathname = usePathname();
  const walletStatus = useWalletStatus();
  
  // No mostrar navegación en ciertas páginas
  const hideNavigation = ['/wallet-diagnostic'].includes(pathname);
  
  if (hideNavigation) {
    return null;
  }

  const getConnectionStatusIcon = () => {
    if (walletStatus.isChecking) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
    }
    
    if (walletStatus.hasAnyWallet) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
    
    return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
  };

  const getConnectionStatusText = () => {
    if (walletStatus.isChecking) {
      return 'Verificando...';
    }
    
    if (walletStatus.hasAnyWallet) {
      return 'Wallets disponibles';
    }
    
    return 'Sin wallets';
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-semibold text-lg">NoirCheck</span>
          </Link>

          {/* Enlaces de navegación */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className={`text-sm transition-colors ${
                pathname === '/' 
                  ? 'text-blue-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Inicio
            </Link>
            
            {walletStatus.isMobile && (
              <Link 
                href="/mobile"
                className={`text-sm transition-colors ${
                  pathname === '/mobile' 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Móvil
              </Link>
            )}
            
            <Link 
              href="/wallet-diagnostic"
              className={`text-sm transition-colors flex items-center space-x-1 ${
                pathname === '/wallet-diagnostic' 
                  ? 'text-blue-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Diagnóstico</span>
              {!walletStatus.hasAnyWallet && !walletStatus.isChecking && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </Link>
            
            {/* Indicador de estado de conexión */}
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon()}
              <span className="text-xs text-gray-400">
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
