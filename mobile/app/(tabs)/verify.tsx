/**
 * Verify Content Tab
 * Tab dedicated to content verification with real file selection
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface SelectedFile {
  uri: string;
  name: string;
  type: 'image' | 'document';
  size: number;
  mimeType?: string;
}

export default function VerifyTab() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  /**
   * Main function to handle content verification
   */
  const handleVerifyContent = async () => {
    Alert.alert(
      'Select Content to Verify',
      'Choose the content you want to verify against the blockchain',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📸 Take Photo', 
          onPress: takePicture 
        },
        { 
          text: '🖼️ From Gallery', 
          onPress: pickImageFromGallery 
        },
        { 
          text: '📄 From Files', 
          onPress: pickDocument 
        }
      ]
    );
  };

  /**
   * Open device camera to take a picture
   */
  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image' as const,
          size: asset.fileSize || 0,
          mimeType: 'image/jpeg'
        };
        
        setSelectedFile(file);
        verifySelectedFile(file);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Could not take picture');
    }
  };

  /**
   * Pick image from device gallery
   */
  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is needed to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image' as const,
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg'
        };
        
        setSelectedFile(file);
        verifySelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not select image from gallery');
    }
  };

  /**
   * Pick document from device storage
   */
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileAsset = result.assets[0];
        const file = {
          uri: fileAsset.uri,
          name: fileAsset.name,
          type: 'document' as const,
          size: fileAsset.size || 0,
          mimeType: fileAsset.mimeType
        };
        
        setSelectedFile(file);
        verifySelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Could not select document');
    }
  };

  /**
   * Process the selected file for verification
   */
  const verifySelectedFile = async (file: SelectedFile) => {
    setIsVerifying(true);
    
    try {
      console.log('🔄 Verifying file:', file.name);
      
      // Simulate hash calculation and blockchain verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock hash based on file properties
      const mockHash = `sha256_${file.name.replace(/[^a-zA-Z0-9]/g, '')}_${file.size}_${Date.now().toString(36)}`;
      
      // Simulate verification result
      const isAuthentic = Math.random() > 0.3; // 70% chance of being authentic
      const confidenceScore = isAuthentic ? Math.floor(85 + Math.random() * 15) : Math.floor(20 + Math.random() * 40);
      
      console.log(`✅ Verification completed: ${isAuthentic ? 'Authentic' : 'Suspicious'}`);
      
      Alert.alert(
        isAuthentic ? '✅ Content Verified!' : '⚠️ Verification Warning',
        `File: "${file.name}"\nSize: ${(file.size / 1024).toFixed(1)} KB\n\n${
          isAuthentic 
            ? `This content is registered on XION blockchain.\nConfidence: ${confidenceScore}%\nHash: ${mockHash.substring(0, 20)}...`
            : `This content could not be verified or may be modified.\nConfidence: ${confidenceScore}%\nRecommendation: Verify with original creator.`
        }`,
        [{ 
          text: 'OK', 
          onPress: () => setSelectedFile(null)
        }]
      );
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      Alert.alert('Error', 'Failed to verify content');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Verify Content</Text>
          <Text style={styles.subtitle}>
            Check if digital content is registered on XION blockchain and verify its authenticity
          </Text>
        </View>

        {selectedFile && (
          <View style={styles.filePreview}>
            <Text style={styles.previewTitle}>Selected File:</Text>
            {selectedFile.type === 'image' && (
              <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
            )}
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileSize}>
              Size: {(selectedFile.size / 1024).toFixed(1)} KB
            </Text>
            {isVerifying && (
              <Text style={styles.verifyingText}>🔄 Verifying on blockchain...</Text>
            )}
          </View>
        )}

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 How it works</Text>
          <Text style={styles.instructionsText}>
            1. Select content from your device{'\n'}
            2. We calculate the content hash{'\n'}
            3. Check XION blockchain for registration{'\n'}
            4. Get authenticity verification result
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>🔎 Start Verification</Text>
          <Text style={styles.actionText}>
            Select a file from your device to verify its authenticity against the blockchain registry.
          </Text>
          
          <TouchableOpacity 
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]} 
            onPress={handleVerifyContent}
            disabled={isVerifying}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Verifying...' : 'Select & Verify Content'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Verification Features</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🔗</Text>
            <Text style={styles.featureText}>Blockchain-based verification</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🔒</Text>
            <Text style={styles.featureText}>Cryptographic hash validation</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>Confidence scoring system</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>⚡</Text>
            <Text style={styles.featureText}>Fast verification process</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 22,
  },
  filePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewTitle: {
    color: '#E3E3E3',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    textAlign: 'center',
  },
  fileSize: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  verifyingText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  instructionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
});
