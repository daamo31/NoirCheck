/**
 * User Login Screen
 * 
 * Handles user authentication with email and password.
 * Integrates with XION wallet system for blockchain operations.
 * 
 * Features:
 * - Email/password authentication
 * - XION wallet login option
 * - Form validation and error handling
 * - Loading states during authentication
 * - Navigation to registration for new users
 * - Secure session management with AuthContext
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { xionApiService } from '../../src/services/XionApiService';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }

    try {
      await login(email, password);
      
      // If we get here, login was successful
      console.log('✅ Login successful, navigating to dashboard...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Incorrect credentials');
    }
  };

  const handleXionLogin = async () => {
    try {
      // Use wallet connection instead of login for XION
      const wallet = await xionApiService.createWallet({ username: 'guest_' + Date.now() });
      if (wallet) {
        console.log('✅ XION wallet connected, navigating to dashboard...');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('❌ XION wallet connection error:', error);
      Alert.alert('Error', 'Failed to connect XION wallet');
    }
  };

  const handleMetaMaskLogin = () => {
    Alert.alert('MetaMask Login', 'Conectando con MetaMask...');
    // Aquí iría la integración con MetaMask
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🛡️</Text>
            </View>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Access your NoirCheck account
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Wallet Options */}
          <TouchableOpacity 
            style={styles.walletButton}
            onPress={handleXionLogin}
          >
            <Text style={styles.walletButtonText}>🚀 Conectar con XION</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.walletButton}
            onPress={handleMetaMaskLogin}
          >
            <Text style={styles.walletButtonText}>🦊 Conectar con MetaMask</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerButtonText}>Create account</Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 30,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },
  walletButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  walletButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingBottom: 40,
  },
  registerText: {
    color: '#64748b',
    fontSize: 16,
  },
  registerButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
