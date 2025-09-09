/**
 * Profile Tab
 * Tab dedicado para la gestión del perfil de usuario
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileTab() {
  const { user, wallet, logout, connectXION, isConnected, isConnecting, clearAllDemoData } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleConnectXION = async () => {
    try {
      const success = await connectXION();
      if (success) {
        Alert.alert('Success', 'XION wallet connected successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect XION wallet');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while connecting to XION');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      '🗑️ Clear All Data',
      'This will remove ALL registered content and demo data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await clearAllDemoData();
              Alert.alert('✅ Success', 'All demo data has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        <View style={styles.profileCard}>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profileDate}>
            Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.cardTitle}>XION Wallet Status</Text>
          {wallet?.address ? (
            <View>
              <Text style={styles.connectedText}>
                {wallet.connected ? '✅ Connected via Abstraxion' : '🔶 Ready to Connect'}
              </Text>
              <Text style={styles.addressText}>
                {wallet.address.slice(0, 15)}...{wallet.address.slice(-10)}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.disconnectedText}>❌ No wallet connected</Text>
              <TouchableOpacity 
                style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
                onPress={handleConnectXION}
                disabled={isConnecting}
              >
                <Text style={styles.connectButtonText}>
                  {isConnecting ? 'Connecting...' : 'Connect XION Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Account Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Privacy Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearDataButton} onPress={handleClearAllData}>
            <Text style={styles.clearDataButtonText}>🗑️ Clear All Demo Data</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  profileEmail: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  profileDate: {
    fontSize: 14,
    color: '#666',
  },
  walletCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  connectedText: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '500',
    marginBottom: 8,
  },
  disconnectedText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  actionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  connectButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearDataButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  clearDataButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
