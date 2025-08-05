import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TabOneScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, isLoading, wallet, createAccount, connectXION, logout } = useAuth();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const success = await createAccount(email, password);
    if (success) {
      Alert.alert('Success', 'Account created! Now connecting to XION...');
    } else {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const handleConnectXION = async () => {
    const success = await connectXION();
    if (success) {
      Alert.alert('Success', 'XION wallet connected!');
    } else {
      Alert.alert('Error', 'Failed to connect XION wallet');
    }
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>NoirCheck Mobile</Text>
          <Text style={styles.subtitle}>Welcome, {user.email}!</Text>
          
          {wallet ? (
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>XION Wallet Connected ✅</Text>
              <Text style={styles.walletAddress}>
                {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-6)}
              </Text>
            </View>
          ) : (
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>XION Wallet Not Connected</Text>
              <TouchableOpacity style={styles.connectButton} onPress={handleConnectXION}>
                <Text style={styles.connectButtonText}>Connect XION Wallet</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>NoirCheck Mobile</Text>
        <Text style={styles.subtitle}>Register to verify content authenticity</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account with XION</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#00D4AA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  walletTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  walletAddress: {
    color: '#00D4AA',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: '#00D4AA',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
