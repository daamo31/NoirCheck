import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/contexts/AuthContext';
import { UserStorageService } from '../../src/services/UserStorageService';
import { xionApiService } from '../../src/services/XionApiService';

interface HistoryItem {
  id: string;
  type: 'registration' | 'verification';
  filename: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details?: any;
}

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'registration' | 'verification'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // Simulate history loading
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          type: 'registration',
          filename: 'important_document.pdf',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          details: {
            txId: 'tx_abc123',
            hash: 'hash_def456',
            size: 2048576,
          }
        },
        {
          id: '2',
          type: 'verification',
          filename: 'suspicious_image.jpg',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          details: {
            isOriginal: false,
            confidence: 0.3,
            modifications: ['Posible edición detectada']
          }
        },
        {
          id: '3',
          type: 'registration',
          filename: 'original_video.mp4',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          details: {
            txId: 'tx_ghi789',
            hash: 'hash_jkl012',
            size: 15728640,
          }
        },
        {
          id: '4',
          type: 'verification',
          filename: 'certificado.pdf',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          details: {
            isOriginal: true,
            confidence: 0.95,
            originalOwner: 'xion1abc123...'
          }
        },
        {
          id: '5',
          type: 'registration',
          filename: 'contrato.docx',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          details: {
            txId: 'tx_pending123',
          }
        },
      ];

      setHistoryItems(mockHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Could not load history');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const filteredItems = historyItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'pending': return '#d97706';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'registration' ? '📝' : '🔍';
  };

  const getTypeText = (type: string) => {
    return type === 'registration' ? 'Registro' : 'Verificación';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString();
  };

  const handleItemPress = (item: HistoryItem) => {
    let message = `File: ${item.filename}\n`;
    message += `Tipo: ${getTypeText(item.type)}\n`;
    message += `Estado: ${getStatusText(item.status)}\n`;
    message += `Fecha: ${new Date(item.timestamp).toLocaleString()}\n\n`;

    if (item.type === 'registration' && item.details) {
      if (item.details.txId) {
        message += `TX ID: ${item.details.txId}\n`;
      }
      if (item.details.hash) {
        message += `Hash: ${item.details.hash.substring(0, 16)}...\n`;
      }
      if (item.details.size) {
        message += `Tamaño: ${formatFileSize(item.details.size)}\n`;
      }
    } else if (item.type === 'verification' && item.details) {
      message += `Original: ${item.details.isOriginal ? 'Sí' : 'No'}\n`;
      message += `Confianza: ${Math.round(item.details.confidence * 100)}%\n`;
      if (item.details.originalOwner) {
        message += `Propietario: ${item.details.originalOwner}\n`;
      }
      if (item.details.modifications) {
        message += `Modificaciones: ${item.details.modifications.join(', ')}\n`;
      }
    }

    Alert.alert('Detalles del Elemento', message, [{ text: 'OK' }]);
  };

  const getStatsForType = (type: 'registration' | 'verification') => {
    const items = historyItems.filter(item => item.type === type);
    const completed = items.filter(item => item.status === 'completed').length;
    const pending = items.filter(item => item.status === 'pending').length;
    const failed = items.filter(item => item.status === 'failed').length;
    
    return { total: items.length, completed, pending, failed };
  };

  const registrationStats = getStatsForType('registration');
  const verificationStats = getStatsForType('verification');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>
          Tu actividad de registros y verificaciones
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statTitle}>Registros</Text>
              <Text style={styles.statValue}>{registrationStats.total}</Text>
              <Text style={styles.statDetails}>
                {registrationStats.completed} completados, {registrationStats.pending} pendientes
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔍</Text>
              <Text style={styles.statTitle}>Verificaciones</Text>
              <Text style={styles.statValue}>{verificationStats.total}</Text>
              <Text style={styles.statDetails}>
                {verificationStats.completed} completadas, {verificationStats.pending} pendientes
              </Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtros</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Todos ({historyItems.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'registration' && styles.filterButtonActive]}
              onPress={() => setFilter('registration')}
            >
              <Text style={[styles.filterText, filter === 'registration' && styles.filterTextActive]}>
                Registros ({registrationStats.total})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'verification' && styles.filterButtonActive]}
              onPress={() => setFilter('verification')}
            >
              <Text style={[styles.filterText, filter === 'verification' && styles.filterTextActive]}>
                Verificaciones ({verificationStats.total})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Actividad Reciente ({filteredItems.length})
          </Text>
          
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No hay actividad</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Aún no tienes registros ni verificaciones'
                  : `No tienes ${filter === 'registration' ? 'registros' : 'verificaciones'} todavía`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>
                      {getTypeIcon(item.type)}
                    </Text>
                  </View>
                  
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyFilename}>{item.filename}</Text>
                    <Text style={styles.historyType}>
                      {getTypeText(item.type)}
                    </Text>
                    <Text style={styles.historyTime}>
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </View>
                  
                  <View style={styles.historyStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                    
                    {item.type === 'verification' && item.details && (
                      <Text style={[
                        styles.confidenceText,
                        { color: item.details.isOriginal ? '#16a34a' : '#dc2626' }
                      ]}>
                        {item.details.isOriginal ? '✅ Original' : '⚠️ Modificado'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Info', 'Go to registration screen')}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>New Registration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Info', 'Go to verification screen')}
            >
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionText}>New Verification</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statDetails: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
  },
  historyFilename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  historyType: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  historyStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});
