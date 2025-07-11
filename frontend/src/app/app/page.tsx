/**
 * NoirCheck - Production App Page
 * With full XION zkTLS integration
 */

'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { UserDashboard } from '@/components/UserDashboard';
import { SafeXIONProvider } from '@/components/SafeXIONProvider';

// Main App Component with Authentication
function MainApp() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    return <AuthScreen />;
  }

  return <UserDashboard />;
}

// Root component with providers
export default function AppPage() {
  return (
    <SafeXIONProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeXIONProvider>
  );
}
