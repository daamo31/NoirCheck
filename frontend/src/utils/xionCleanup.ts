/**
 * XION State Cleanup Utility
 * Provides functions to clean up XION-related state and prevent authentication issues
 */

export const forceCleanXIONState = async (): Promise<void> => {
  console.log('🧹 Force cleaning XION state...');
  
  try {
    // All possible key patterns for the problematic granter account
    const problematicKeys = [
      'xion-authz-granter-account',
      'abstraxion-authz-granter-account',
      'xion_authz_granter_account',
      'abstraxion_authz_granter_account',
      'xion-account',
      'abstraxion-account',
      'xion_account',
      'abstraxion_account',
      'granter-account',
      'granter_account',
      'authz-granter',
      'authz_granter'
    ];

    // Clear localStorage patterns
    const localStorageKeysToRemove = Object.keys(localStorage).filter(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey.includes('xion') || 
             lowerKey.includes('abstraxion') || 
             lowerKey.includes('authz') ||
             lowerKey.includes('granter') ||
             problematicKeys.includes(key);
    });

    localStorageKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ Removed localStorage key:', key);
    });

    // Clear sessionStorage patterns
    const sessionStorageKeysToRemove = Object.keys(sessionStorage).filter(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey.includes('xion') || 
             lowerKey.includes('abstraxion') || 
             lowerKey.includes('authz') ||
             lowerKey.includes('granter') ||
             problematicKeys.includes(key);
    });

    sessionStorageKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log('🗑️ Removed sessionStorage key:', key);
    });

    // Clear specific problematic keys by force
    problematicKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear cookies with XION patterns
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        const lowerName = name.toLowerCase();
        if (lowerName.includes('xion') || 
            lowerName.includes('abstraxion') || 
            lowerName.includes('authz') ||
            lowerName.includes('granter')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          console.log('🍪 Cleared cookie:', name);
        }
      });
    }

    // Clear IndexedDB
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        const xionDatabases = databases.filter(db => 
          db.name && (
            db.name.toLowerCase().includes('xion') || 
            db.name.toLowerCase().includes('abstraxion') ||
            db.name.toLowerCase().includes('authz') ||
            db.name.toLowerCase().includes('granter')
          )
        );
        
        for (const db of xionDatabases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
            console.log('�️ Cleared IndexedDB:', db.name);
          }
        }
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }

    console.log('✅ XION state cleaning completed');
  } catch (error) {
    console.error('❌ Error during XION state cleaning:', error);
  }
};

// Aggressive cleanup that also triggers a page reload
export const forceXIONLogout = async (): Promise<void> => {
  console.log('🚪 Force XION logout...');
  
  await forceCleanXIONState();
  
  // Add a small delay then reload
  setTimeout(() => {
    console.log('🔄 Reloading page to ensure clean state...');
    window.location.reload();
  }, 500);
};

// Periodic cleanup function
export const startPeriodicCleanup = (): (() => void) => {
  console.log('🔄 Starting periodic XION cleanup...');
  
  const problematicKeys = [
    'xion-authz-granter-account',
    'abstraxion-authz-granter-account',
    'xion_authz_granter_account',
    'abstraxion_authz_granter_account'
  ];

  const cleanup = () => {
    let removedAny = false;
    
    problematicKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log('🧹 Periodic cleanup removed:', key);
        removedAny = true;
      }
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log('🧹 Periodic cleanup removed from session:', key);
        removedAny = true;
      }
    });
    
    return removedAny;
  };

  // Run cleanup immediately
  cleanup();

  // Set up periodic cleanup every 5 seconds
  const interval = setInterval(cleanup, 5000);

  // Return cleanup function
  return () => {
    console.log('🛑 Stopping periodic XION cleanup...');
    clearInterval(interval);
  };
};

// Force logout from any existing XION session
export function clearXIONSession(): void {
  try {
    // Clear all XION state first
    forceCleanXIONState();
    
    // Force reload to ensure clean state
    console.log('🔄 Forcing page reload to ensure clean XION session...');
    window.location.reload();
  } catch (error) {
    console.warn('⚠️ Error during forced XION logout:', error);
  }
}

export function isXIONStatePresent(): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const patterns = ['xion', 'abstraxion', 'keypair', 'granter'];
    
    // Check sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    const hasSessionState = sessionKeys.some(key => 
      patterns.some(pattern => key.toLowerCase().includes(pattern))
    );

    // Check localStorage
    const localKeys = Object.keys(localStorage);
    const hasLocalState = localKeys.some(key => 
      patterns.some(pattern => key.toLowerCase().includes(pattern))
    );

    return hasSessionState || hasLocalState;
  } catch (error) {
    console.warn('Error checking XION state:', error);
    return false;
  }
}

export function logXIONState(): void {
  try {
    if (typeof window === 'undefined') return;

    console.log('🔍 XION State Debug:');
    
    const patterns = ['xion', 'abstraxion', 'keypair', 'granter', 'auth', 'account'];
    
    console.log('📋 SessionStorage:');
    Object.keys(sessionStorage).forEach(key => {
      if (patterns.some(pattern => key.toLowerCase().includes(pattern))) {
        console.log(`  ${key}:`, sessionStorage.getItem(key));
      }
    });

    console.log('📋 LocalStorage:');
    Object.keys(localStorage).forEach(key => {
      if (patterns.some(pattern => key.toLowerCase().includes(pattern))) {
        console.log(`  ${key}:`, localStorage.getItem(key));
      }
    });
  } catch (error) {
    console.warn('Error logging XION state:', error);
  }
}
