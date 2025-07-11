/**
 * User History Component
 * 
 * Displays the user's activity history including content registrations
 * and verifications with detailed information and filtering options.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Shield, 
  Calendar, 
  Filter, 
  Search,
  Download,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { apiService, UserActivity } from '@/services/api';

interface UserHistoryProps {
  userId: string;
}

type ActivityFilter = 'all' | 'registration' | 'verification';

export function UserHistory({ userId }: UserHistoryProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadActivity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const activityData = await apiService.getUserActivity(userId, 50);
        setActivities(activityData);
      } catch (error) {
        console.error('Error loading user activity:', error);
        setError('Error al cargar el historial de actividad');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadActivity();
    }
  }, [userId]);

  useEffect(() => {
    const filterActivities = () => {
      let filtered = activities;

      // Filter by type
      if (filter !== 'all') {
        filtered = filtered.filter(activity => activity.type === filter);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(activity =>
          activity.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.hash?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredActivities(filtered);
    };

    filterActivities();
  }, [activities, filter, searchTerm]);

  const refreshActivity = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activityData = await apiService.getUserActivity(userId, 50);
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading user activity:', error);
      setError('Error al cargar el historial de actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    if (type === 'registration') {
      return <FileCheck className={`w-5 h-5 ${status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`} />;
    } else {
      return <Shield className={`w-5 h-5 ${status === 'completed' ? 'text-blue-500' : 'text-yellow-500'}`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de usuario no válido
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de archivo o hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter and Refresh */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ActivityFilter)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas las actividades</option>
                <option value="registration">Solo registros</option>
                <option value="verification">Solo verificaciones</option>
              </select>
            </div>

            <button
              onClick={refreshActivity}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando historial...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {activities.length === 0 
                ? 'No hay actividad registrada aún' 
                : 'No se encontraron resultados con los filtros actuales'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Activity Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {activity.filename}
                        </h4>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="capitalize">
                            {activity.type === 'registration' ? 'Registro' : 'Verificación'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>

                        {activity.hash && (
                          <p className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                            {activity.hash.slice(0, 16)}...{activity.hash.slice(-16)}
                          </p>
                        )}
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === 'completed' ? 'Completado' :
                           activity.status === 'pending' ? 'Pendiente' :
                           activity.status === 'failed' ? 'Fallido' : activity.status}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              if (activity.hash) {
                                navigator.clipboard.writeText(activity.hash);
                              }
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Copiar hash"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              // Abrir detalles en modal o nueva página
                              console.log('Ver detalles:', activity.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Ver detalles"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Resumen de Actividad
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activities.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Actividades
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activities.filter(a => a.type === 'registration').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registros
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {activities.filter(a => a.type === 'verification').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verificaciones
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
