/**
 * NoirCheck - Main Application Page
 * Digital content authenticity verification platform
 */

'use client';

import { AuthFlow } from '@/components/AuthFlow';
import { SafeXIONProvider } from '@/components/SafeXIONProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function HomePage() {
  return (
    <SafeXIONProvider>
      <AuthProvider>
        <AuthFlow />
      </AuthProvider>
    </SafeXIONProvider>
  );
}
