/**
 * NoirCheck - Dev User Dashboard
 * Dashboard for development mode with mock authentication
 */

'use client';

import { useState } from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { User, BarChart3, History, Settings, Upload, CheckCircle } from 'lucide-react';

export function DevUserDashboard() {
  const { user, logout } = useMockAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'upload', label: 'Subir Archivo', icon: Upload },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                NoirCheck <span className="text-red-400">[DEV]</span>
              </h1>
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-600/30">
                Modo Desarrollo
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-xl p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Panel de Control</h2>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Archivos Registrados</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verificaciones</p>
              <p className="text-3xl font-bold text-white">45</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasa de Éxito</p>
              <p className="text-3xl font-bold text-white">98%</p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-colors text-left">
            <Upload className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Registrar Nuevo Archivo</h4>
            <p className="text-sm text-blue-300/70">Sube y registra contenido original</p>
          </button>
          
          <button className="p-4 bg-green-600/20 border border-green-600/30 rounded-xl text-green-400 hover:bg-green-600/30 transition-colors text-left">
            <CheckCircle className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Verificar Contenido</h4>
            <p className="text-sm text-green-300/70">Verifica la autenticidad de un archivo</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Upload Tab
function UploadTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Subir Archivo</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-12 h-12 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Arrastra archivos aquí</h3>
          <p className="text-gray-400 mb-6">o haz clic para seleccionar archivos</p>
          
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            Seleccionar Archivos
          </button>
          
          <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Modo de desarrollo: Los archivos se simularán pero no se registrarán en blockchain real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// History Tab
function HistoryTab() {
  const mockHistory = [
    { id: 1, file: 'documento_importante.pdf', action: 'Registrado', date: '2024-01-15', status: 'success' },
    { id: 2, file: 'imagen_original.jpg', action: 'Verificado', date: '2024-01-14', status: 'success' },
    { id: 3, file: 'video_demo.mp4', action: 'Registrado', date: '2024-01-13', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Historial de Actividad</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Actividades Recientes</h3>
        </div>
        
        <div className="divide-y divide-gray-700/50">
          {mockHistory.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.file}</p>
                  <p className="text-gray-400 text-sm">{item.action} • {item.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                Exitoso
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab() {
  const { user } = useMockAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Perfil de Usuario</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{user?.username}</h3>
            <p className="text-gray-400">{user?.email}</p>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
              Usuario de Desarrollo
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={user?.username || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuración</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Desarrollo</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Modo de Desarrollo</p>
              <p className="text-gray-400 text-sm">Usar datos simulados en lugar de blockchain</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Logs Detallados</p>
              <p className="text-gray-400 text-sm">Mostrar información de debug en consola</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Mock API</p>
              <p className="text-gray-400 text-sm">Usar respuestas simuladas del backend</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
