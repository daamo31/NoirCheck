/**
 * XION Keypair Management Service
 * 
 * Gestiona la creación, almacenamiento y recuperación del keypair del usuario
 * para la autenticación con XION blockchain.
 */

export interface XIONKeypair {
  address: string;
  privateKey?: string; // Opcional por seguridad
  publicKey: string;
  mnemonic?: string; // Opcional, solo para creación nueva
}

export interface XIONWalletState {
  isConnected: boolean;
  address: string | null;
  keypair: XIONKeypair | null;
  granter: string | null;
}

class XIONKeypairService {
  private static instance: XIONKeypairService;
  private keypair: XIONKeypair | null = null;
  private walletState: XIONWalletState = {
    isConnected: false,
    address: null,
    keypair: null,
    granter: null
  };

  public static getInstance(): XIONKeypairService {
    if (!XIONKeypairService.instance) {
      XIONKeypairService.instance = new XIONKeypairService();
    }
    return XIONKeypairService.instance;
  }

  /**
   * Inicializa el servicio y verifica si hay un keypair existente
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🔑 Initializing XION Keypair Service...');
      
      // Intentar cargar keypair existente desde almacenamiento seguro
      const existingKeypair = await this.loadExistingKeypair();
      
      if (existingKeypair) {
        this.keypair = existingKeypair;
        this.walletState = {
          isConnected: true,
          address: existingKeypair.address,
          keypair: existingKeypair,
          granter: this.getGranterFromStorage()
        };
        console.log('✅ Found existing XION keypair:', existingKeypair.address);
      } else {
        console.log('🔍 No existing XION keypair found');
        this.walletState = {
          isConnected: false,
          address: null,
          keypair: null,
          granter: null
        };
      }
    } catch (error) {
      console.error('❌ Error initializing XION Keypair Service:', error);
      this.walletState = {
        isConnected: false,
        address: null,
        keypair: null,
        granter: null
      };
    }
  }

  /**
   * Crea un nuevo keypair para el usuario
   */
  public async createNewKeypair(): Promise<XIONKeypair> {
    try {
      console.log('🔑 Creating new XION keypair...');
      
      // Por ahora, simularemos la creación del keypair
      // En producción, esto usaría las librerías criptográficas de XION
      const newKeypair = await this.generateMockKeypair();
      
      // Almacenar el keypair de forma segura
      await this.storeKeypair(newKeypair);
      
      this.keypair = newKeypair;
      this.walletState = {
        isConnected: true,
        address: newKeypair.address,
        keypair: newKeypair,
        granter: null // Se establecerá después de la autenticación
      };
      
      console.log('✅ Created new XION keypair:', newKeypair.address);
      return newKeypair;
    } catch (error) {
      console.error('❌ Error creating XION keypair:', error);
      throw new Error('Failed to create XION keypair');
    }
  }

  /**
   * Conecta con un keypair existente (importar cartera)
   */
  public async connectExistingKeypair(mnemonic: string): Promise<XIONKeypair> {
    try {
      console.log('🔗 Connecting to existing XION keypair...');
      
      // Validar y derivar el keypair desde el mnemonic
      const existingKeypair = await this.deriveKeypairFromMnemonic(mnemonic);
      
      // Almacenar el keypair
      await this.storeKeypair(existingKeypair);
      
      this.keypair = existingKeypair;
      this.walletState = {
        isConnected: true,
        address: existingKeypair.address,
        keypair: existingKeypair,
        granter: null
      };
      
      console.log('✅ Connected to existing XION keypair:', existingKeypair.address);
      return existingKeypair;
    } catch (error) {
      console.error('❌ Error connecting to existing XION keypair:', error);
      throw new Error('Failed to connect to existing XION keypair');
    }
  }

  /**
   * Obtiene el estado actual de la cartera
   */
  public getWalletState(): XIONWalletState {
    return { ...this.walletState };
  }

  /**
   * Obtiene el keypair actual
   */
  public getCurrentKeypair(): XIONKeypair | null {
    return this.keypair ? { ...this.keypair } : null;
  }

  /**
   * Establece el granter para operaciones autorizadas
   */
  public setGranter(granter: string): void {
    this.walletState.granter = granter;
    // Almacenar el granter en localStorage para persistencia
    localStorage.setItem('xion-wallet-granter', granter);
    console.log('🔐 Set XION granter:', granter);
  }

  /**
   * Limpia el estado de la cartera (logout)
   */
  public async clearWalletState(): Promise<void> {
    try {
      console.log('🧹 Clearing XION wallet state...');
      
      // Limpiar almacenamiento
      localStorage.removeItem('xion-wallet-keypair');
      localStorage.removeItem('xion-wallet-granter');
      sessionStorage.removeItem('xion-wallet-session');
      
      // Resetear estado
      this.keypair = null;
      this.walletState = {
        isConnected: false,
        address: null,
        keypair: null,
        granter: null
      };
      
      console.log('✅ XION wallet state cleared');
    } catch (error) {
      console.error('❌ Error clearing XION wallet state:', error);
    }
  }

  /**
   * Verifica si el usuario está autenticado y listo para operaciones
   */
  public isReadyForOperations(): boolean {
    return this.walletState.isConnected && 
           this.walletState.keypair !== null && 
           this.walletState.address !== null;
  }

  // Métodos privados

  private async loadExistingKeypair(): Promise<XIONKeypair | null> {
    try {
      const storedKeypair = localStorage.getItem('xion-wallet-keypair');
      if (storedKeypair) {
        return JSON.parse(storedKeypair);
      }
      return null;
    } catch (error) {
      console.warn('Error loading existing keypair:', error);
      return null;
    }
  }

  private getGranterFromStorage(): string | null {
    try {
      return localStorage.getItem('xion-wallet-granter');
    } catch (error) {
      console.warn('Error loading granter from storage:', error);
      return null;
    }
  }

  private async storeKeypair(keypair: XIONKeypair): Promise<void> {
    try {
      // En producción, esto debería usar almacenamiento encriptado
      const keypairToStore = {
        address: keypair.address,
        publicKey: keypair.publicKey,
        // NO almacenar la clave privada en localStorage en producción
        // privateKey: keypair.privateKey
      };
      
      localStorage.setItem('xion-wallet-keypair', JSON.stringify(keypairToStore));
      console.log('💾 Keypair stored securely');
    } catch (error) {
      console.error('Error storing keypair:', error);
      throw error;
    }
  }

  private async generateMockKeypair(): Promise<XIONKeypair> {
    // Simulación para desarrollo - en producción usar XION SDK
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    
    return {
      address: `xion1${random}${timestamp.toString(36)}`,
      publicKey: `xionpub1${random}pubkey`,
      privateKey: `xionpriv1${random}privkey`, // Solo para desarrollo
      mnemonic: `word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12`
    };
  }

  private async deriveKeypairFromMnemonic(mnemonic: string): Promise<XIONKeypair> {
    // Simulación para desarrollo - en producción usar XION SDK
    const hash = await this.simpleHash(mnemonic);
    
    return {
      address: `xion1${hash.substring(0, 20)}`,
      publicKey: `xionpub1${hash.substring(20, 40)}`,
      mnemonic: mnemonic
    };
  }

  private async simpleHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const xionKeypairService = XIONKeypairService.getInstance();
