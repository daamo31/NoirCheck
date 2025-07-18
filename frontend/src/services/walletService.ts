/**
 * Wallet Service for Mobile and Desktop
 * Handles XION (using @burnt-labs/abstraxion), MetaMask, and WalletConnect integrations
 */

// Utility to detect mobile devices
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Utility to detect iOS
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Utility to detect Android
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Utility to get mobile platform
export const getMobilePlatform = (): 'ios' | 'android' | null => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return null;
};

export interface WalletAccount {
  address: string;
  publicKey?: string;
  type: 'xion' | 'metamask' | 'walletconnect';
}

export class WalletService {
  // XION Configuration based on official documentation
  private static readonly XION_CONFIG = {
    treasury: "xion1r0tt64mdld2svywzeaf4pa7ezsg6agkyajk48ea398njywdl28rs3jhvry",
    gasPrice: "0.001uxion",
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: "https://api.xion-testnet-2.burnt.com:443",
    callbackUrl: "noircheck://", // Should match your app's scheme
  };

  static async connectXIONWallet(): Promise<WalletAccount> {
    try {
      // Import XION libraries dynamically based on environment
      if (isMobile()) {
        return this.connectXIONMobile();
      } else {
        return this.connectXIONDesktop();
      }
    } catch (error) {
      console.error('XION connection failed:', error);
      throw new Error('Failed to connect XION wallet');
    }
  }

