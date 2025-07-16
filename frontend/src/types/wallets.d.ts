/**
 * Global type declarations for wallet integrations
 */

// Keplr wallet extension types
interface Keplr {
  enable(chainId: string): Promise<void>;
  experimentalSuggestChain(chainInfo: any): Promise<void>;
  getKey(chainId: string): Promise<{
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
  }>;
  getOfflineSigner(chainId: string): any;
  getEnigmaUtils(chainId: string): any;
}

// Extend Window interface to include wallet extensions
declare global {
  interface Window {
    keplr?: Keplr;
    leap?: any;
    cosmostation?: any;
  }
}
