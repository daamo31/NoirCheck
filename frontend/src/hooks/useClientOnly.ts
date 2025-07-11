/**
 * Hook to ensure code runs only on the client side
 * Prevents SSR hydration issues with window/document access
 */
import { useEffect, useState } from 'react';

export const useClientOnly = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook to safely get the current pathname on client side
 */
export const usePathname = () => {
  const [pathname, setPathname] = useState('');
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      
      // Listen to popstate events for navigation changes
      const handlePopState = () => {
        setPathname(window.location.pathname);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isClient]);

  return pathname;
};
