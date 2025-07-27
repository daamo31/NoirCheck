import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { xionService } from '../../src/services/XionService';

export default function ProfileScreen() {
  const [user] = useState({
    username: 'Demo User',
    email: 'demo@noircheck.com',
    registeredAt: new Date().toISOString(),
    totalRegistrations: 5,
    totalVerifications: 12,
  });

  const [wallet, setWallet] = useState(xionService.getWallet());
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    autoBackup: true,
    darkMode: false,
  });

  const [networkStatus, setNetworkStatus] = useState({
    isConnected: false,
    blockHeight: 0,
    networkName: 'XION Testnet',
  });

  useEffect(() => {
    loadNetworkStatus();
  }, []);

  const loadNetworkStatus = async () => {
    try {
      const status = await xionService.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Error loading network status:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const connectedWallet = await xionService.connectWallet();
      if (connectedWallet) {
        setWallet(connectedWallet);
        Alert.alert('Éxito', 'Wallet conectada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo conectar la wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert('Error', 'Error al conectar la wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    Alert.alert(
      'Desconectar Wallet',
      '¿Estás seguro que quieres desconectar tu wallet?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            await xionService.disconnectWallet();
            setWallet(null);
            Alert.alert('Info', 'Wallet desconectada');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Esta función permitirá exportar tu historial de registros y verificaciones.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '⚠️ Esta acción es irreversible. Se eliminarán todos tus datos locales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Funcionalidad no implementada en demo');
          },
        },
      ]
    );
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Aquí iría la lógica para guardar la configuración
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <Text style={styles.headerSubtitle}>
          Configuración y datos de tu cuenta
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userDate}>
                Miembro desde {new Date(user.registeredAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet XION</Text>
          <View style={styles.walletCard}>
            {wallet ? (
              <>
                <View style={styles.walletInfo}>
                  <View style={styles.walletHeader}>
                    <Text style={styles.walletStatus}>🟢 Conectada</Text>
                    <TouchableOpacity
                      style={styles.disconnectButton}
                      onPress={handleDisconnectWallet}
                    >
                      <Text style={styles.disconnectText}>Desconectar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.walletAddress}>
                    {formatAddress(wallet.address)}
                  </Text>
                  <Text style={styles.walletDetails}>
                    Dirección completa: {wallet.address}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.walletDisconnected}>
                <Text style={styles.walletStatus}>🔴 No Conectada</Text>
                <Text style={styles.walletDescription}>
                  Conecta tu wallet para usar todas las funciones
                </Text>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={handleConnectWallet}
                >
                  <Text style={styles.connectText}>Conectar Wallet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Network Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la Red</Text>
          <View style={styles.networkCard}>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Red:</Text>
              <Text style={styles.networkValue}>{networkStatus.networkName}</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Estado:</Text>
              <Text style={[
                styles.networkValue,
                { color: networkStatus.isConnected ? '#16a34a' : '#dc2626' }
              ]}>
                {networkStatus.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
              </Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Altura del Bloque:</Text>
              <Text style={styles.networkValue}>{networkStatus.blockHeight.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{user.totalRegistrations}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔍</Text>
              <Text style={styles.statValue}>{user.totalVerifications}</Text>
              <Text style={styles.statLabel}>Verificaciones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{user.totalRegistrations + user.totalVerifications}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones</Text>
                <Text style={styles.settingDescription}>
                  Recibir alertas sobre transacciones
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Autenticación Biométrica</Text>
                <Text style={styles.settingDescription}>
                  Usar huella o Face ID para acceder
                </Text>
              </View>
              <Switch
                value={settings.biometric}
                onValueChange={(value) => updateSetting('biometric', value)}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Respaldo Automático</Text>
                <Text style={styles.settingDescription}>
                  Guardar datos en la nube
                </Text>
              </View>
              <Switch
                value={settings.autoBackup}
                onValueChange={(value) => updateSetting('autoBackup', value)}
              />
            </View>
            
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Modo Oscuro</Text>
                <Text style={styles.settingDescription}>
                  Cambiar tema de la aplicación
                </Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
              <Text style={styles.actionIcon}>📤</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Exportar Datos</Text>
                <Text style={styles.actionDescription}>
                  Descargar tu historial completo
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionRow, { borderBottomWidth: 0 }]} 
              onPress={handleDeleteAccount}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: '#dc2626' }]}>
                  Eliminar Cuenta
                </Text>
                <Text style={styles.actionDescription}>
                  Borrar todos los datos permanentemente
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la App</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>NoirCheck v1.0.0</Text>
            <Text style={styles.infoText}>
              Verificación de contenido digital con blockchain
            </Text>
            <Text style={styles.infoText}>
              © 2025 NoirCheck. Todos los derechos reservados.
            </Text>
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
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletInfo: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  disconnectText: {
    fontSize: 12,
    color: '#6b7280',
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  walletDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  walletDisconnected: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  walletDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 12,
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  networkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  networkLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  networkValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
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
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#6b7280',
  },
  infoCard: {
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
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
});
