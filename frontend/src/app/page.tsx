/**
 * NoirCheck - Main Application Page
 * Digital content authenticity verification platform
 */

'use client';

import { AuthFlow } from '@/components/auth/AuthFlow';
import SimpleXIONProvider from '@/components/wallet/SimpleXIONProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function HomePage() {
  return (
    <SimpleXIONProvider>
      <AuthProvider>
        <AuthFlow />
      </AuthProvider>
    </SimpleXIONProvider>
  );
}
