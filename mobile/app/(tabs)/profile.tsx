import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout, updateUser, connectXionWallet, disconnectXionWallet, addActivity, retryPendingWallet } = useAuth();
  const [pendingLoading, setPendingLoading] = useState(false);
  const handleRetryWallet = async () => {
    setPendingLoading(true);
    const result = await retryPendingWallet();
    setPendingLoading(false);
    if (result) {
      Alert.alert('Success', 'Your XION wallet has been created and connected!');
    } else {
      Alert.alert('Network Issue', 'XION network is still unavailable. Please try again later.');
    }
  };
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out properly');
            }
          }
        },
      ]
    );
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await connectXionWallet();
      
      await addActivity({
        type: 'profile_update',
        description: 'XION wallet connected'
      });
      
      Alert.alert('Success', 'XION wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert('Error', 'Failed to connect XION wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your XION wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await disconnectXionWallet();
              
              await addActivity({
                type: 'profile_update',
                description: 'XION wallet disconnected'
              });
              
              Alert.alert('Success', 'XION wallet disconnected.');
            } catch (error) {
              console.error('Error disconnecting wallet:', error);
              Alert.alert('Error', 'Failed to disconnect wallet.');
            }
          }
        },
      ]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error('Error sharing text:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Please sign in to view your profile</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.username?.charAt(0).toUpperCase() || 
               user.firstName?.charAt(0).toUpperCase() || 
               user.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.username}>
            {user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User'}
          </Text>
          {user.email && <Text style={styles.email}>{user.email}</Text>}
          <Text style={styles.joinDate}>Member since {formatDate(user.registeredAt)}</Text>
        </View>

        {/* XION Wallet Section */}
        {user.isPending && (
          <View style={{backgroundColor:'#fffbe6',borderRadius:12,padding:16,marginBottom:16,borderWidth:1,borderColor:'#facc15'}}>
            <Text style={{color:'#b45309',fontWeight:'bold',marginBottom:8}}>
              XION wallet creation is pending
            </Text>
            <Text style={{color:'#b45309',marginBottom:12}}>
              Your wallet could not be created due to network issues. You can retry now or wait until the network is available.
            </Text>
            <TouchableOpacity
              style={{backgroundColor:'#facc15',padding:12,borderRadius:8,alignItems:'center'}}
              onPress={handleRetryWallet}
              disabled={pendingLoading}
            >
              <Text style={{color:'#78350f',fontWeight:'bold'}}>
                {pendingLoading ? 'Retrying...' : 'Retry Wallet Creation'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>XION Wallet</Text>
          
          {user.xionWallet ? (
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Ionicons name="wallet" size={24} color="#00D4AA" />
                <Text style={styles.walletStatus}>Connected</Text>
              </View>
              
              <Text style={styles.walletAddress}>
                {user.xionWallet.address.slice(0, 20)}...{user.xionWallet.address.slice(-10)}
              </Text>
              
              <View style={styles.walletActions}>
                <TouchableOpacity 
                  style={styles.walletActionButton}
                  onPress={() => copyToClipboard(user.xionWallet!.address)}
                >
                  <Ionicons name="copy" size={16} color="#00D4AA" />
                  <Text style={styles.walletActionText}>Copy Address</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.walletActionButton, styles.disconnectButton]}
                  onPress={handleDisconnectWallet}
                  disabled={loading}
                >
                  <Ionicons name="unlink" size={16} color="#FF6B6B" />
                  <Text style={[styles.walletActionText, { color: '#FF6B6B' }]}>
                    {loading ? 'Disconnecting...' : 'Disconnect'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Ionicons name="wallet-outline" size={24} color="#666" />
                <Text style={[styles.walletStatus, { color: '#666' }]}>Not Connected</Text>
              </View>
              
              <Text style={styles.walletDescription}>
                Connect a XION wallet to register and verify content on the blockchain with advanced features like zkTLS verification.
              </Text>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleConnectWallet}
                disabled={loading}
              >
                <Ionicons name="link" size={16} color="#000" />
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Connecting...' : 'Connect XION Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.totalRegistrations}</Text>
              <Text style={styles.statLabel}>Content Registered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.totalVerifications}</Text>
              <Text style={styles.statLabel}>Verifications Made</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/history')}>
            <Ionicons name="time" size={20} color="#FFF" />
            <Text style={styles.menuText}>Activity History</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings" size={20} color="#FFF" />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={20} color="#FFF" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle" size={20} color="#FFF" />
            <Text style={styles.menuText}>About NoirCheck</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D4AA',
    marginLeft: 8,
  },
  walletAddress: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  walletDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222',
    gap: 6,
  },
  disconnectButton: {
    borderColor: '#FF6B6B',
  },
  walletActionText: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;