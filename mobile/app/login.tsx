import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

const LoginScreen = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'wallet'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, loginWithWallet } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const success = await login(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const success = await register({ email, username });
      
      if (success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    try {
      setLoading(true);
      const success = await loginWithWallet();
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to connect XION wallet');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while connecting wallet');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <>
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {mode === 'register' && (
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color="#888" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={mode === 'register' ? handleRegister : handleEmailLogin}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Loading...' : mode === 'register' ? 'Create Account' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
      >
        <Text style={styles.linkText}>
          {mode === 'register' 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Create One"
          }
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderWalletForm = () => (
    <>
      <View style={styles.walletInfo}>
        <Ionicons name="wallet" size={48} color="#00D4AA" />
        <Text style={styles.walletTitle}>Connect XION Wallet</Text>
        <Text style={styles.walletDescription}>
          Connect your XION wallet to access advanced features including 
          zkTLS verification and gasless transactions.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleWalletLogin}
        disabled={loading}
      >
        <Ionicons name="link" size={20} color="#000" />
        <Text style={styles.primaryButtonText}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('login')}
      >
        <Text style={styles.linkText}>Use Email Instead</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>NoirCheck</Text>
            <Text style={styles.tagline}>Verify. Trust. Authenticate.</Text>
          </View>

          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'login' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('login')}
            >
              <Text style={[
                styles.modeButtonText,
                mode === 'login' && styles.modeButtonTextActive,
              ]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'wallet' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('wallet')}
            >
              <Text style={[
                styles.modeButtonText,
                mode === 'wallet' && styles.modeButtonTextActive,
              ]}>
                Wallet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {mode === 'wallet' ? renderWalletForm() : renderEmailForm()}
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="#00D4AA" />
              <Text style={styles.featureText}>Blockchain Verification</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="finger-print" size={24} color="#00D4AA" />
              <Text style={styles.featureText}>zkTLS Authentication</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="lock-closed" size={24} color="#00D4AA" />
              <Text style={styles.featureText}>Content Security</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#00D4AA',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  modeButtonTextActive: {
    color: '#000',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  walletInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  walletDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#00D4AA',
    textDecorationLine: 'underline',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LoginScreen;
