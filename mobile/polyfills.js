/**
 * React Native Polyfills for Abstraxion/XION
 * Simple and minimal setup
 */

// Must be first import for crypto polyfill
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Setup Buffer globally
global.Buffer = Buffer;

// Simple localStorage polyfill for React Native
const storageMap = new Map();

global.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, value) => storageMap.set(key, value),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

// Minimal document/window polyfills 
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: global.localStorage
};

console.log('✅ Polyfills loaded for Abstraxion');
