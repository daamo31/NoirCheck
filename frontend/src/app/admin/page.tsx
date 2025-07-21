/**
 * NoirCheck - Admin Panel
 * Manage test users for development and testing
 */

'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Trash2, RefreshCw, AlertCircle, UserPlus, X } from 'lucide-react';
import Link from 'next/link';

// Import API service for user management
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface TestUser {
  id: string;
  address: string;
  username?: string;
  email?: string;
  registeredAt: string;
  lastActivity: string;
  totalRegistrations: number;
  totalVerifications: number;
  isActive: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    username: '',
    email: ''
  });

  // Get clearUserData from auth context
  const { clearUserData } = useAuth();

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/users/test/list');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear usuario
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/users/test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ address: '', username: '', email: '' });
        setShowCreateForm(false);
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error conectando con el backend');
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/users/test/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error conectando con el backend');
    }
  };

  // Eliminar usuario específico de XION
  const deleteXionUser = async () => {
    const address = 'xion18272dvf4kh3w4yt9ruwhddypddrfp70raf5jlwpud6s20vslt2cqtl090q';
    
    if (!confirm(`¿Eliminar usuario con dirección ${address}?`)) {
      return;
    }

    try {
      const success = await apiService.deleteUser(address);
      
      if (success) {
        alert('Usuario XION eliminado exitosamente');
        loadUsers();
      } else {
        alert('Error eliminando usuario XION');
      }
    } catch (error) {
      console.error('Error deleting XION user:', error);
      alert('Error conectando con el backend');
    }
  };

  // Limpiar todos los usuarios
  const clearAllUsers = async () => {
    if (!confirm('¿ELIMINAR TODOS LOS USUARIOS? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!confirm('¿Estás SEGURO? Se eliminarán TODOS los usuarios.')) {
      return;
    }

    try {
      const success = await apiService.clearAllUsers();
      
      if (success) {
        alert('Todos los usuarios han sido eliminados');
        loadUsers();
      } else {
        alert('Error eliminando usuarios');
      }
    } catch (error) {
      console.error('Error clearing users:', error);
      alert('Error conectando con el backend');
    }
  };

  // Limpiar completamente el localStorage y estado de XION
  const clearCompletelyAndReload = () => {
    if (!confirm('¿LIMPIAR COMPLETAMENTE TODO? Esto eliminará todos los datos locales y recargará la página.')) {
      return;
    }

    try {
      // Use auth context to clear user data properly
      clearUserData();
      
      // Additional cleanup
      sessionStorage.clear();
      
      // Limpiar cookies específicas de XION si existen
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('🧹 Estado completamente limpiado');
      
      // Recargar la página para estado limpio
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error clearing state:', error);
      alert('Error limpiando estado');
    }
  };

  // Generar dirección XION aleatoria
  const generateRandomAddress = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let address = 'xion1';
    for (let i = 0; i < 38; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, address }));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                NoirCheck Admin
              </h1>
              <span className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full border border-red-600/30">
                Panel de Testing
              </span>
            </div>
            
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Usuarios de Testing</h2>
          
          <div className="flex space-x-4">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Usuario</span>
            </button>

            <button
              onClick={deleteXionUser}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Eliminar XION</span>
            </button>

            <button
              onClick={clearAllUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Todos</span>
            </button>

            <button
              onClick={clearCompletelyAndReload}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Completo</span>
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Crear Usuario de Testing</h3>
            
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Dirección XION
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      placeholder="xion1..."
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomAddress}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Generar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                    placeholder="Usuario Test"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                  placeholder="test@noircheck.com"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h3 className="text-lg font-semibold text-white">
              Usuarios Registrados ({users.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay usuarios registrados</p>
              <p className="text-gray-500 text-sm">Crea tu primer usuario de testing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Registros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Verificaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Última Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.username || 'Sin nombre'}</p>
                            <p className="text-gray-400 text-sm">{user.email || 'Sin email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                          {user.address.slice(0, 12)}...{user.address.slice(-8)}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{user.totalRegistrations}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{user.totalVerifications}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(user.lastActivity).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Panel de Testing</p>
              <p className="text-yellow-300/80 text-sm mt-1">
                Este panel es solo para testing. Los usuarios creados aquí pueden conectarse 
                con sus direcciones XION reales en la aplicación de producción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
