import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { cameraService, CameraResult } from '../../src/services/CameraService';
import { xionService } from '../../src/services/XionService';

export default function VerifyScreen() {
  const [selectedFile, setSelectedFile] = useState<CameraResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleSelectFile = () => {
    cameraService.showSelectionOptions(
      () => handleCapturePhoto(),
      () => handlePickFromGallery()
    );
  };

  const handleCapturePhoto = async () => {
    const result = await cameraService.capturePhoto({
      includeBase64: true,
      quality: 0.8,
    });
    
    if (result) {
      setSelectedFile(result);
      setVerificationResult(null);
    }
  };

  const handlePickFromGallery = async () => {
    const results = await cameraService.pickFromGallery({
      allowsMultipleSelection: false,
      includeBase64: true,
      quality: 0.8,
    });
    
    if (results && results.length > 0) {
      setSelectedFile(results[0]);
      setVerificationResult(null);
    }
  };

  const handleVerifyContent = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Selecciona un archivo primero');
      return;
    }

    try {
      setIsVerifying(true);

      // Leer archivo para verificación
      let fileData: string;
      if (selectedFile.base64) {
        fileData = selectedFile.base64;
      } else {
        fileData = selectedFile.uri;
      }

      // Verificar en blockchain
      const result = await xionService.verifyContent(fileData);

      if (result) {
        setVerificationResult({
          success: true,
          ...result,
          verifiedAt: new Date().toISOString(),
        });

        if (result.isOriginal) {
          Alert.alert(
            '✅ Contenido Auténtico',
            `Este contenido es original y está registrado en blockchain.\n\nConfianza: ${Math.round(result.confidence * 100)}%`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '⚠️ Contenido No Original',
            `Este contenido no está registrado como original o ha sido modificado.\n\nConfianza: ${Math.round(result.confidence * 100)}%`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('No se pudo verificar el contenido');
      }
    } catch (error) {
      console.error('Error verifying content:', error);
      Alert.alert(
        'Error de Verificación',
        'No se pudo verificar el contenido. Inténtalo de nuevo.'
      );
      setVerificationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setVerificationResult(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#16a34a';
    if (confidence >= 0.5) return '#d97706';
    return '#dc2626';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.5) return 'Media';
    return 'Baja';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verificar Contenido</Text>
        <Text style={styles.headerSubtitle}>
          Comprueba la autenticidad de cualquier archivo
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Seleccionar Archivo</Text>
          
          {!selectedFile ? (
            <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
              <Text style={styles.selectIcon}>🔍</Text>
              <Text style={styles.selectTitle}>Seleccionar Archivo</Text>
              <Text style={styles.selectSubtitle}>
                Toca para elegir el archivo a verificar
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.fileCard}>
              <View style={styles.filePreview}>
                {selectedFile.type === 'image' ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.fileIcon}>{getFileIcon(selectedFile.mimeType)}</Text>
                )}
              </View>
              
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{selectedFile.fileName}</Text>
                <Text style={styles.fileDetails}>
                  {cameraService.formatFileSize(selectedFile.fileSize)} • {selectedFile.mimeType}
                </Text>
                <Text style={styles.fileType}>
                  {selectedFile.type === 'image' ? 'Imagen' : 'Video'}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Verification Button */}
        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Verificar Autenticidad</Text>
            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={handleVerifyContent}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <View style={styles.verifyButtonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.verifyButtonText}>Verificando...</Text>
                </View>
              ) : (
                <View style={styles.verifyButtonContent}>
                  <Text style={styles.verifyIcon}>🔍</Text>
                  <Text style={styles.verifyButtonText}>Verificar Contenido</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Verification Result */}
        {verificationResult && verificationResult.success && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultado de Verificación</Text>
            
            {/* Main Result */}
            <View style={[
              styles.resultCard,
              verificationResult.isOriginal ? styles.resultOriginal : styles.resultNotOriginal
            ]}>
              <Text style={styles.resultIcon}>
                {verificationResult.isOriginal ? '✅' : '⚠️'}
              </Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>
                  {verificationResult.isOriginal ? 'Contenido Auténtico' : 'Contenido No Original'}
                </Text>
                <Text style={styles.resultSubtitle}>
                  {verificationResult.isOriginal 
                    ? 'Este archivo está registrado como original'
                    : 'Este archivo no está registrado o ha sido modificado'
                  }
                </Text>
              </View>
            </View>

            {/* Confidence Level */}
            <View style={styles.confidenceCard}>
              <Text style={styles.confidenceLabel}>Nivel de Confianza</Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill,
                    { 
                      width: `${verificationResult.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(verificationResult.confidence)
                    }
                  ]} 
                />
              </View>
              <View style={styles.confidenceInfo}>
                <Text style={[
                  styles.confidenceValue,
                  { color: getConfidenceColor(verificationResult.confidence) }
                ]}>
                  {Math.round(verificationResult.confidence * 100)}%
                </Text>
                <Text style={[
                  styles.confidenceText,
                  { color: getConfidenceColor(verificationResult.confidence) }
                ]}>
                  {getConfidenceText(verificationResult.confidence)}
                </Text>
              </View>
            </View>

            {/* Details */}
            {verificationResult.originalOwner && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Detalles del Registro</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Propietario Original:</Text>
                  <Text style={styles.detailValue}>
                    {verificationResult.originalOwner.substring(0, 16)}...
                  </Text>
                </View>
                
                {verificationResult.registrationDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha de Registro:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(verificationResult.registrationDate).toLocaleString()}
                    </Text>
                  </View>
                )}
                
                {verificationResult.blockchainProof && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Prueba Blockchain:</Text>
                    <Text style={styles.detailValue}>
                      {verificationResult.blockchainProof.substring(0, 16)}...
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Verificado:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(verificationResult.verifiedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Modifications */}
            {verificationResult.modifications && verificationResult.modifications.length > 0 && (
              <View style={styles.modificationsCard}>
                <Text style={styles.modificationsTitle}>Modificaciones Detectadas</Text>
                {verificationResult.modifications.map((mod: string, index: number) => (
                  <Text key={index} style={styles.modificationItem}>
                    • {mod}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Error Result */}
        {verificationResult && !verificationResult.success && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Error de Verificación</Text>
            <View style={styles.errorCard}>
              <Text style={styles.resultIcon}>❌</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>Error en la Verificación</Text>
                <Text style={styles.resultSubtitle}>
                  {verificationResult.error}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Cómo Funciona</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Se calcula un hash único del archivo seleccionado
            </Text>
            <Text style={styles.infoText}>
              • Se busca el hash en registros blockchain
            </Text>
            <Text style={styles.infoText}>
              • Se analiza la integridad y autenticidad
            </Text>
            <Text style={styles.infoText}>
              • Se proporciona un nivel de confianza del resultado
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  selectIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  selectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  fileType: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultOriginal: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  resultNotOriginal: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706',
    borderWidth: 1,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  confidenceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  modificationsCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderColor: '#dc2626',
    borderWidth: 1,
    marginBottom: 16,
  },
  modificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  modificationItem: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
    lineHeight: 20,
  },
});
