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

export default function RegisterScreen() {
  const [selectedFile, setSelectedFile] = useState<CameraResult | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

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
      setRegistrationResult(null);
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
      setRegistrationResult(null);
    }
  };

  const handleRegisterContent = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Selecciona un archivo primero');
      return;
    }

    try {
      setIsRegistering(true);

      // Verificar conexión de wallet
      let wallet = xionService.getWallet();
      if (!wallet) {
        wallet = await xionService.connectWallet();
        if (!wallet) {
          Alert.alert('Error', 'No se pudo conectar la wallet');
          return;
        }
      }

      // Leer archivo para registro
      let fileData: string;
      if (selectedFile.base64) {
        fileData = selectedFile.base64;
      } else {
        // Si no hay base64, usar la URI como identificador
        fileData = selectedFile.uri;
      }

      // Registrar en blockchain
      const transaction = await xionService.registerContent(fileData, {
        filename: selectedFile.fileName,
        size: selectedFile.fileSize,
        mimeType: selectedFile.mimeType,
      });

      if (transaction) {
        setRegistrationResult({
          success: true,
          txId: transaction.txId,
          hash: transaction.hash,
          timestamp: transaction.timestamp,
        });

        Alert.alert(
          'Registro Exitoso',
          `Tu contenido ha sido registrado en blockchain.\n\nTX ID: ${transaction.txId.substring(0, 16)}...`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No se pudo registrar el contenido');
      }
    } catch (error) {
      console.error('Error registering content:', error);
      Alert.alert(
        'Error de Registro',
        'No se pudo registrar el contenido. Inténtalo de nuevo.'
      );
      setRegistrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setRegistrationResult(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Contenido</Text>
        <Text style={styles.headerSubtitle}>
          Protege tu contenido original en blockchain
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Seleccionar Archivo</Text>
          
          {!selectedFile ? (
            <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
              <Text style={styles.selectIcon}>📁</Text>
              <Text style={styles.selectTitle}>Seleccionar Archivo</Text>
              <Text style={styles.selectSubtitle}>
                Toca para elegir desde cámara o galería
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

        {/* Wallet Info */}
        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Información de Wallet</Text>
            <View style={styles.walletCard}>
              <Text style={styles.walletIcon}>🔐</Text>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Tu Wallet XION</Text>
                <Text style={styles.walletAddress}>
                  {xionService.getWallet()?.address || 'No conectada'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Registration Button */}
        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Registrar en Blockchain</Text>
            <TouchableOpacity
              style={[styles.registerButton, isRegistering && styles.registerButtonDisabled]}
              onPress={handleRegisterContent}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <View style={styles.registerButtonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.registerButtonText}>Registrando...</Text>
                </View>
              ) : (
                <View style={styles.registerButtonContent}>
                  <Text style={styles.registerIcon}>🛡️</Text>
                  <Text style={styles.registerButtonText}>Registrar Contenido</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Registration Result */}
        {registrationResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultado</Text>
            <View style={[
              styles.resultCard,
              registrationResult.success ? styles.resultSuccess : styles.resultError
            ]}>
              <Text style={styles.resultIcon}>
                {registrationResult.success ? '✅' : '❌'}
              </Text>
              <View style={styles.resultInfo}>
                {registrationResult.success ? (
                  <>
                    <Text style={styles.resultTitle}>¡Registro Exitoso!</Text>
                    <Text style={styles.resultDetails}>
                      TX ID: {registrationResult.txId}
                    </Text>
                    <Text style={styles.resultDetails}>
                      Hash: {registrationResult.hash.substring(0, 16)}...
                    </Text>
                    <Text style={styles.resultDetails}>
                      Fecha: {new Date(registrationResult.timestamp).toLocaleString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.resultTitle}>Error en Registro</Text>
                    <Text style={styles.resultDetails}>
                      {registrationResult.error}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Tu contenido será registrado de forma segura en blockchain
            </Text>
            <Text style={styles.infoText}>
              • Se generará un hash único para identificar tu contenido
            </Text>
            <Text style={styles.infoText}>
              • La prueba de autoría quedará registrada permanentemente
            </Text>
            <Text style={styles.infoText}>
              • Podrás verificar la autenticidad en cualquier momento
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
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  walletIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 12,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  registerButtonText: {
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
  },
  resultSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  resultError: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
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
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: 'monospace',
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
