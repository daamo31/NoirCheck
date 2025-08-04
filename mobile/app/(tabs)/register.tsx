import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { contentService } from '../../src/services/ContentService';
import { xionApiService } from '../../src/services/XionApiService';

const RegisterScreen = () => {
  const { user, wallet, addActivity } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const connectWallet = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newWallet = await xionApiService.createWallet({ username: user?.username });
      if (newWallet) {
        Alert.alert('Success', 'XION wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert('Error', 'Failed to connect XION wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const registerContent = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!wallet) {
      Alert.alert('Error', 'Please connect your XION wallet first');
      return;
    }

    setRegistering(true);
    try {
      // Get file info
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const fileSize = blob.size;
      const mimeType = blob.type || 'image/jpeg';
      const fileName = `content_${Date.now()}.jpg`;

      // Register content
      const registeredContent = await contentService.registerContent(
        selectedImage,
        fileName,
        fileSize,
        mimeType,
        {
          description: 'Content registered via mobile app',
          tags: ['mobile', 'original'],
          deviceInfo: 'Mobile device',
        }
      );

      // Add to user activity
      if (addActivity) {
        addActivity({
          type: 'registration',
          description: `Registered content: ${fileName}`,
          details: {
            fileName: fileName,
            hash: registeredContent.hash,
            status: 'completed',
          },
        });
      }

      Alert.alert(
        'Success!',
        'Your content has been registered on the blockchain',
        [
          {
            text: 'OK',
            onPress: () => setSelectedImage(null),
          },
        ]
      );
    } catch (error) {
      console.error('Error registering content:', error);
      Alert.alert('Error', 'Failed to register content. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Register Content</Text>
          <Text style={styles.subtitle}>
            Register your original content on the blockchain
          </Text>
        </View>

        {/* Wallet Status */}
        <View style={styles.walletSection}>
          <View style={styles.walletHeader}>
            <Ionicons 
              name={wallet ? "wallet" : "wallet-outline"} 
              size={24} 
              color={wallet ? "#00D4AA" : "#888"} 
            />
            <Text 
              style={[
                styles.walletText, 
                { color: wallet ? "#00D4AA" : "#888" }
              ]}
            >
              {wallet 
                ? `Connected: ${wallet.address.slice(0, 10)}...`
                : "XION Wallet Not Connected"
              }
            </Text>
          </View>
          
          {!wallet && (
            <TouchableOpacity 
              style={styles.connectButton} 
              onPress={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1a1a1a" size="small" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Image Selection */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Select Content</Text>
          
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#00D4AA" />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="#00D4AA" />
              <Text style={styles.imageButtonText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <View style={styles.registerSection}>
          <TouchableOpacity 
            style={[
              styles.registerButton,
              (!selectedImage || !wallet || registering) && styles.registerButtonDisabled
            ]}
            onPress={registerContent}
            disabled={!selectedImage || !wallet || registering}
          >
            {registering ? (
              <ActivityIndicator color="#1a1a1a" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={24} color="#1a1a1a" />
                <Text style={styles.registerButtonText}>Register on Blockchain</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.registerInfo}>
            Registering content creates a permanent record of ownership and authenticity
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  walletSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  imageButtonText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  registerSection: {
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  registerButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerInfo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RegisterScreen;
