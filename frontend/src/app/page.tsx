/**
 * NoirCheck - Main Page
 * Digital content authenticity verification platform
 */

'use client';

import { useState } from 'react';
import { Shield, Eye, FileCheck, Upload } from 'lucide-react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'verify'>('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  NoirCheck
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Authenticity verification with XION blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <div className="mb-8">
          <ConnectionStatus />
        </div>

        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🛡️ Welcome to NoirCheck!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Your trusted platform to verify the authenticity of digital content.
              Fight misinformation with blockchain and zkTLS technology.
            </p>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* Tabs Header */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'register'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>📤 Register Content</span>
                </div>
                <p className="text-sm mt-1 opacity-75">
                  Upload and authenticate your original content on blockchain
                </p>
              </button>
              
              <button
                onClick={() => setActiveTab('verify')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'verify'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>🔍 Verify Content</span>
                </div>
                <p className="text-sm mt-1 opacity-75">
                  Verify the authenticity of any content
                </p>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <FileUpload mode={activeTab} />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Secure Blockchain
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your content is immutably registered on XION blockchain,
              guaranteeing integrity and authenticity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <FileCheck className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                zkTLS Verification
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              zkTLS technology to verify the authenticity of web sources
              without compromising privacy.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Smart Analysis
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Advanced algorithms detect modifications and provide
              a detailed confidence level.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 NoirCheck. Fighting misinformation with blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}