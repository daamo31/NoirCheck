/**
 * NoirCheck - Mobile Support Information
 * Explains wallet support for mobile devices
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Smartphone, 
  Wallet, 
  CheckCircle, 
  ExternalLink, 
  Download,
  QrCode,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function MobileSupportPage() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'unknown'>('unknown');

  // Detect device type
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        setDeviceType('ios');
      } else if (/Android/.test(userAgent)) {
        setDeviceType('android');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la App
          </Link>
          
          <div className="text-center">
            <div className="bg-blue-600 p-3 rounded-2xl w-fit mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Soporte Móvil
            </h1>
            <p className="text-xl text-gray-300">
              NoirCheck funciona perfectamente en dispositivos móviles
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Device Detection */}
          {deviceType !== 'unknown' && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-green-300">
                  {deviceType === 'ios' ? 'iOS Device Detected' : 'Android Device Detected'}
                </h2>
              </div>
              <p className="text-green-200">
                {deviceType === 'ios' && 'Tu iPhone/iPad es totalmente compatible con NoirCheck y todas las wallets soportadas.'}
                {deviceType === 'android' && 'Tu dispositivo Android es totalmente compatible con NoirCheck y todas las wallets soportadas.'}
              </p>
            </div>
          )}

          {/* Wallet Support */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Soporte de Wallets Móviles
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* XION Wallet */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">XION Wallet</h3>
                    <p className="text-purple-300 text-sm">Nativo • Sin gas • Seguro</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">iOS App Store disponible</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Google Play disponible</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Deep linking integrado</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Auto-creación disponible</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {deviceType === 'ios' && (
                    <a 
                      href="https://apps.apple.com/app/xion-wallet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar en App Store
                    </a>
                  )}
                  {deviceType === 'android' && (
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.xion.wallet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar en Google Play
                    </a>
                  )}
                  {deviceType === 'unknown' && (
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href="https://apps.apple.com/app/xion-wallet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 rounded-lg transition-colors text-sm"
                      >
                        iOS
                      </a>
                      <a 
                        href="https://play.google.com/store/apps/details?id=com.xion.wallet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 rounded-lg transition-colors text-sm"
                      >
                        Android
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* MetaMask */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mr-4">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">MetaMask</h3>
                    <p className="text-orange-300 text-sm">Ethereum • Ampliamente adoptado</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">iOS App Store</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Google Play</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Browser integrado</span>
                  </div>
                  <div className="flex items-center text-blue-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="text-sm">+ XION auto-creado</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {deviceType === 'ios' && (
                    <a 
                      href="https://apps.apple.com/app/metamask/id1438144202" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar en App Store
                    </a>
                  )}
                  {deviceType === 'android' && (
                    <a 
                      href="https://play.google.com/store/apps/details?id=io.metamask" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar en Google Play
                    </a>
                  )}
                  {deviceType === 'unknown' && (
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href="https://apps.apple.com/app/metamask/id1438144202" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white py-2 px-2 rounded-lg transition-colors text-sm"
                      >
                        iOS
                      </a>
                      <a 
                        href="https://play.google.com/store/apps/details?id=io.metamask" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white py-2 px-2 rounded-lg transition-colors text-sm"
                      >
                        Android
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* How it Works */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              ¿Cómo funciona en móviles?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 text-center">
                <QrCode className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">1. Deep Linking</h3>
                <p className="text-gray-400 text-sm">
                  La app se conecta automáticamente a tu wallet móvil usando deep links seguros
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 text-center">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">2. Autenticación</h3>
                <p className="text-gray-400 text-sm">
                  Tu wallet móvil maneja toda la criptografía y seguridad automáticamente
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">3. Experiencia</h3>
                <p className="text-gray-400 text-sm">
                  Regreso sin problemas a NoirCheck con tu identidad verificada
                </p>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Recomendaciones para Móviles</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-blue-200 text-sm">
                      <strong>Para principiantes:</strong> Usa la opción "Auto-crear XION Wallet" - No necesitas instalar nada adicional
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-blue-200 text-sm">
                      <strong>Si ya tienes MetaMask:</strong> Funciona perfectamente en móvil, además creamos un XION wallet automáticamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-blue-200 text-sm">
                      <strong>Para usuarios avanzados:</strong> XION wallet nativa ofrece gasless transactions y mejor UX
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Note */}
          <section>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-yellow-300 font-medium mb-2">Nota de Seguridad</h3>
                  <p className="text-yellow-200 text-sm">
                    Solo descarga wallets desde las tiendas oficiales (App Store / Google Play). 
                    NoirCheck nunca te pedirá tu frase semilla o claves privadas. 
                    Toda la criptografía se maneja de forma segura en tu dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Probar NoirCheck Móvil
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 NoirCheck - Verificación de contenido digital en todos tus dispositivos
          </p>
        </div>
      </footer>
    </div>
  );
}
