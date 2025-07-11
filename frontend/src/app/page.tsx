/**
 * NoirCheck - Main Page
 * Digital content authenticity verification platform
 */

'use client';

import Link from 'next/link';
import { Shield, Blocks, Code, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              NoirCheck
            </h1>
            <p className="text-xl text-gray-300">
              Plataforma de verificación de autenticidad de contenido digital
            </p>
          </div>
          
          <Link 
            href="/admin"
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-lg transition-colors text-sm"
          >
            Panel Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Environment Selection */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Selecciona el Entorno
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Production Environment */}
              <Link href="/app" className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <Blocks className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Producción</h3>
                      <p className="text-sm text-blue-400">Con XION zkTLS</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Autenticación completa con XION blockchain y zkTLS para verificación de identidad segura.
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Zap className="w-4 h-4 mr-2" />
                    Transacciones sin gas • Seguridad máxima
                  </div>
                </div>
              </Link>

              {/* Development Environment */}
              <Link href="/dev" className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Desarrollo</h3>
                      <p className="text-sm text-green-400">Modo simulado</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Autenticación simulada para pruebas y desarrollo. Ideal para probar funcionalidades sin configuración blockchain.
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Code className="w-4 h-4 mr-2" />
                    Sin blockchain • Pruebas rápidas
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Características Principales
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Registro de Contenido</h3>
                <p className="text-gray-400">
                  Registra tu contenido original en blockchain para establecer prueba de autoría.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Blocks className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verificación Inmutable</h3>
                <p className="text-gray-400">
                  Verifica la autenticidad de cualquier contenido digital usando tecnología blockchain.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">zkTLS Seguro</h3>
                <p className="text-gray-400">
                  Integración con XION para autenticación segura y transacciones sin gas.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Cómo Probar con XION Real
            </h2>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Crear Usuario de Testing</h3>
                  <p className="text-gray-400 text-sm">
                    Ve al Panel Admin y crea un usuario con una dirección XION real o generada
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Conectar con XION</h3>
                  <p className="text-gray-400 text-sm">
                    Usa la aplicación de Producción para conectar con esa dirección XION
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Probar Funcionalidades</h3>
                  <p className="text-gray-400 text-sm">
                    Registra y verifica archivos reales usando blockchain de prueba
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 NoirCheck - Combatiendo la desinformación con tecnología blockchain
          </p>
        </div>
      </footer>
    </div>
  );
}

