/**
 * Metro Configuration for React Native
 * Basado en abstraxion-expo-demo oficial
 */

const { getDefaultConfig } = require("expo/metro-config");
const {
  withLibsodiumResolver,
} = require("@burnt-labs/abstraxion-react-native/metro.libsodium");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = false;

// Agregar alias para polyfills
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-quick-crypto',
  stream: 'stream-browserify',
  buffer: 'buffer',
};

// Configurar polyfills globales
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withLibsodiumResolver(config);