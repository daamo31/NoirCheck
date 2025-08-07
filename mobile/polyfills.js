/**
 * Polyfills básicos para NoirCheck Mobile
 * Solo lo esencial para evitar errores de crypto
 */

// CRITICAL: Must be first import
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Setup Buffer globally
global.Buffer = Buffer;

// Setup básico de crypto
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}

// Solo getRandomValues básico
if (typeof global.crypto.getRandomValues === 'undefined') {
  try {
    const { getRandomValues } = require('react-native-get-random-values');
    global.crypto.getRandomValues = getRandomValues;
  } catch (error) {
    console.warn('react-native-get-random-values not available');
  }
}

// localStorage básico usando Map
const storageMap = new Map();

global.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, value) => storageMap.set(key, value),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

// Log básico
console.log('Buffer available:', typeof global.Buffer === 'function');
console.log('crypto.getRandomValues available:', typeof global.crypto?.getRandomValues === 'function');
console.log('localStorage available:', typeof global.localStorage === 'object');
