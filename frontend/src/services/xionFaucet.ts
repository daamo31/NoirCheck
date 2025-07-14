/**
 * XION Faucet Service
 * 
 * Service for requesting test tokens from XION testnet faucet
 */

export interface FaucetResponse {
  success: boolean;
  txHash?: string;
  error?: string;
  amount?: string;
}

export class XIONFaucetService {
  private static readonly FAUCET_URL = 'https://api.xion-testnet-2.burnt.com/faucet';
  
  /**
   * Request test tokens from XION faucet
   */
  static async requestTokens(address: string): Promise<FaucetResponse> {
    try {
      // Validate XION address format
      if (!address.startsWith('xion1')) {
        return {
          success: false,
          error: 'Invalid XION address format'
        };
      }

      const response = await fetch(this.FAUCET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          amount: '1000000', // 1 XION in micro-XION
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: errorData?.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        txHash: data.txhash || data.tx_hash,
        amount: '1 XION'
      };
    } catch (error) {
      console.error('Faucet request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check faucet status for an address
   */
  static async checkFaucetStatus(address: string): Promise<{
    canRequest: boolean;
    nextRequestTime?: Date;
    remainingTime?: string;
  }> {
    try {
      const response = await fetch(`${this.FAUCET_URL}/status/${address}`);
      
      if (!response.ok) {
        return { canRequest: true }; // If we can't check, assume we can request
      }

      const data = await response.json();
      
      if (data.next_request_time) {
        const nextTime = new Date(data.next_request_time);
        const now = new Date();
        
        if (nextTime > now) {
          const remainingMs = nextTime.getTime() - now.getTime();
          const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
          
          return {
            canRequest: false,
            nextRequestTime: nextTime,
            remainingTime: `${remainingMinutes} minutes`
          };
        }
      }

      return { canRequest: true };
    } catch (error) {
      console.error('Failed to check faucet status:', error);
      return { canRequest: true }; // If check fails, allow request
    }
  }

  /**
   * Get explorer URL for transaction
   */
  static getExplorerUrl(txHash: string): string {
    return `https://www.mintscan.io/xion-testnet/txs/${txHash}`;
  }
}
