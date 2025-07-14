/**
 * XION Transaction Service Component
 * 
 * Implements gasless transactions using XION Treasury contracts
 * Uses official @burnt-labs/abstraxion signing client
 */

'use client';

import { useState } from 'react';
import { 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader,
  FileText,
  Hash,
  Zap
} from 'lucide-react';
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";

interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function XIONTransactionService() {
  // Official XION hooks
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client, signArb } = useAbstraxionSigningClient();

  // Local state
  const [isTransacting, setIsTransacting] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);
  const [contentHash, setContentHash] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  /**
   * Register content hash on blockchain
   */
  const registerContent = async () => {
    if (!client || !account?.bech32Address || !contentHash.trim()) {
      alert('Please ensure wallet is connected and content hash is provided');
      return;
    }

    setIsTransacting(true);
    setLastTransaction(null);

    try {
      // Prepare the message for content registration
      const msg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: account.bech32Address,
          contract: "xion1...", // Treasury contract address (from your config)
          msg: Buffer.from(JSON.stringify({
            register_content: {
              hash: contentHash.trim(),
              creator: account.bech32Address,
              timestamp: Date.now()
            }
          })),
          funds: []
        }
      };

      // Execute gasless transaction
      const result = await client.signAndBroadcast(
        account.bech32Address,
        [msg],
        "auto",
        "Register content hash on NoirCheck"
      );

      setLastTransaction({
        success: true,
        transactionHash: result.transactionHash
      });

      // Clear form
      setContentHash('');

    } catch (error) {
      console.error('Transaction failed:', error);
      setLastTransaction({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  /**
   * Send XION tokens (gasless transaction)
   */
  const sendTokens = async () => {
    if (!client || !account?.bech32Address || !recipientAddress.trim() || !amount.trim()) {
      alert('Please fill all fields');
      return;
    }

    setIsTransacting(true);
    setLastTransaction(null);

    try {
      // Convert XION to microXION (multiply by 1,000,000)
      const amountInMicroXion = Math.floor(parseFloat(amount) * 1_000_000).toString();

      const msg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: account.bech32Address,
          toAddress: recipientAddress.trim(),
          amount: [{
            denom: "uxion",
            amount: amountInMicroXion
          }]
        }
      };

      // Execute gasless transaction through Treasury
      const result = await client.signAndBroadcast(
        account.bech32Address,
        [msg],
        "auto",
        `Send ${amount} XION tokens`
      );

      setLastTransaction({
        success: true,
        transactionHash: result.transactionHash
      });

      // Clear form
      setRecipientAddress('');
      setAmount('');

    } catch (error) {
      console.error('Send transaction failed:', error);
      setLastTransaction({
        success: false,
        error: error instanceof Error ? error.message : 'Send transaction failed'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  /**
   * Sign arbitrary message
   */
  const signMessage = async () => {
    if (!signArb || !account?.bech32Address) {
      alert('Wallet not connected or signing not available');
      return;
    }

    const message = "NoirCheck content verification signature";
    
    setIsTransacting(true);
    try {
      // signArb expects (signer, data) according to XION documentation
      const signature = await signArb(account.bech32Address, message);
      console.log('Message signed:', signature);
      
      setLastTransaction({
        success: true,
        transactionHash: `Signature: ${JSON.stringify(signature).slice(0, 32)}...`
      });
    } catch (error) {
      console.error('Signing failed:', error);
      setLastTransaction({
        success: false,
        error: error instanceof Error ? error.message : 'Signing failed'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your XION wallet to use transaction features
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          XION Transactions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gasless transactions powered by Account Abstraction
        </p>
      </div>

      {/* Content Registration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Register Content
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Hash (SHA-256)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value)}
                placeholder="Enter content hash..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <Button
            onClick={registerContent}
            disabled={!contentHash.trim() || isTransacting}
            fullWidth
            structure="base"
          >
            {isTransacting ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                REGISTERING...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                REGISTER CONTENT (GASLESS)
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Send Tokens */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Send XION Tokens
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="xion1..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (XION)
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <Button
            onClick={sendTokens}
            disabled={!recipientAddress.trim() || !amount.trim() || isTransacting}
            fullWidth
            structure="base"
          >
            {isTransacting ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                SENDING...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                SEND TOKENS (GASLESS)
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Message Signing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sign Message
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign a verification message for NoirCheck content authentication
        </p>

        <Button
          onClick={signMessage}
          disabled={isTransacting}
          fullWidth
          structure="base"
        >
          {isTransacting ? (
            <div className="flex items-center justify-center">
              <Loader className="w-4 h-4 animate-spin mr-2" />
              SIGNING...
            </div>
          ) : (
            "SIGN MESSAGE"
          )}
        </Button>
      </div>

      {/* Transaction Result */}
      {lastTransaction && (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
          lastTransaction.success 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="flex items-center mb-2">
            {lastTransaction.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {lastTransaction.success ? 'Transaction Successful!' : 'Transaction Failed'}
            </h4>
          </div>
          
          {lastTransaction.success && lastTransaction.transactionHash && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transaction Hash:
              </p>
              <code className="block text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono break-all">
                {lastTransaction.transactionHash}
              </code>
              <button
                onClick={() => window.open(`https://www.mintscan.io/xion-testnet/tx/${lastTransaction.transactionHash}`, '_blank')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View on Explorer →
              </button>
            </div>
          )}
          
          {lastTransaction.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {lastTransaction.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
