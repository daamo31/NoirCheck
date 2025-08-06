/**
 * Metro Configuration for React Native
 * Simplified configuration for better compatibility with expo-router
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add minimal polyfill resolver for crypto modules only
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-get-random-values',
  stream: 'readable-stream',
  buffer: 'buffer',
};

// Keep default resolver settings but add source extensions
config.resolver.sourceExts.push('cjs', 'mjs');

// Minimal transformer options
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false, // Set to false to avoid conflicts
  },
});

module.exports = config;