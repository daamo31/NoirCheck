/**
 * NoirCheck - Environment Selection Page
 * Choose between different environments and tools
 */

'use client';

import Link from 'next/link';
import { Shield, Blocks, Code, Zap, Wallet, ArrowLeft } from 'lucide-react';

export default function EnvironmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              NoirCheck
            </h1>
            <p className="text-xl text-gray-300">
              Digital content authenticity verification platform
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Environment Selection */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Development Tools & Environments
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Main App */}
              <Link href="/" className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Main App</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Full NoirCheck platform with content verification and blockchain integration
                  </p>
                  <div className="text-blue-400 font-medium">Launch App →</div>
                </div>
              </Link>

              {/* XION Wallet */}
              <Link href="/wallet" className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">XION Wallet</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Connect and manage your XION wallet with gasless transactions
                  </p>
                  <div className="text-green-400 font-medium">Connect Wallet →</div>
                </div>
              </Link>

              {/* Development Environment */}
              <Link href="/dev" className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Development</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Simulated environment for testing and development
                  </p>
                  <div className="text-purple-400 font-medium">Enter Dev Mode →</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Main Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Content Verification</h3>
                <p className="text-gray-400 text-sm text-center">
                  Verify the authenticity of digital content using blockchain technology
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">zkTLS Integration</h3>
                <p className="text-gray-400 text-sm text-center">
                  Secure identity verification with zero-knowledge proofs
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <Blocks className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Blockchain Registry</h3>
                <p className="text-gray-400 text-sm text-center">
                  Immutable content registration on XION blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 NoirCheck - Fighting misinformation with blockchain technology
          </p>
        </div>
      </footer>
    </div>
  );
}
