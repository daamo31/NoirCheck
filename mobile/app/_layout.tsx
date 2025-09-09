/**
 * Layout principal de la aplicación
 * Configuración basada en abstraxion-expo-demo oficial
 */

// Importar polyfills PRIMERO - CRÍTICO para XION SDK
import "react-native-reanimated";
import "react-native-get-random-values";
import '../polyfills';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

// Buffer y crypto polyfills (basado en documentación oficial)
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Providers
import XIONProvider from '../src/providers/XIONProvider';
import { AuthProvider } from '../src/contexts/AuthContext';
import { RefreshProvider } from '../src/contexts/RefreshContext';

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
        <RefreshProvider>
          <ThemeProvider value={DarkTheme}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </RefreshProvider>
      </AuthProvider>
    </XIONProvider>
  );
}