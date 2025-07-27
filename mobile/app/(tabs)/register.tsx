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
import { xionService } from '../../src/services/XionService';

const RegisterScreen = () => {
  const { user, updateUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to register content.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setRegistrationResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera access to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setRegistrationResult(null);
    }
  };

  const registerContent = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // Check if wallet is connected
    const wallet = xionService.getWallet();
    if (!wallet) {
      Alert.alert(
        'Wallet Required',
        'You need to connect a XION wallet to register content on the blockchain.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Wallet', onPress: () => handleConnectWallet() },
        ]
      );
      return;
    }

    try {
      setLoading(true);
      
      // Get image info
      const imageInfo = await getImageInfo(selectedImage);
      
      console.log('📝 Starting content registration...');
      
      // Register content on blockchain
      const content = await contentService.registerContent(
        selectedImage,
        imageInfo.fileName,
        imageInfo.fileSize,
        imageInfo.mimeType,
        {
          description: 'Content registered via NoirCheck mobile app',
          tags: ['mobile', 'original'],
          deviceInfo: 'Mobile App',
        }
      );

      setRegistrationResult(content);
      
      // Update user statistics
      if (user) {
        updateUser({
          totalRegistrations: (user.totalRegistrations || 0) + 1,
          lastActivity: new Date().toISOString(),
        });
      }

      Alert.alert(
        'Success!',
        'Your content has been registered on the XION blockchain.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred during registration'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const wallet = await xionService.connectWallet();
      if (wallet && user) {
        updateUser({ 
          xionWallet: wallet, 
          address: wallet.address,
          lastActivity: new Date().toISOString()
        });
        Alert.alert('Success', 'XION wallet connected successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect XION wallet');
    }
  };

  const getImageInfo = async (uri: string) => {
    // In a real implementation, you would get actual file info
    return {
      fileName: `image_${Date.now()}.jpg`,
      fileSize: 1024 * 1024, // 1MB placeholder
      mimeType: 'image/jpeg',
    };
  };

  const resetRegistration = () => {
    setSelectedImage(null);
    setRegistrationResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Register Content</Text>
          <Text style={styles.subtitle}>
            Register your original content on the XION blockchain
          </Text>
        </View>

        {/* Wallet Status */}
        <View style={styles.walletStatus}>
          <Ionicons 
            name={xionService.getWallet() ? "wallet" : "wallet-outline"} 
            size={20} 
            color={xionService.getWallet() ? "#00D4AA" : "#888"} 
          />
          <Text style={[
            styles.walletText,
            { color: xionService.getWallet() ? "#00D4AA" : "#888" }
          ]}>
            {xionService.getWallet() 
              ? `Connected: ${xionService.getWallet()?.address.slice(0, 10)}...`
              : 'Wallet not connected'
            }
          </Text>
          {!xionService.getWallet() && (
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={handleConnectWallet}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Image Selection */}
        {!selectedImage ? (
          <View style={styles.selectionContainer}>
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color="#666" />
              <Text style={styles.placeholderText}>Select content to register</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.changeButton} onPress={resetRegistration}>
                <Ionicons name="refresh" size={16} color="#888" />
                <Text style={styles.changeButtonText}>Change Image</Text>
              </TouchableOpacity>
            </View>

            {/* Registration Result */}
            {registrationResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#00D4AA" />
                  <Text style={styles.resultTitle}>Registration Complete</Text>
                </View>
                
                <View style={styles.resultDetails}>
                  <Text style={styles.resultLabel}>Content Hash:</Text>
                  <Text style={styles.resultValue}>
                    {registrationResult.hash.slice(0, 20)}...
                  </Text>
                  
                  {registrationResult.blockchainTxHash && (
                    <>
                      <Text style={styles.resultLabel}>Transaction ID:</Text>
                      <Text style={styles.resultValue}>
                        {registrationResult.blockchainTxHash.slice(0, 20)}...
                      </Text>
                    </>
                  )}
                  
                  <Text style={styles.resultLabel}>Registered:</Text>
                  <Text style={styles.resultValue}>
                    {new Date(registrationResult.registeredAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Register Button */}
            {!registrationResult && (
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={registerContent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="shield-checkmark" size={20} color="#000" />
                )}
                <Text style={styles.registerButtonText}>
                  {loading ? 'Registering...' : 'Register on Blockchain'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="finger-print" size={16} color="#00D4AA" />
            <Text style={styles.infoText}>
              Your content is hashed using SHA-256 encryption
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="link" size={16} color="#00D4AA" />
            <Text style={styles.infoText}>
              Hash is registered on XION blockchain with timestamp
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color="#00D4AA" />
            <Text style={styles.infoText}>
              Creates immutable proof of authenticity and ownership
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  walletStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  selectionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 24,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    gap: 6,
  },
  changeButtonText: {
    color: '#888',
    fontSize: 14,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00D4AA',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4AA',
  },
  resultDetails: {
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  infoSection: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
});

export default RegisterScreen;
