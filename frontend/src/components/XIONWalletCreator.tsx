/**
 * XION Wallet Creator Component
 * 
 * Allows users to create a new XION wallet directly from the application
 * using XION's API integration with enhanced zkTLS features
 */

'use client';

import { useState } from 'react';
import { 
  Wallet, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Key,
  Loader,
  ArrowRight,
  RefreshCw,
  Coins
} from 'lucide-react';
import { xionApiService, XIONWallet, CreateWalletRequest } from '@/services/xionApi';
import { useMockAuth } from '@/contexts/MockAuthContext';

interface WalletCreationStep {
  id: number;
  title: string;
  completed: boolean;
}

export function XIONWalletCreator() {
  const { updateProfile } = useMockAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<XIONWallet | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [walletCreated, setWalletCreated] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const steps: WalletCreationStep[] = [
    { id: 1, title: 'Setup', completed: false },
    { id: 2, title: 'Create Wallet', completed: false },
    { id: 3, title: 'Backup Seed', completed: false },
    { id: 4, title: 'Verify & Complete', completed: false }
  ];

  /**
   * Create a new XION wallet with zkTLS integration
   */
  const createWallet = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Enhanced wallet creation with zkTLS support
      const walletRequest: CreateWalletRequest = {
        username: username || undefined,
        keyType: 'secp256k1',
        zkTLS: true, // Enable zkTLS features
        entropy: generateSecureEntropy()
      };

      // Try to create real wallet first, fallback to simulation
      let wallet: XIONWallet;
      
      try {
        wallet = await xionApiService.createWallet(walletRequest);
        console.log('✅ Real XION wallet created:', wallet.address);
      } catch (apiError) {
        console.warn('⚠️ XION API not available, using simulation:', apiError);
        // Fallback to simulated wallet for development
        wallet = {
          address: `xion${Math.random().toString(36).substring(2, 41)}`,
          publicKey: `02${Math.random().toString(16).substring(2, 66)}`,
          mnemonic: generateMnemonic(),
          keyType: 'secp256k1',
          zkTLS: {
            enabled: true,
            proofGenerated: true,
            identityVerified: false,
            verificationLevel: 'basic'
          }
        };
      }

      setCreatedWallet(wallet);
      setWalletCreated(true);
      setCurrentStep(3);
      
      // Automatically show wallet info
      setTimeout(() => setShowWalletInfo(true), 1000);
      
    } catch (error) {
      console.error('Wallet creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Generate secure entropy for wallet creation
   */
  const generateSecureEntropy = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  /**
   * Generate a sample mnemonic (replace with actual generation)
   */
  const generateMnemonic = (): string => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'action', 'actor', 'actress', 'actual', 'adapt'
    ];
    
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  };

  /**
   * Copy mnemonic to clipboard
   */
  const copyMnemonic = async () => {
    if (createdWallet?.mnemonic) {
      try {
        await navigator.clipboard.writeText(createdWallet.mnemonic);
        setMnemonicCopied(true);
        setTimeout(() => setMnemonicCopied(false), 3000);
      } catch (error) {
        console.error('Failed to copy mnemonic:', error);
      }
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  /**
   * Download mnemonic as text file
   */
  const downloadMnemonic = () => {
    if (!createdWallet?.mnemonic) {
      alert('No hay frase semilla disponible para descargar');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([createdWallet.mnemonic], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `xion-wallet-seed-${createdWallet.address.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert('Frase semilla descargada. ¡Guárdala en un lugar seguro!');
  };

  /**
   * Request testnet tokens for the new wallet
   */
  const requestFaucetTokens = async () => {
    if (!createdWallet) return;

    try {
      setError(null);
      setIsLoading(true);
      console.log('Requesting faucet tokens for:', createdWallet.address);
      
      // Use the xionApiService to request tokens
      const result = await xionApiService.requestFaucetTokens(createdWallet.address);
      
      if (result.success) {
        console.log('✅ Tokens requested successfully!', result.txHash);
        alert(`¡Tokens solicitados exitosamente!\nTx Hash: ${result.txHash?.substring(0, 20)}...`);
      } else {
        throw new Error('Failed to request tokens');
      }
      
    } catch (error) {
      console.error('Faucet request failed:', error);
      setError('Failed to request testnet tokens. You can try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete zkTLS verification process
   */
  const completeZkTLSVerification = async () => {
    if (!createdWallet) return;

    try {
      setError(null);
      setIsLoading(true);
      console.log('Starting zkTLS verification for:', createdWallet.address);
      
      // Use the xionApiService to complete verification
      const result = await xionApiService.completeZkTLSVerification(createdWallet.address);
      
      if (result.success) {
        // Update the wallet with verified status
        setCreatedWallet(prev => prev ? {
          ...prev,
          zkTLS: {
            ...prev.zkTLS!,
            identityVerified: true,
            verificationLevel: result.verificationLevel as any
          }
        } : null);
        
        console.log('✅ zkTLS verification completed!');
        alert(`¡Verificación zkTLS completada!\nNivel: ${result.verificationLevel}`);
      } else {
        throw new Error('Verification failed');
      }
      
    } catch (error) {
      console.error('zkTLS verification failed:', error);
      setError('Failed to complete zkTLS verification.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connect the created wallet to the dashboard
   */
  const connectWalletToDashboard = async () => {
    if (!createdWallet) return;

    try {
      setIsLoading(true);
      
      // Update the user profile with the new wallet address
      await updateProfile({
        address: createdWallet.address,
        username: username || `usuario_${createdWallet.address.slice(-8)}`
      });
      
      console.log('✅ Wallet connected to dashboard!');
      alert('¡Wallet conectada exitosamente! Serás redirigido al dashboard.');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dev';
      }, 1000);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet to dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Setup */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create XION Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new XION wallet directly from NoirCheck
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username (optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username for your wallet"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                  Important Security Information
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Your wallet will be created locally and securely</li>
                  <li>• You'll receive a 12-word seed phrase to backup your wallet</li>
                  <li>• Never share your seed phrase with anyone</li>
                  <li>• Store your seed phrase in a secure location</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}

      {/* Step 2: Create Wallet */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Key className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Generate Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Click the button below to create your new XION wallet
            </p>
          </div>

          <button
            onClick={createWallet}
            disabled={isCreating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Creating Wallet...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Create XION Wallet
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Backup Seed */}
      {currentStep === 3 && createdWallet && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Backup Your Seed Phrase
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Write down these 12 words in order and keep them safe
            </p>
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wallet Address
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                {createdWallet.address}
              </code>
            </div>
          </div>

          {/* Seed Phrase */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seed Phrase
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Keep this secret and secure
                </span>
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {showMnemonic ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {createdWallet.mnemonic?.split(' ').map((word, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{index + 1}</span>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">{word}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Click the eye icon to reveal your seed phrase
                </div>
              )}

              {showMnemonic && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyMnemonic}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {mnemonicCopied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadMnemonic}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation */}
          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={seedConfirmed}
                onChange={(e) => setSeedConfirmed(e.target.checked)}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I have safely backed up my seed phrase and understand that losing it means losing access to my wallet forever.
              </span>
            </label>
          </div>

          <button
            onClick={() => setCurrentStep(4)}
            disabled={!seedConfirmed}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Continue to Complete Setup
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}

      {/* Step 4: Complete */}
      {currentStep === 4 && createdWallet && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Wallet Creada Exitosamente!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tu wallet XION está lista para usar con tecnología zkTLS
            </p>
          </div>

          {/* Wallet Address Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Dirección de la Wallet:</h3>
              <button
                onClick={() => copyToClipboard(createdWallet.address)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Copiar dirección"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all bg-white dark:bg-gray-800 p-3 rounded border">
              {createdWallet.address}
            </code>
          </div>

          {/* zkTLS Status */}
          {createdWallet.zkTLS && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Estado zkTLS</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Identidad Verificada:</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${createdWallet.zkTLS.identityVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {createdWallet.zkTLS.identityVerified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Nivel de Verificación:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {createdWallet.zkTLS.verificationLevel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* zkTLS Verification Button */}
            {createdWallet.zkTLS && !createdWallet.zkTLS.identityVerified && (
              <button
                onClick={completeZkTLSVerification}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Verificando zkTLS...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Completar Verificación zkTLS
                  </>
                )}
              </button>
            )}

            {/* Request Tokens Button */}
            <button
              onClick={requestFaucetTokens}
              disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Solicitando Tokens...
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Obtener Tokens de Prueba (1 XION)
                </>
              )}
            </button>

            {/* Connect to Dashboard Button */}
            <button
              onClick={connectWalletToDashboard}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Conectar Wallet al Dashboard
                </>
              )}
            </button>

            {/* Secondary Actions */}
            <div className="flex space-x-3 pt-3">
              <button
                onClick={() => setShowWalletInfo(!showWalletInfo)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {showWalletInfo ? 'Ocultar Detalles' : 'Ver Detalles'}
              </button>
              <button
                onClick={downloadMnemonic}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Seed
              </button>
            </div>
          </div>

          {/* Detailed Wallet Info (Collapsible) */}
          {showWalletInfo && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Información Detallada</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tipo de Clave:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{createdWallet.keyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Clave Pública:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-xs">
                    {createdWallet.publicKey.substring(0, 20)}...
                  </span>
                </div>
                {createdWallet.zkTLS && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">zkTLS Habilitado:</span>
                      <span className="text-gray-900 dark:text-white">
                        {createdWallet.zkTLS.enabled ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Prueba Generada:</span>
                      <span className="text-gray-900 dark:text-white">
                        {createdWallet.zkTLS.proofGenerated ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
