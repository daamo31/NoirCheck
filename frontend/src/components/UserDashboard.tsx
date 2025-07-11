/**
 * User Dashboard
 * 
 * Main dashboard for authenticated users. Provides access to all NoirCheck
 * features including content registration, verification, history, and profile management.
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
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload } from './FileUpload';
import { UserProfile } from './UserProfile';
import { UserHistory } from './UserHistory';
import { UserStats } from './UserStats';
import { apiService, UserStats as UserStatsType } from '@/services/api';

type DashboardTab = 'register' | 'verify' | 'history' | 'profile' | 'stats';

export function UserDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('register');
  const [userStats, setUserStats] = useState<UserStatsType | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const loadUserStats = async () => {
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

    if (user) {
      loadUserStats();
    }
  }, [user?.id]);

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

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    {
      id: 'register' as DashboardTab,
      label: 'Registrar Contenido',
      icon: <FileUp className="w-5 h-5" />,
      description: 'Registra tu contenido original'
    },
    {
      id: 'verify' as DashboardTab,
      label: 'Verificar Contenido',
      icon: <Search className="w-5 h-5" />,
      description: 'Verifica la autenticidad'
    },
    {
      id: 'history' as DashboardTab,
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
      description: 'Tu actividad reciente'
    },
    {
      id: 'stats' as DashboardTab,
      label: 'Estadísticas',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Métricas y análisis'
    },
    {
      id: 'profile' as DashboardTab,
      label: 'Perfil',
      icon: <User className="w-5 h-5" />,
      description: 'Configuración de cuenta'
    }
  ];

  const quickStats = [
    {
      label: 'Contenido Registrado',
      value: userStats?.totalRegistrations || 0,
      icon: <FileCheck className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      label: 'Verificaciones',
      value: userStats?.totalVerifications || 0,
      icon: <Shield className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      label: 'Actividad Reciente',
      value: userStats?.recentActivity?.length || 0,
      icon: <Activity className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      label: 'Miembro desde',
      value: user ? new Date(user.registeredAt).getFullYear() : new Date().getFullYear(),
      icon: <Calendar className="w-6 h-6 text-indigo-500" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
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

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || `Usuario ${user?.address.slice(-8)}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.address.slice(0, 8)}...{user?.address.slice(-8)}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
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

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'register' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Registrar Contenido Original
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Registra tu contenido original en blockchain para proteger tu propiedad intelectual
                  </p>
                </div>
                <FileUpload mode="register" />
              </div>
            )}

            {activeTab === 'verify' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Verificar Autenticidad
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifica si el contenido es original o ha sido modificado
                  </p>
                </div>
                <FileUpload mode="verify" />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Historial de Actividad
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Revisa todas tus verificaciones y registros anteriores
                  </p>
                </div>
                <UserHistory userId={user?.id || ''} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Estadísticas y Métricas
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analiza tu actividad y contribución a la plataforma
                  </p>
                </div>
                <UserStats 
                  userStats={userStats} 
                  isLoading={isLoadingStats}
                  onRefresh={refreshUserStats}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Configuración de Perfil
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gestiona tu información personal y preferencias
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
