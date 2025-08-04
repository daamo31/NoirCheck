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
import { useAuth } from '../../src/contexts/AuthContext';
import { cameraService, CameraResult, calculateFileHash } from '../../src/services/CameraService';
import { xionApiService } from '../../src/services/XionApiService';

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
      Alert.alert('Error', 'Select a file first');
      return;
    }

    try {
      setIsVerifying(true);

      // Calculate hash from file data
      let fileData: string;
      if (selectedFile.base64) {
        fileData = selectedFile.base64;
      } else {
        fileData = selectedFile.uri;
      }

      const contentHash = calculateFileHash(fileData);

      // Verify on blockchain
      const result = await xionApiService.verifyContent({
        contentHash: contentHash,
        sourceUrl: undefined
      });

      if (result) {
        setVerificationResult({
          success: true,
          ...result,
          verifiedAt: new Date().toISOString(),
        });

        if (result.isAuthentic) {
          Alert.alert(
            '✅ Authentic Content',
            `This content is original and registered on blockchain.\n\nConfidence: ${Math.round(result.confidence * 100)}%`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '⚠️ Content Not Original',
            `This content is not registered as original or has been modified.\n\nConfidence: ${Math.round(result.confidence * 100)}%`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('Could not verify content');
      }
    } catch (error) {
      console.error('Error verifying content:', error);
      Alert.alert(
        'Verification Error',
        'Could not verify content. Please try again.'
      );
      setVerificationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verify Content</Text>
        <Text style={styles.headerSubtitle}>
          Check the authenticity of any file
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select File</Text>
          
          {!selectedFile ? (
            <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
              <Text style={styles.selectIcon}>🔍</Text>
              <Text style={styles.selectTitle}>Select File</Text>
              <Text style={styles.selectSubtitle}>
                Tap to choose the file to verify
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
                  {selectedFile.type === 'image' ? 'Image' : 'Video'}
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
            <Text style={styles.sectionTitle}>2. Verify Authenticity</Text>
            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={handleVerifyContent}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <View style={styles.verifyButtonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.verifyButtonText}>Verifying...</Text>
                </View>
              ) : (
                <View style={styles.verifyButtonContent}>
                  <Text style={styles.verifyIcon}>🔍</Text>
                  <Text style={styles.verifyButtonText}>Verify Content</Text>
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
                  {verificationResult.isOriginal ? 'Authentic Content' : 'Content Not Original'}
                </Text>
                <Text style={styles.resultSubtitle}>
                  {verificationResult.isOriginal 
                    ? 'This file is registered as original'
                    : 'This file is not registered or has been modified'
                  }
                </Text>
              </View>
            </View>

            {/* Confidence Level */}
            <View style={styles.confidenceCard}>
              <Text style={styles.confidenceLabel}>Confidence Level</Text>
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
          <Text style={styles.sectionTitle}>ℹ️ How It Works</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • A unique hash is calculated from the selected file
            </Text>
            <Text style={styles.infoText}>
              • The hash is searched in blockchain records
            </Text>
            <Text style={styles.infoText}>
              • File integrity and authenticity are analyzed
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
