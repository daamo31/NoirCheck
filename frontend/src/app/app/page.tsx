/**
 * NoirCheck - Production App Page
 * With improved authentication flow and conditional XION integration
 */

'use client';

import { AuthFlow } from '@/components/auth/AuthFlow';
import SimpleXIONProvider from '@/components/wallet/SimpleXIONProvider';
import { AuthProvider } from '@/contexts/AuthContext';

// Root component with conditional providers
export default function AppPage() {
  return (
    <SimpleXIONProvider>
      <AuthProvider>
        <AuthFlow />
      </AuthProvider>
    </SimpleXIONProvider>
  );
}
