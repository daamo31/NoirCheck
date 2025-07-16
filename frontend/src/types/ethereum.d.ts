// Type definitions for wallet providers
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, handler: (data: any) => void) => void;
    removeListener?: (event: string, handler: (data: any) => void) => void;
  };
  
  // XION Abstraxion wallet
  abstraxion?: {
    getAccounts: () => Promise<Array<{ address: string; pubkey: string }>>;
    signMessage: (message: string) => Promise<string>;
    disconnect: () => Promise<void>;
  };

  // WalletConnect for mobile
  WalletConnect?: any;
}
