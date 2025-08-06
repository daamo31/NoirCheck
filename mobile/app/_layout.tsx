/**
 * Layout principal de la aplicación
 * Jerarquía: XION → Auth → Theme → Navigation
 */

// Importar polyfills PRIMERO - CRÍTICO para XION SDK
import '../polyfills';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

// Providers
import XIONProvider from '../src/providers/XIONProvider';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  // Verificar que los polyfills se han cargado correctamente
  useEffect(() => {
    console.log('🔍 Verifying polyfills at app start...');
    console.log('Buffer available:', typeof global.Buffer !== 'undefined');
    console.log('crypto.getRandomValues available:', typeof global.crypto?.getRandomValues === 'function');
    console.log('localStorage available:', typeof global.localStorage !== 'undefined');
  }, []);

  return (
    <XIONProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </XIONProvider>
  );
}