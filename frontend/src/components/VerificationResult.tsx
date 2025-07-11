/**
 * Verification Result Component
 * 
 * Displays the results of content verification including authenticity status,
 * confidence levels, and detailed analysis information.
 */

'use client';

import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, Hash } from 'lucide-react';
import type { ContentVerification } from '@/types';

interface VerificationResultProps {
  result: ContentVerification;
}

export function VerificationResult({ result }: VerificationResultProps) {
  const getStatusIcon = () => {
    if (result.exists) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    } else {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (result.exists) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    } else {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getStatusText = () => {
    if (result.exists) {
      return {
        title: 'Contenido Auténtico',
        description: 'Este contenido ha sido registrado previamente en blockchain'
      };
    } else {
      return {
        title: 'Contenido No Verificado',
        description: 'Este contenido no se encuentra en nuestros registros'
      };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="space-y-6">
      {/* Main Status */}
      <div className={`p-6 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center space-x-4 mb-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {statusInfo.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusInfo.description}
            </p>
          </div>
        </div>

        {/* Hash Information */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hash del Contenido
            </span>
          </div>
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
            {result.hash}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      {result.exists && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Registration Info */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Información de Registro
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fecha de registro:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {result.registrationDate ? 
                    new Date(result.registrationDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'No disponible'
                  }
                </span>
              </div>
              {result.transactionHash && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Hash de transacción:</span>
                  <p className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {result.transactionHash}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Estado de Verificación
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Blockchain:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.blockchainVerified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {result.blockchainVerified ? 'Verificado' : 'Pendiente'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Confianza:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>

              {result.sourceVerified !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Fuente:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.sourceVerified 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {result.sourceVerified ? 'Verificada' : 'No verificada'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modifications Detected */}
      {result.modifications && result.modifications.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Modificaciones Detectadas
            </h4>
          </div>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {result.modifications.map((modification, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                <span>{modification}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Level Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nivel de Confianza
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.round(result.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              result.confidence >= 0.8 ? 'bg-green-500' :
              result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {result.confidence >= 0.8 ? 'Alto nivel de confianza' :
           result.confidence >= 0.6 ? 'Nivel de confianza medio' : 'Nivel de confianza bajo'}
        </p>
      </div>
    </div>
  );
}
