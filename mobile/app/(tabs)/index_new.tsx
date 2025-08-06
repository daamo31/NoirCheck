/**
 * Pantalla de Registro de Contenido
 * Solo muestra funcionalidad si el usuario está conectado a XION
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TabOneScreen() {
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { user, wallet, connectXION, updateUserMap, logout } = useAuth();

  const handleConnectXION = async () => {
    try {
      const success = await connectXION();
      if (success) {
        Alert.alert('Éxito', 'Conectado a XION blockchain');
      } else {
        Alert.alert('Error', 'No se pudo conectar a XION');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al conectar con XION');
    }
  };

  const handleRegisterContent = async () => {
    if (!wallet?.connected) {
      Alert.alert('Error', 'Primero debes conectar tu wallet XION');
      return;
    }

    if (!contentTitle.trim()) {
      Alert.alert('Error', 'Ingresa un título para el contenido');
      return;
    }

    setIsRegistering(true);
    try {
      // Simular hash del contenido
      const contentHash = `hash_${Date.now()}`;
      
      const contentData = {
        title: contentTitle,
        description: contentDescription,
        hash: contentHash,
        timestamp: new Date().toISOString(),
        creator: user?.email,
      };

      const success = await updateUserMap(contentData);
      
      if (success) {
        Alert.alert('Éxito', 'Contenido registrado en blockchain');
        setContentTitle('');
        setContentDescription('');
      } else {
        Alert.alert('Error', 'No se pudo registrar el contenido');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al registrar contenido');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Contenido</Text>
          <Text style={styles.subtitle}>Usuario: {user?.email}</Text>
        </View>

        {/* Estado de XION */}
        <View style={styles.xionSection}>
          <Text style={styles.sectionTitle}>Estado XION</Text>
          {wallet?.connected ? (
            <View style={styles.walletInfo}>
              <Text style={styles.walletText}>✅ Conectado</Text>
              <Text style={styles.addressText}>
                {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-6)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.connectButton} onPress={handleConnectXION}>
              <Text style={styles.connectButtonText}>Conectar XION Wallet</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Formulario de registro */}
        {wallet?.connected && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Registrar Nuevo Contenido</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título del contenido"
              placeholderTextColor="#666"
              value={contentTitle}
              onChangeText={setContentTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor="#666"
              value={contentDescription}
              onChangeText={setContentDescription}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.registerButton, isRegistering && styles.buttonDisabled]}
              onPress={handleRegisterContent}
              disabled={isRegistering}
            >
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Registrando...' : 'Registrar en Blockchain'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  xionSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  walletInfo: {
    alignItems: 'center',
  },
  walletText: {
    fontSize: 18,
    color: '#00D4AA',
    fontWeight: '600',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  registerButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
