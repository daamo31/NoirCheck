import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [userStats, setUserStats] = useState({
    totalRegistrations: 0,
    totalVerifications: 0,
    recentActivity: [],
    joinDate: new Date().toISOString(),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Update stats when user changes
  useEffect(() => {
    if (user) {
      setUserStats({
        totalRegistrations: user.totalRegistrations || 0,
        totalVerifications: user.totalVerifications || 0,
        recentActivity: [], // We can populate this from user activity later
        joinDate: user.registeredAt,
      });
    }
  }, [user]);

  // Show loading or redirect if no user
  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyActivity}>
          <Text style={styles.emptyActivityText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  

  const quickStats = [
    {
      label: 'Contenido Registrado',
      value: userStats.totalRegistrations,
      icon: '📝',
      color: '#dbeafe',
      textColor: '#2563eb',
    },
    {
      label: 'Verificaciones',
      value: userStats.totalVerifications,
      icon: '🛡️',
      color: '#dcfce7',
      textColor: '#16a34a',
    },
    {
      label: 'Actividad Reciente',
      value: userStats.recentActivity.length,
      icon: '📊',
      color: '#fdf4ff',
      textColor: '#9333ea',
    },
    {
      label: 'Miembro desde',
      value: new Date(user.registeredAt).getFullYear(),
      icon: '📅',
      color: '#fef3c7',
      textColor: '#d97706',
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Error al cerrar sesión');
          }
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.appName}>NoirCheck</Text>
            <Text style={styles.headerSubtitle}>Dashboard</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.username || 
                 `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                 user.email?.split('@')[0] || 
                 'User'}
              </Text>
              <Text style={styles.userAddress}>
                {user.address ? 
                  `${user.address.slice(0, 10)}...${user.address.slice(-6)}` : 
                  'No wallet connected'}
              </Text>
              <Text style={styles.userJoinDate}>
                Registrado: {new Date(user.registeredAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.userStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Registros</Text>
              <Text style={styles.statValue}>{user.totalRegistrations}</Text>
            </View>
            <View style={[styles.statBadge, { marginLeft: 12 }]}>
              <Text style={styles.statLabel}>Verificaciones</Text>
              <Text style={styles.statValue}>{user.totalVerifications}</Text>
            </View>
          </View>
        </View>

        {/* Quick Statistics */}
        <Text style={styles.sectionTitle}>Estadísticas Rápidas</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.color }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statCardLabel}>{stat.label}</Text>
              <Text style={[styles.statCardValue, { color: stat.textColor }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Registrar', 'Ir a pantalla de registro')}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Registrar Contenido</Text>
            <Text style={styles.actionSubtitle}>Protege tu contenido original</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Verificar', 'Ir a pantalla de verificación')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Verificar Contenido</Text>
            <Text style={styles.actionSubtitle}>Comprueba la autenticidad</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        <View style={styles.activityList}>
          {userStats.recentActivity.length > 0 ? (
            userStats.recentActivity.map((activity: any, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityIcon}>
                  {activity.type === 'registration' ? '📝' : '🔍'}
                </Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    {activity.type === 'registration' ? 'Contenido registrado' : 'Contenido verificado'}
                  </Text>
                  <Text style={styles.activitySubtitle}>{activity.filename}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.activityStatus}>
                  <Text style={styles.statusText}>✅</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No hay actividad reciente</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    color: 'white',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  logoutText: {
    color: '#374151',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userAddress: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  userJoinDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  userStats: {
    flexDirection: 'row',
  },
  statBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginRight: '2%',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  activityStatus: {
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
  },
  emptyActivity: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyActivityText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
