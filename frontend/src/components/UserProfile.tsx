/**
 * User Profile Component
 * 
 * Allows users to view and edit their profile information including
 * username, email, and other preferences.
 */

'use client';

import { useState } from 'react';
import { User, Mail, Wallet, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType } from '@/services/api';

interface UserProfileProps {
  user: UserType | null;
  onUpdateSuccess: () => void;
}

export function UserProfile({ user, onUpdateSuccess }: UserProfileProps) {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile({
        username: formData.username,
        email: formData.email
      });
      
      setIsEditing(false);
      onUpdateSuccess();
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError(null);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar la información del usuario
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.username || `Usuario ${user.address.slice(-8)}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Miembro desde {new Date(user.registeredAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 mr-2" />
              Nombre de Usuario
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ingresa tu nombre de usuario"
              />
            ) : (
              <p className="py-2 text-gray-900 dark:text-white">
                {user.username || 'No configurado'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 mr-2" />
              Correo Electrónico
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ingresa tu correo electrónico"
              />
            ) : (
              <p className="py-2 text-gray-900 dark:text-white">
                {user.email || 'No configurado'}
              </p>
            )}
          </div>

          {/* Wallet Address (Read-only) */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wallet className="w-4 h-4 mr-2" />
              Dirección de Wallet
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {user.address}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Esta dirección no se puede modificar
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <User className="w-4 h-4 mr-2" />
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Account Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Estadísticas de Cuenta
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {user.totalRegistrations}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Contenidos Registrados
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {user.totalVerifications}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verificaciones Realizadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
