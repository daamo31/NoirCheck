/**
 * NoirCheck Registration Screen
 * 
 * Handles new user registration for NoirCheck. Creates local user accounts
 * that can later be connected to XION blockchain for content verification
 * and registration features.
 * 
 * Features:
 * - Email/password account creation
 * - Password confirmation validation
 * - Input validation and error handling
 * - Automatic navigation to main app after registration
 * - Option to return to login screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function RegisterScreen() {
  // Form state management con valores predefinidos para demo
  const [email, setEmail] = useState('by.cozyhome@gmail.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  
  // Authentication context and navigation
  const { createAccount } = useAuth();
  const router = useRouter();

  /**
   * Handle user registration with validation and automatic XION connection
   */
  const handleRegister = async () => {
    // Validate required fields
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Creating NoirCheck account...');
      const success = await createAccount(email, password);
      
      if (success) {
        console.log('✅ Account created successfully');
        
        // NO intentar conectar XION automáticamente para evitar bloqueos
        console.log('ℹ️ Account ready. XION connection can be done later from dashboard.');
        
        // Navegar directamente al dashboard
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
        
      } else {
        Alert.alert('Error', 'Could not create account');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      Alert.alert('Error', 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate back to login screen
   */
  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join NoirCheck</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToLogin} style={styles.linkButton}>
              <Text style={styles.linkText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
