/**
 * Authentication Screen
 * 
 * Landing page for user authentication using XION's Meta Account technology.
 * Provides secure, gasless authentication with blockchain integration.
 */

'use client';

import { Shield, Zap, Lock, Users, FileCheck, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthScreen() {
  const { login, isLoading, error } = useAuth();

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Autenticación Segura",
      description: "Tecnología XION Meta Account con seguridad blockchain"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Sin Tarifas de Gas",
      description: "Transacciones gasless para una experiencia fluida"
    },
    {
      icon: <Lock className="w-8 h-8 text-green-500" />,
      title: "Privacidad Total",
      description: "Tus datos están protegidos con tecnología zkTLS"
    },
    {
      icon: <FileCheck className="w-8 h-8 text-purple-500" />,
      title: "Verificación Instantánea",
      description: "Verifica la autenticidad de cualquier contenido digital"
    },
    {
      icon: <History className="w-8 h-8 text-indigo-500" />,
      title: "Historial Completo",
      description: "Rastrea todas tus verificaciones y registros"
    },
    {
      icon: <Users className="w-8 h-8 text-pink-500" />,
      title: "Comunidad Global",
      description: "Únete a la lucha contra la desinformación"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Bienvenido a <span className="text-blue-400">NoirCheck</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              La plataforma definitiva para verificar la autenticidad del contenido digital
              usando blockchain y tecnología zkTLS
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-3">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Authentication Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Comienza tu Journey
            </h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Conecta tu wallet usando XION Meta Account para acceder a todas las funciones
              de NoirCheck de forma segura y sin complicaciones.
            </p>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={login}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Conectando...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-3" />
                  Conectar con XION
                </>
              )}
            </button>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                Al conectarte, aceptas nuestros{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  Términos de Servicio
                </a>{' '}
                y{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  Política de Privacidad
                </a>
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              ¿Cómo funciona NoirCheck?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Registra tu Contenido</h4>
                <p className="text-gray-400 text-sm">
                  Sube tu contenido original y regístralo en blockchain
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Verifica Autenticidad</h4>
                <p className="text-gray-400 text-sm">
                  Comprueba si cualquier contenido es original o manipulado
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Combate la Desinformación</h4>
                <p className="text-gray-400 text-sm">
                  Ayuda a crear un ecosistema digital más confiable
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
