/**
 * XION Test Page
 * Testing page for XION Abstraxion integration
 */

"use client";

import XIONTest from '@/components/test/XIONTest';

export default function XIONTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            XION Abstraxion Integration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the XION wallet integration with Meta Accounts
          </p>
        </div>
        
        <div className="flex justify-center">
          <XIONTest />
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            How it works:
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span>Click &quot;Connect XION Wallet&quot; to open the Abstraxion authentication modal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span>Choose your preferred login method (email, social, or wallet)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span>Complete the authentication flow to create or connect your Meta Account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <span>Your XION wallet address will be displayed when connected</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
