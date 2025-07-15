/**
 * User Dashboard Component
 * 
 * Main dashboard for authenticated users. Provides access to all NoirCheck
 * features including content registration, verification, history, and profile management.
 * 
 * Features:
 * - Content registration and verification
 * - User activity history
 * - Statistics and analytics
 * - Profile management
 * - Real-time stats updates
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  FileUp, 
  Search, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  TrendingUp,
  FileCheck,
  Calendar,
  Activity,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload } from './FileUpload';
import { UserProfile } from './UserProfile';
import { UserHistory } from './UserHistory';
import { UserStats } from './UserStats';
import { WalletInfo } from './WalletInfo';
import { apiService, UserStats as UserStatsData } from '@/services/api';

// Available dashboard tabs
type DashboardTab = 'register' | 'verify' | 'history' | 'profile' | 'stats' | 'wallet';

export function UserDashboard() {
  // Authentication and user context
  const { user, logout, refreshUser } = useAuth();
  
  // Component state
  const [activeTab, setActiveTab] = useState<DashboardTab>('register');
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load user statistics on component mount and user change
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return;
      
      // Set loading state while fetching stats
      setIsLoadingStats(true);
      try {
        // Fetch user statistics from API
        const stats = await apiService.getUserStats(user.id);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Load stats when user is available
    if (user) {
      loadUserStats();
    }
  }, [user?.id]);

  /**
   * Refresh user statistics manually
   * Used when user performs actions that might change stats
   */
  const refreshUserStats = async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const stats = await apiService.getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Handle user logout
   * Clears authentication state and redirects to login
   */
  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force reload as fallback
      window.location.href = '/';
    }
  };

  // Dashboard navigation tabs configuration
  const tabs = [
    {
      id: 'register' as DashboardTab,
      label: 'Register Content',
      icon: <FileUp className="w-5 h-5" />,
      description: 'Register your original content'
    },
    {
      id: 'verify' as DashboardTab,
      label: 'Verify Content',
      icon: <Search className="w-5 h-5" />,
      description: 'Verify content authenticity'
    },
    {
      id: 'history' as DashboardTab,
      label: 'History',
      icon: <History className="w-5 h-5" />,
      description: 'Your recent activity'
    },
    {
      id: 'stats' as DashboardTab,
      label: 'Statistics',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Metrics and analytics'
    },
    {
      id: 'wallet' as DashboardTab,
      label: 'Wallet & XION',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Wallet and blockchain info'
    },
    {
      id: 'profile' as DashboardTab,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Account settings'
    }
  ];

  // Quick statistics cards configuration
  const quickStats = [
    {
      label: 'Registered Content',
      value: userStats?.totalRegistrations || 0,
      icon: <FileCheck className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      label: 'Verifications',
      value: userStats?.totalVerifications || 0,
      icon: <Shield className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      label: 'Recent Activity',
      value: userStats?.recentActivity?.length || 0,
      icon: <Activity className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      label: 'Member since',
      value: user ? new Date(user.registeredAt).getFullYear() : new Date().getFullYear(),
      icon: <Calendar className="w-6 h-6 text-indigo-500" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Application Title */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  NoirCheck
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            </div>

            {/* User Information and Actions */}
            <div className="flex items-center space-x-4">
              {/* User Info Display */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || (user?.address ? `User ${user.address.slice(-8)}` : 'Cargando usuario...')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-8)}` : 'Conectando...'}
                </p>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        {user && (
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.username || 'Usuario Demo'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                    {user.address}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">
                    Registrado: {new Date(user.registeredAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex space-x-4 mb-2">
                  <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Registros: {user.totalRegistrations}
                    </p>
                  </div>
                  <div className="bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Verificaciones: {user.totalVerifications}
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-500 text-xs">
                  Última actividad: {new Date(user.lastActivity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Main Navigation and Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Dynamic Tab Content */}
          <div className="p-6">
            {/* Content Registration Tab */}
            {activeTab === 'register' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Register Original Content
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Register your original content on blockchain to protect your intellectual property
                  </p>
                </div>
                <FileUpload mode="register" onOperationComplete={refreshUserStats} />
              </div>
            )}

            {/* Content Verification Tab */}
            {activeTab === 'verify' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Verify Authenticity
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verify if content is original or has been modified
                  </p>
                </div>
                <FileUpload mode="verify" onOperationComplete={refreshUserStats} />
              </div>
            )}

            {/* Activity History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Activity History
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review all your previous verifications and registrations
                  </p>
                </div>
                <UserHistory userId={user?.id || ''} />
              </div>
            )}

            {/* Statistics and Analytics Tab */}
            {activeTab === 'stats' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Statistics and Metrics
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyze your activity and contribution to the platform
                  </p>
                </div>
                <UserStats 
                  userStats={userStats} 
                  isLoading={isLoadingStats}
                  onRefresh={refreshUserStats}
                />
              </div>
            )}

            {/* Wallet Information Tab */}
            {activeTab === 'wallet' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Wallet & XION Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    View your wallet details, XION connection status, and account management
                  </p>
                </div>
                <WalletInfo />
              </div>
            )}

            {/* User Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your personal information and preferences
                  </p>
                </div>
                <UserProfile 
                  user={user} 
                  onUpdateSuccess={refreshUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
