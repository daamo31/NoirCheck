const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configurar alias de rutas
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@/src': path.resolve(__dirname, './src'),
};

// Add support for Buffer and other Node.js polyfills
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add polyfills for Node.js globals
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
