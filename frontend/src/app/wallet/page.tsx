/**
 * XION Wallet Page
 * 
 * Dedicated page for XION wallet connection and management
 * Uses official Abstraxion library for seamless integration
 */

import XIONTestComponent from '@/components/test/XIONTestComponent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              XION Wallet
            </h1>
            <p className="text-xl text-gray-300">
              Connect and manage your XION wallet with gasless transactions
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <XIONTestComponent />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 NoirCheck. Powered by XION blockchain technology.</p>
        </div>
      </footer>
    </div>
  );
}
