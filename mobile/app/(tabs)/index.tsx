/**
 * NoirCheck Mobile Dashboard
 * 
 * Main dashboard screen similar to web version with overview, content registration,
 * verification, and user management features. Integrates with XION blockchain
 * for content authenticity verification.
 * 
 * Features:
 * - User overview with stats
 * - Content registration and verification
 * - XION wallet integration
 * - Activity history
 * - Profile management
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface ActivityItem {
  id: number;
  type: 'registration' | 'verification';
  title: string;
  date: string;
}

interface UserStats {
  totalRegistrations: number;
  totalVerifications: number;
  recentActivity: ActivityItem[];
}

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalRegistrations: 0,
    totalVerifications: 0,
    recentActivity: [],
  });
  
  const { user, wallet, connectXION, logout } = useAuth();

  // Load user statistics (mock data for now)
  useEffect(() => {
    const loadUserStats = () => {
      setUserStats({
        totalRegistrations: Math.floor(Math.random() * 20) + 5,
        totalVerifications: Math.floor(Math.random() * 50) + 10,
        recentActivity: [
          { id: 1, type: 'registration', title: 'Photo_001.jpg', date: '2025-08-06' },
          { id: 2, type: 'verification', title: 'Document.pdf', date: '2025-08-05' },
          { id: 3, type: 'registration', title: 'Video_clip.mp4', date: '2025-08-04' },
        ],
      });
    };

    loadUserStats();
  }, []);

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

  const renderTabButton = (tabId: string, label: string, icon: string) => (
    <TouchableOpacity
      key={tabId}
      style={[
        styles.tabButton,
        activeTab === tabId && styles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tabId)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[
        styles.tabLabel,
        activeTab === tabId && styles.tabLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Dashboard Overview</Text>
      
      {/* User Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalRegistrations}</Text>
          <Text style={styles.statLabel}>Registrations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalVerifications}</Text>
          <Text style={styles.statLabel}>Verifications</Text>
        </View>
      </View>

      {/* XION Status */}
      <View style={styles.xionCard}>
        <Text style={styles.cardTitle}>XION Blockchain Status</Text>
        {wallet?.connected ? (
          <View>
            <Text style={styles.connectedText}>✅ Connected</Text>
            <Text style={styles.addressText}>
              {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-6)}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.disconnectedText}>❌ Not Connected</Text>
            <TouchableOpacity style={styles.connectButton} onPress={handleConnectXION}>
              <Text style={styles.connectButtonText}>Connect XION</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {userStats.recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text style={styles.activityIcon}>
              {activity.type === 'registration' ? '📝' : '🔍'}
            </Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <Text style={styles.activityType}>
              {activity.type === 'registration' ? 'Registered' : 'Verified'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRegister = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Register Content</Text>
      
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
          <Text style={styles.featureTitle}>📱 Content Registration</Text>
          <Text style={styles.featureText}>
            Register your original content on XION blockchain for authenticity verification
          </Text>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Upload & Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderVerify = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Verify Content</Text>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🔍 Content Verification</Text>
        <Text style={styles.featureText}>
          Verify the authenticity of any digital content against blockchain records
        </Text>
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureButtonText}>Select & Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      <View style={styles.profileCard}>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.profileDate}>
          Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
        </Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NoirCheck</Text>
        <Text style={styles.subtitle}>Digital Content Verification</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('overview', 'Overview', '📊')}
          {renderTabButton('register', 'Register', '📝')}
          {renderTabButton('verify', 'Verify', '🔍')}
          {renderTabButton('profile', 'Profile', '👤')}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'register' && renderRegister()}
        {activeTab === 'verify' && renderVerify()}
        {activeTab === 'profile' && renderProfile()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#333',
    minWidth: 100,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  xionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  connectedText: {
    fontSize: 16,
    color: '#00D4AA',
    fontWeight: '600',
    marginBottom: 8,
  },
  disconnectedText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityType: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '500',
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
  featureButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  featureButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
