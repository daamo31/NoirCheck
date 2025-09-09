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
import { useRefresh } from '../../src/contexts/RefreshContext';
import { ContentRegistry } from '../../src/services/ContentRegistry';

interface ActivityItem {
  id: string;
  type: 'registration';
  title: string;
  date: string;
  author: string;
  hash: string;
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
  const { refreshKey } = useRefresh();

  // Load user statistics from ContentRegistry
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const registeredContent = await ContentRegistry.getAllRegisteredContent();
        const userEmail = user?.email;
        
        if (!userEmail) {
          // No user logged in, show empty stats
          setUserStats({
            totalRegistrations: 0,
            totalVerifications: 0,
            recentActivity: [],
          });
          return;
        }
        
        // Filter content by current user
        const userContent = registeredContent.filter(content => content.author === userEmail);
        
        // Convert to activity items
        const recentActivity: ActivityItem[] = userContent
          .slice(-10) // Last 10 items
          .reverse() // Most recent first
          .map((content, index) => ({
            id: content.hash,
            type: 'registration' as const,
            title: content.fileName,
            date: content.registrationDate,
            author: content.author,
            hash: content.hash
          }));
        
        setUserStats({
          totalRegistrations: userContent.length,
          totalVerifications: 0, // Will implement verification tracking later
          recentActivity,
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
        // Fallback to empty stats
        setUserStats({
          totalRegistrations: 0,
          totalVerifications: 0,
          recentActivity: [],
        });
      }
    };

    loadUserStats();
  }, [user?.email, refreshKey]); // Re-load when user changes or refresh is triggered

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
          {userStats.recentActivity.length > 0 ? (
            userStats.recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityIcon}>📝</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                  <Text style={styles.activityHash}>
                    Hash: {activity.hash.substring(0, 20)}...
                  </Text>
                </View>
                <Text style={styles.activityType}>Registered</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                No content registered yet
              </Text>
              <Text style={styles.emptyActivitySubtext}>
                Go to Register tab to add your first content
              </Text>
            </View>
          )}
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
  activityHash: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
    fontFamily: 'monospace',
  },
  activityType: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '500',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyActivityText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyActivitySubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
