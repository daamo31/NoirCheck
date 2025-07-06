/**
 * NoirCheck - Página Principal
 * Plataforma de verificación de autenticidad de contenido digital
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
                  Verificación de autenticidad con XION blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de Conexión */}
        <div className="mb-8">
          <ConnectionStatus />
        </div>

        {/* Sección de Bienvenida */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🛡️ ¡Bienvenido a NoirCheck!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Tu plataforma de confianza para verificar la autenticidad del contenido digital. 
              Combate la desinformación con tecnología blockchain y zkTLS.
            </p>
          </div>
        </div>

        {/* Pestañas de Funciones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* Header de pestañas */}
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
                  <span>📤 Registrar Contenido</span>
                </div>
                <p className="text-sm mt-1 opacity-75">
                  Sube y autentica tu contenido original en blockchain
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
                  <span>🔍 Verificar Contenido</span>
                </div>
                <p className="text-sm mt-1 opacity-75">
                  Verifica la autenticidad de cualquier contenido
                </p>
              </button>
            </nav>
          </div>

          {/* Contenido de pestañas */}
          <div className="p-8">
            <FileUpload mode={activeTab} />
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Blockchain Seguro
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tu contenido se registra de forma inmutable en XION blockchain, 
              garantizando la integridad y autenticidad.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <FileCheck className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Verificación zkTLS
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tecnología zkTLS para verificar la autenticidad de fuentes web 
              sin comprometer la privacidad.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Análisis Inteligente
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Algoritmos avanzados detectan modificaciones y proporcionan 
              un nivel de confianza detallado.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 NoirCheck. Combatiendo la desinformación con tecnología blockchain.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
