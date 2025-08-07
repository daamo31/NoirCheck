/**
 * NoirCheck Mobile Dashboard - Overview Tab
 * 
 * Main overview screen showing user statistics, XION status, and recent activity.
 * This is now just the overview tab, other functionality moved to separate tabs.
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
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

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

export default function OverviewScreen() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalRegistrations: 0,
    totalVerifications: 0,
    recentActivity: [],
  });
  
  const { user, wallet, connectXION } = useAuth();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome back!</Text>
        <Text style={styles.welcomeSubtitle}>Here's your NoirCheck overview</Text>
        
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
          {wallet?.address ? (
            <View>
              <Text style={styles.connectedText}>
                {wallet.connected ? '✅ Connected' : '🔶 Demo Wallet'}
              </Text>
              <Text style={styles.addressText}>
                {wallet.address.slice(0, 15)}...{wallet.address.slice(-10)}
              </Text>
              {!wallet.connected && (
                <TouchableOpacity style={styles.connectButton} onPress={handleConnectXION}>
                  <Text style={styles.connectButtonText}>Connect Real XION</Text>
                </TouchableOpacity>
              )}
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
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
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
    marginBottom: 12,
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
});