  private static async connectXIONDesktop(): Promise<WalletAccount> {
    try {
      // For web/desktop Next.js apps, we need to use the Abstraxion hooks
      // This method should be called from a React component that has access to the hooks
      
      console.log('XION desktop connection - use useAbstraxionAccount and useAbstraxionSigningClient hooks');
      
      // For now, throw error to indicate this should be handled by React components
      throw new Error('XION integration should be handled by React components using useAbstraxionAccount and useAbstraxionSigningClient hooks. See updated implementation in components.');
      
    } catch (error) {
      console.error('XION desktop connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`XION wallet connection failed: ${errorMessage}`);
    }
  }

  private static async connectXIONMobile(): Promise<WalletAccount> {
    try {
      // For mobile web apps, we can still use the same Abstraxion hooks
      // The provider will handle the mobile authentication flow
      
      console.log('XION mobile connection - use useAbstraxionAccount hook in React components');
      
      // For now, throw error to indicate this should be handled by React components
      throw new Error('XION mobile integration should be handled by React components using useAbstraxionAccount hook. See updated implementation in components.');
      
    } catch (error) {
      console.error('XION mobile connection failed:', error);
      throw error;
    }
  }

  static async connectMetaMask(): Promise<WalletAccount> {
    try {
      if (isMobile()) {
        return this.connectMetaMaskMobile();
      }
      return this.connectMetaMaskDesktop();
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  }

  private static async connectMetaMaskDesktop(): Promise<WalletAccount> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No MetaMask accounts found');
      }

      return {
        address: accounts[0],
        type: 'metamask'
      };
    } catch (error: any) {
      if (error?.code === 4001) {
        throw new Error('User denied MetaMask connection');
      }
      throw error;
    }
  }

  private static async connectMetaMaskMobile(): Promise<WalletAccount> {
    // On mobile, check if MetaMask app is installed
    const isMetaMaskInstalled = await this.checkMetaMaskMobileApp();
    
    if (!isMetaMaskInstalled) {
      // Redirect to MetaMask installation
      this.redirectToMetaMaskAppStore();
      throw new Error('MetaMask app not installed');
    }

    // Use deep linking for MetaMask mobile
    return this.connectMetaMaskViaDeepLink();
  }

  // WalletConnect v2 for maximum mobile compatibility
  static async connectWalletConnect(): Promise<WalletAccount> {
    try {
      // Importar WalletConnect v2 dinámicamente
      const { SignClient } = await import('@walletconnect/sign-client');
      const QRCodeModal = (await import('@walletconnect/qrcode-modal')).default;

      // Configure WalletConnect v2 client
      const signClient = await SignClient.init({
        projectId: 'c88b2e1b7e0a4b8c9d3e4f5a6b7c8d9e', // Replace with your real Project ID
        metadata: {
          name: 'NoirCheck',
          description: 'Digital content authenticity verification platform',
          url: 'https://noircheck.com',
          icons: ['https://noircheck.com/icon.png']
        }
      });

      return new Promise((resolve, reject) => {
        let resolved = false;

        const connect = async () => {
          try {
            const { uri, approval } = await signClient.connect({
              requiredNamespaces: {
                eip155: {
                  methods: ['eth_sendTransaction', 'personal_sign'],
                  chains: ['eip155:1', 'eip155:137'], // Ethereum + Polygon
                  events: ['accountsChanged', 'chainChanged']
                }
              }
            });

            if (uri) {
              // Mostrar QR code para móviles
              QRCodeModal.open(uri, () => {
                if (!resolved) {
                  resolved = true;
                  reject(new Error('User closed QR modal'));
                }
              });
            }

            // Esperar aprobación
            const session = await approval();
            QRCodeModal.close();

            if (!resolved) {
              resolved = true;
              const account = session.namespaces.eip155.accounts[0];
              const address = account.split(':')[2];

              resolve({
                address,
                type: 'walletconnect'
              });
            }
          } catch (error) {
            QRCodeModal.close();
            if (!resolved) {
              resolved = true;
              reject(error);
            }
          }
        };

        connect();

        // Timeout después de 2 minutos
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            QRCodeModal.close();
            reject(new Error('Connection timeout'));
          }
        }, 120000);
      });
    } catch (error) {
      console.error('WalletConnect failed:', error);
      throw new Error('WalletConnect connection failed');
    }
  }

  // Método unificado para verificar apps de wallet instaladas
  static async isWalletAppInstalled(walletType: 'xion' | 'metamask'): Promise<boolean> {
    if (!isMobile()) {
      // En desktop, verificar extensiones del navegador
      if (walletType === 'metamask') {
        return !!(window as any).ethereum?.isMetaMask;
      }
      if (walletType === 'xion') {
        return !!(window as any).xion;
      }
      return false;
    }
    
    // En móvil, intentar detectar apps instaladas
    const platform = getMobilePlatform();
    
    if (walletType === 'xion') {
      if (platform === 'ios') {
        return await this.canOpenURLScheme('xion://');
      } else if (platform === 'android') {
        return await this.canOpenIntent('intent://open#Intent;scheme=xion;package=com.burnt.xion;end');
      }
    }
    
    if (walletType === 'metamask') {
      if (platform === 'ios') {
        return await this.canOpenURLScheme('metamask://');
      } else if (platform === 'android') {
        return await this.canOpenIntent('intent://open#Intent;scheme=metamask;package=io.metamask;end');
      }
    }
    
    return false;
  }

  // Method to check if user is authenticated with XION
  static isWalletConnected(type: 'xion' | 'metamask'): boolean {
    if (type === 'xion') {
      // For XION, check if there's an active Abstraxion session
      // This would need to be implemented based on your app's state management
      return false; // Placeholder - implement based on your auth state
    } else if (type === 'metamask') {
      return !!window.ethereum;
    }
    return false;
  }

  // Method to disconnect wallet
  static async disconnectWallet(type: 'xion' | 'metamask' | 'walletconnect'): Promise<void> {
    try {
      if (type === 'xion') {
        // For XION, disconnect through Abstraxion
        const { Abstraxion } = await import('@burnt-labs/abstraxion');
        // Implementation depends on how you store the Abstraxion instance
        console.log('XION disconnect - implement based on your state management');
      }
      // MetaMask and WalletConnect don't have direct disconnect methods
      // They are handled at the application level
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }

  // Nuevos métodos para soporte de WalletConnect
  static async isWalletConnectSupported(): Promise<boolean> {
    try {
      // Verificar si las dependencias de WalletConnect están disponibles
      const { Core } = await import('@walletconnect/core');
      const { SignClient } = await import('@walletconnect/sign-client');
      
      // Verificar si el entorno soporta WalletConnect
      return !!(Core && SignClient && typeof window !== 'undefined');
    } catch (error) {
      console.warn('WalletConnect not supported:', error);
      return false;
    }
  }

  private static async checkXIONAppInstalled(): Promise<boolean> {
    return this.isWalletAppInstalled('xion');
  }

  private static async checkMetaMaskMobileApp(): Promise<boolean> {
    return this.isWalletAppInstalled('metamask');
  }

  private static canOpenURLScheme(scheme: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 2000);
      
      // Método 1: Intentar con iframe (iOS Safari)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.top = '-1000px';
      iframe.src = scheme;
      
      document.body.appendChild(iframe);
      
      // Método 2: Detectar cambio de visibilidad (app se abrió)
      const handleVisibilityChange = () => {
        if (document.hidden && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          document.body.removeChild(iframe);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          document.body.removeChild(iframe);
          resolve(false);
        }
      }, 1500);
    });
  }

  private static canOpenIntent(intent: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      
      // Para Android, intentar abrir la intent URL
      const testLink = document.createElement('a');
      testLink.href = intent;
      testLink.style.display = 'none';
      document.body.appendChild(testLink);
      
      // Detectar si la app se abre (cambio de visibilidad)
      const handleVisibilityChange = () => {
        if (document.hidden && !resolved) {
          resolved = true;
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          document.body.removeChild(testLink);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      try {
        testLink.click();
      } catch (error) {
        // Intent no soportada
      }
      
      // Timeout para detectar si no se abrió la app
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          document.body.removeChild(testLink);
          resolve(false);
        }
      }, 2000);
    });
  }

  static redirectToXIONAppStore(): void {
    if (isIOS()) {
      window.open('https://apps.apple.com/app/xion-wallet', '_blank');
    } else if (isAndroid()) {
      window.open('https://play.google.com/store/apps/details?id=com.xion.wallet', '_blank');
    }
  }

  static redirectToMetaMaskAppStore(): void {
    if (isIOS()) {
      window.open('https://apps.apple.com/app/metamask/id1438144202', '_blank');
    } else if (isAndroid()) {
      window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
    }
  }

  private static async connectViaDeeperLink(): Promise<WalletAccount> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'XION_WALLET_RESPONSE') {
          window.removeEventListener('message', handleMessage);
          if (!resolved) {
            resolved = true;
            if (event.data.success) {
              resolve({
                address: event.data.address,
                publicKey: event.data.publicKey,
                type: 'xion'
              });
            } else {
              reject(new Error(event.data.error || 'XION connection failed'));
            }
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Configurar deep link para XION
      const appUrl = window.location.origin;
      const callbackUrl = `${appUrl}/xion-callback`;
      
      let xionUrl: string;
      
      if (isIOS()) {
        // URL scheme para iOS
        xionUrl = `xion://connect?callback=${encodeURIComponent(callbackUrl)}&app=NoirCheck`;
      } else if (isAndroid()) {
        // Intent URL para Android
        xionUrl = `intent://connect?callback=${encodeURIComponent(callbackUrl)}&app=NoirCheck#Intent;scheme=xion;package=com.xion.wallet;end`;
      } else {
        // Fallback para otros dispositivos
        xionUrl = `https://wallet.xion.gg/connect?callback=${encodeURIComponent(callbackUrl)}&app=NoirCheck`;
      }
      
      // Intentar abrir la app XION
      if (isMobile()) {
        // En móvil, usar window.location para deep linking
        window.location.href = xionUrl;
        
        // Backup: si no se abre la app en 3 segundos, mostrar instrucciones
        setTimeout(() => {
          if (!resolved) {
            const shouldInstall = confirm(
              'No se pudo abrir XION wallet. ¿Deseas instalar la app?'
            );
            if (shouldInstall) {
              this.redirectToXIONAppStore();
            }
            resolved = true;
            reject(new Error('XION app not available'));
          }
        }, 3000);
      } else {
        // En desktop, abrir en nueva ventana
        const popup = window.open(xionUrl, 'xion-connect', 'width=400,height=600');
        
        // Verificar si el popup se cerró
        const checkClosed = setInterval(() => {
          if (popup?.closed && !resolved) {
            clearInterval(checkClosed);
            resolved = true;
            reject(new Error('User closed XION connection window'));
          }
        }, 1000);
      }
      
      // Timeout después de 60 segundos
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          reject(new Error('XION connection timeout'));
        }
      }, 60000);
    });
  }

  private static async connectMetaMaskViaDeepLink(): Promise<WalletAccount> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      // Para MetaMask móvil, usamos el deep linking estándar
      const appUrl = window.location.origin;
      const dappUrl = encodeURIComponent(appUrl);
      
      let metamaskUrl: string;
      
      if (isIOS() || isAndroid()) {
        // URL universal para MetaMask móvil
        metamaskUrl = `https://metamask.app.link/dapp/${dappUrl}`;
      } else {
        // Fallback para desktop
        if (window.ethereum) {
          // Si MetaMask está instalado en desktop
          return this.connectMetaMaskDesktop().then(resolve).catch(reject);
        } else {
          metamaskUrl = 'https://metamask.io/download/';
        }
      }
      
      // Configurar listener para cuando MetaMask regrese
      const handleFocus = async () => {
        window.removeEventListener('focus', handleFocus);
        
        // Esperar un poco para que MetaMask se configure
        setTimeout(async () => {
          if (!resolved) {
            try {
              // Intentar conectar cuando la ventana vuelva al foco
              if (window.ethereum) {
                const account = await this.connectMetaMaskDesktop();
                resolved = true;
                resolve(account);
              } else {
                resolved = true;
                reject(new Error('MetaMask not available after deep link'));
              }
            } catch (error) {
              if (!resolved) {
                resolved = true;
                reject(error);
              }
            }
          }
        }, 1000);
      };
      
      window.addEventListener('focus', handleFocus);
      
      // Abrir MetaMask móvil
      window.location.href = metamaskUrl;
      
      // Backup: si no funciona en 5 segundos, mostrar opciones
      setTimeout(() => {
        if (!resolved) {
          const shouldInstall = confirm(
            'No se pudo abrir MetaMask. ¿Deseas instalar la app?'
          );
          if (shouldInstall) {
            this.redirectToMetaMaskAppStore();
          }
          resolved = true;
          window.removeEventListener('focus', handleFocus);
          reject(new Error('MetaMask app not available'));
        }
      }, 5000);
      
      // Timeout después de 30 segundos
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('focus', handleFocus);
          reject(new Error('MetaMask connection timeout'));
        }
      }, 30000);
    });
  }
}
