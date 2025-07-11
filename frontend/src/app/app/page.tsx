/**
 * NoirCheck - Production App Page
 * With improved authentication flow and conditional XION integration
 */

'use client';

import { AuthFlow } from '@/components/AuthFlow';
import { SafeXIONProvider } from '@/components/SafeXIONProvider';
import { AuthProvider } from '@/contexts/AuthContext';

// Root component with conditional providers
export default function AppPage() {
  return (
    <SafeXIONProvider>
      <AuthProvider>
        <AuthFlow />
      </AuthProvider>
    </SafeXIONProvider>
  );
}
