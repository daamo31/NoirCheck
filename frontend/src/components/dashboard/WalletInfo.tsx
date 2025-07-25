/**
 * Wallet Information Component
 * 
 * Displays wallet and user account information including:
 * - Wallet address and type
 * - XION connection status
 * - User registration details
 * - Account statistics
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Shield, 
  User,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserStorageService } from '@/services/userStorageService';

export function WalletInfo() {
  const { user } = useAuth();
  const [storageUser, setStorageUser] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Load full user data from UserStorageService
  useEffect(() => {
    if (user?.email) {
      const fullUser = UserStorageService.findUserByEmail(user.email);
      setStorageUser(fullUser);
      console.log('📱 WalletInfo - Full user data:', fullUser);
    }
  }, [user?.email]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No user information available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
            <p className="text-gray-900 dark:text-white font-medium">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || 'Not set'
              }
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="text-gray-900 dark:text-white font-medium">
              {user.email || 'Not set'}
            </p>
          </div>

          {/* Registration Date */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered</label>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatDate(user.registeredAt)}
            </p>
          </div>

          {/* Last Activity */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activity</label>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatDate(user.lastActivity)}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Wallet className="w-6 h-6 text-green-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wallet Information
          </h3>
        </div>

        {/* Wallet Address */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
            Wallet Address
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-mono break-all">
              {user.address}
            </code>
            <button
              onClick={() => copyToClipboard(user.address, 'address')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copySuccess === 'address' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Registration Method */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
            Registration Method
          </label>
          <div className="flex items-center space-x-2">
            {storageUser?.registrationMethod === 'xion' && (
              <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <Shield className="w-4 h-4 mr-1" />
                XION Wallet
              </div>
            )}
            {storageUser?.registrationMethod === 'metamask' && (
              <div className="flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                <Wallet className="w-4 h-4 mr-1" />
                MetaMask
              </div>
            )}
            {storageUser?.registrationMethod === 'create' && (
              <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                <User className="w-4 h-4 mr-1" />
                Account Creation
              </div>
            )}
            {!storageUser?.registrationMethod && (
              <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                <Info className="w-4 h-4 mr-1" />
                Unknown
              </div>
            )}
          </div>
        </div>

        {/* XION Wallet Details */}
        {storageUser?.xionWallet && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">XION Wallet Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Address: </span>
                <code className="text-blue-800 dark:text-blue-200">{storageUser.xionWallet.address}</code>
              </div>
              {storageUser.xionWallet.publicKey && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Public Key: </span>
                  <code className="text-blue-800 dark:text-blue-200 break-all">
                    {storageUser.xionWallet.publicKey.slice(0, 20)}...
                  </code>
                </div>
              )}
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Created: </span>
                <span className="text-blue-800 dark:text-blue-200">
                  {formatDate(storageUser.xionWallet.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MetaMask Wallet Details */}
        {storageUser?.metaMaskWallet && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">MetaMask Wallet Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-orange-700 dark:text-orange-300 font-medium">Address: </span>
                <code className="text-orange-800 dark:text-orange-200">{storageUser.metaMaskWallet.address}</code>
              </div>
              <div>
                <span className="text-orange-700 dark:text-orange-300 font-medium">Connected: </span>
                <span className="text-orange-800 dark:text-orange-200">
                  {formatDate(storageUser.metaMaskWallet.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Activity className="w-6 h-6 text-purple-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Statistics
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {user.totalRegistrations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Registrations
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {user.totalVerifications}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Verifications
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {storageUser?.id ? 1 : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Session
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.floor((Date.now() - new Date(user.registeredAt).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Days Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
