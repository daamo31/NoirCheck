/**
 * Metro Configuration for React Native
 * Optimized for XION/Abstraxion integration with proper polyfill handling
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfill resolver for crypto and other Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-get-random-values',
  stream: 'readable-stream',
  buffer: 'buffer',
};

// Ensure polyfills are bundled correctly
config.resolver.platforms = ['native', 'android', 'ios'];

// Handle source map extensions
config.resolver.sourceExts.push('cjs');

// Add support for additional file extensions if needed
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;