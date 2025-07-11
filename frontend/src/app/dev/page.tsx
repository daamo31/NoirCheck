/**
 * NoirCheck - Development Page
 * Development version with mock authentication for testing
 */

'use client';

import { MockAuthProvider, useMockAuth } from '@/contexts/MockAuthContext';
import { DevUserDashboard } from '@/components/DevUserDashboard';

// Main App Component with Mock Authentication
function DevMainApp() {
  const { isAuthenticated, isLoading, user } = useMockAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Inicializando NoirCheck...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <DevAuthScreen />;
  }

  return <DevUserDashboard />;
}

// Development Auth Screen
function DevAuthScreen() {
  const { login, isLoading, error } = useMockAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              NoirCheck <span className="text-red-400">[DEV]</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Modo de desarrollo con autenticación simulada
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Conectando...
                </>
              ) : (
                'Iniciar Sesión (Demo)'
              )}
            </button>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                ⚠️ Modo de desarrollo: Usando autenticación simulada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Root component with mock provider
export default function DevPage() {
  return (
    <MockAuthProvider>
      <DevMainApp />
    </MockAuthProvider>
  );
}
