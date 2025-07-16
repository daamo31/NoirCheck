/**
 * XION Wallet Setup Tutorial
 * 
 * Step-by-step guide to help users set up and connect XION wallets
 */

'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  Download, 
  Smartphone, 
  Chrome, 
  CheckCircle,
  ExternalLink,
  Copy,
  Wallet,
  Shield,
  Coins
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  action?: {
    type: 'download' | 'link' | 'copy';
    label: string;
    url?: string;
    value?: string;
  };
  completed?: boolean;
}

export function XIONWalletTutorial() {
  const [currentStep, setCurrentStep] = useState(1);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Choose Your Wallet Type',
      description: 'XION supports multiple wallet types. For beginners, we recommend the XION Abstraxion wallet for the best experience.',
      action: {
        type: 'link',
        label: 'Learn about XION wallets',
        url: 'https://docs.burnt.com/xion/learn/introduction'
      }
    },
    {
      id: 2,
      title: 'Install Wallet Extension',
      description: 'For browser-based usage, install a compatible wallet extension like Keplr or use XION Abstraxion.',
      action: {
        type: 'download',
        label: 'Download Keplr Extension',
        url: 'https://www.keplr.app/download'
      }
    },
    {
      id: 3,
      title: 'Get Testnet Tokens',
      description: 'To interact with XION testnet, you\'ll need some test tokens. Use the faucet to get free testnet XION.',
      action: {
        type: 'link',
        label: 'Get testnet tokens',
        url: 'https://faucet.burnt.com/'
      }
    },
    {
      id: 4,
      title: 'Connect to NoirCheck',
      description: 'Return to NoirCheck and use the wallet connection interface to link your XION wallet.',
    }
  ];

  const handleCopy = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Wallet className="w-12 h-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            XION Wallet Setup Guide
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Follow these steps to connect your XION wallet to NoirCheck
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep} of {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentStep}
            </div>
          </div>
          
          <div className="ml-6 flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
              {steps[currentStep - 1].description}
            </p>

            {/* Action Button */}
            {steps[currentStep - 1].action && (
              <div className="mb-6">
                {steps[currentStep - 1].action?.type === 'download' && (
                  <a
                    href={steps[currentStep - 1].action?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {steps[currentStep - 1].action?.label}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}

                {steps[currentStep - 1].action?.type === 'link' && (
                  <a
                    href={steps[currentStep - 1].action?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {steps[currentStep - 1].action?.label}
                  </a>
                )}

                {steps[currentStep - 1].action?.type === 'copy' && (
                  <button
                    onClick={() => handleCopy(steps[currentStep - 1].action?.value || '', 'action')}
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {copySuccess === 'action' ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <Copy className="w-5 h-5 mr-2" />
                    )}
                    {copySuccess === 'action' ? 'Copied!' : steps[currentStep - 1].action?.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step-specific Content */}
      {currentStep === 1 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <Shield className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">XION Abstraxion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Native XION wallet with zkTLS technology. Recommended for new users.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <Chrome className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browser Extension</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use Keplr or other Cosmos-compatible wallet extensions.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <Smartphone className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mobile Wallet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect mobile wallets using WalletConnect protocol.
            </p>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800 mb-8">
          <div className="flex items-start">
            <Coins className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Important: Testnet Tokens Only
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                NoirCheck currently runs on XION testnet. The tokens you receive from the faucet have no real value 
                and are only for testing purposes. Never send real funds to testnet addresses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          ← Previous
        </button>

        <div className="flex space-x-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-3 h-3 rounded-full transition-colors ${
                step.id === currentStep
                  ? 'bg-blue-600'
                  : step.id < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === steps.length}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === steps.length
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Completion Message */}
      {currentStep === steps.length && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Setup Complete!
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                You're ready to connect your XION wallet to NoirCheck. Return to the wallet connection page to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
