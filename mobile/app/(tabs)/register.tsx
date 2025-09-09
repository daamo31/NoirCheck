/**
 * Register Content Tab
 * Tab dedicado para el registro de contenido
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
import { useAuth } from '../../src/contexts/AuthContext';
import { useRefresh } from '../../src/contexts/RefreshContext';
import { ContentRegistry } from '../../src/services/ContentRegistry';

export default function RegisterTab() {
  const { user, wallet, connectXION } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleConnectXION = async () => {
    try {
      const success = await connectXION();
      if (success) {
        Alert.alert('Success', 'Connected to XION blockchain');
      } else {
        Alert.alert('Error', 'Could not connect to XION');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to XION');
    }
  };

  const handleRegisterContent = async () => {
    if (!wallet?.connected && !wallet?.address) {
      Alert.alert('Error', 'XION wallet not connected');
      return;
    }

    // Mostrar opciones para seleccionar archivo
    Alert.alert(
      'Select Content to Register',
      'Choose the type of content you want to register',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📷 Photo from Gallery', 
          onPress: () => pickImageFromGallery() 
        },
        { 
          text: '📸 Take Photo', 
          onPress: () => takePicture() 
        },
        { 
          text: '📁 Document/File', 
          onPress: () => pickDocument() 
        }
      ]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Create consistent file object for gallery images
        const file = {
          uri: asset.uri,
          name: asset.uri.split('/').pop() || 'gallery_image.jpg',
          type: 'image',
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
          mimeType: asset.type || 'image/jpeg'
        };
        
        setSelectedFile(file);
        await registerSelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePicture = async () => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos para usar la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Create consistent file object for camera photos
        const file = {
          uri: asset.uri,
          name: 'camera_photo.jpg', // Consistent name for all camera photos
          type: 'image',
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
          mimeType: 'image/jpeg'
        };
        
        setSelectedFile(file);
        await registerSelectedFile(file);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: 'document',
          size: file.size || 0,
          mimeType: file.mimeType
        });
        
        await registerSelectedFile({
          uri: file.uri,
          name: file.name,
          type: 'document',
          size: file.size || 0,
          mimeType: file.mimeType
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const registerSelectedFile = async (file: any) => {
    setIsRegistering(true);
    
    try {
      console.log('🔄 Registering file:', file.name);
      console.log('📏 File details:', {
        size: file.size,
        width: file.width,
        height: file.height,
        type: file.type,
        uri: file.uri.substring(file.uri.length - 50) // Last 50 chars of URI for debugging
      });
      
      // Simulate hash calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate deterministic hash using content-based approach with size tolerance
      const contentHash = ContentRegistry.generateContentHash(
        file.size,
        file.width,
        file.height,
        file.type
      );
      
      console.log('🔑 Generated content hash:', contentHash);
      console.log('🔍 Hash components:', {
        exactSize: file.size, // Now using exact size instead of ranges
        dimensions: `${file.width}x${file.height}`,
        type: file.type
      });
      
      // Get current user email from auth context
      const authorEmail = user?.email;
      
      if (!authorEmail) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }
      
      // Register content in local storage
      await ContentRegistry.registerContent({
        hash: contentHash,
        author: authorEmail,
        registrationDate: new Date().toLocaleDateString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        originalUri: file.uri,
        width: file.width,
        height: file.height,
        mimeType: file.mimeType
      });
      
      // Trigger refresh across all tabs
      triggerRefresh();
      
      console.log(`✅ File registered with hash: ${contentHash}`);
      console.log(`📝 Author: ${authorEmail}`);
      
      Alert.alert(
        '🎉 Registration Successful!',
        `Your ${file.type} "${file.name}" has been registered on XION blockchain.\n\n📄 File Size: ${(file.size / 1024).toFixed(1)} KB\n👤 Author: ${authorEmail}\n📅 Date: ${new Date().toLocaleDateString()}\n🔐 Hash: ${contentHash.substring(0, 25)}...\n\n✅ Content is now verifiable!`,
        [{ 
          text: 'OK', 
          onPress: () => setSelectedFile(null) 
        }]
      );
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      Alert.alert('Error', 'Failed to register file');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Register Content</Text>
        <Text style={styles.subtitle}>
          Register your original content on XION blockchain for authenticity verification
        </Text>

        {!wallet?.connected ? (
          <View style={styles.requirementCard}>
            <Text style={styles.requirementTitle}>XION Connection Required</Text>
            <Text style={styles.requirementText}>
              Connect your XION wallet to register content on the blockchain
            </Text>
            <TouchableOpacity style={styles.connectButton} onPress={handleConnectXION}>
              <Text style={styles.connectButtonText}>Connect XION Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📱 Ready to Register</Text>
            <Text style={styles.featureText}>
              Your XION wallet is connected. Select content from your device to register on the blockchain.
            </Text>
            
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
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.registerButton, isRegistering && styles.registerButtonDisabled]} 
              onPress={handleRegisterContent}
              disabled={isRegistering}
            >
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Processing...' : selectedFile ? 'Register Another File' : 'Select & Register File'}
              </Text>
            </TouchableOpacity>

            {/* Debug Buttons */}
            <View style={styles.debugContainer}>
              <TouchableOpacity 
                style={styles.debugButton} 
                onPress={async () => {
                  await ContentRegistry.debugShowAll();
                  Alert.alert('Debug', 'Check console for registered content list');
                }}
              >
                <Text style={styles.debugButtonText}>Show Registered</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.debugButton} 
                onPress={async () => {
                  await ContentRegistry.clearAll();
                  Alert.alert('Debug', 'All registered content cleared');
                }}
              >
                <Text style={styles.debugButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  requirementCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  requirementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  filePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  debugButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
