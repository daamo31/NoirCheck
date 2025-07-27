const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configurar alias de rutas
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@/src': path.resolve(__dirname, './src'),
};

module.exports = config;
