/**
 * NoirCheck - Safe XION Provider
 * Wrapper that conditionally loads AbstraxionProvider to prevent authentication errors
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getXIONConfig } from '@/config/xion';
import { useClientOnly, usePathname } from '@/hooks/useClientOnly';

interface SafeXIONProviderProps {
  children: ReactNode;
}

export function SafeXIONProvider({ children }: SafeXIONProviderProps) {
  const [xionEnabled, setXionEnabled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [AbstraxionProvider, setAbstraxionProvider] = useState<any>(null);
  const isClient = useClientOnly();
  const pathname = usePathname();

  useEffect(() => {
    // Only load XION when explicitly enabled or when user tries to connect
    const loadXION = async () => {
      try {
        // Check if we should load XION
        const shouldLoadXION = localStorage.getItem('noircheck_enable_xion') === 'true';
        
        if (shouldLoadXION && !AbstraxionProvider) {
          const { AbstraxionProvider: XIONProvider } = await import('@burnt-labs/abstraxion');
          setAbstraxionProvider(() => XIONProvider);
          setXionEnabled(true);
        }
      } catch (error) {
        console.warn('XION loading failed:', error);
        setHasError(true);
        setErrorMessage('XION is not available in this environment');
      }
    };

    loadXION();

    // Handle global XION errors
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Missing keypair or granter') || 
          event.message?.includes('cannot authenticate')) {
        console.warn('XION authentication error handled:', event.message);
        setHasError(true);
        setErrorMessage('XION authentication will be available when you connect a wallet');
        event.preventDefault();
        // Auto-hide after 5 seconds
        setTimeout(() => setHasError(false), 5000);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Missing keypair or granter') ||
          event.reason?.message?.includes('cannot authenticate')) {
        console.warn('XION promise rejection handled:', event.reason.message);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [AbstraxionProvider]);

  // Function to manually enable XION
  const enableXION = async () => {
    try {
      const { AbstraxionProvider: XIONProvider } = await import('@burnt-labs/abstraxion');
      setAbstraxionProvider(() => XIONProvider);
      setXionEnabled(true);
      localStorage.setItem('noircheck_enable_xion', 'true');
      setHasError(false);
    } catch (error) {
      console.error('Failed to enable XION:', error);
      setHasError(true);
      setErrorMessage('Failed to load XION. Please check your internet connection.');
    }
  };

  // Show notification if there's an error
  if (hasError) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-yellow-600/90 border border-yellow-500 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">XION Notice</h4>
                <p className="text-xs text-yellow-100 mt-1">{errorMessage}</p>
                {!xionEnabled && (
                  <button
                    onClick={enableXION}
                    className="mt-2 text-xs bg-yellow-700 hover:bg-yellow-600 px-2 py-1 rounded"
                  >
                    Enable XION
                  </button>
                )}
              </div>
              <button
                onClick={() => setHasError(false)}
                className="flex-shrink-0 text-yellow-200 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  // If XION is enabled and loaded, use AbstraxionProvider
  if (xionEnabled && AbstraxionProvider) {
    try {
      return (
        <AbstraxionProvider config={getXIONConfig()}>
          {children}
        </AbstraxionProvider>
      );
    } catch (error) {
      console.warn('AbstraxionProvider error:', error);
      // Fall back to children without XION
      return <>{children}</>;
    }
  }

  // Default: render children without XION
  return (
    <>
      {children}
      {/* Only show XION enable button if we're not on auth screens and window is available */}
      {isClient && pathname && !pathname.includes('/auth') && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={enableXION}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors opacity-75 hover:opacity-100"
          >
            Enable XION
          </button>
        </div>
      )}
    </>
  );
}
