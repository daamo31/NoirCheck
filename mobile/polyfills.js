/**
 * React Native Polyfills for Abstraxion/XION Integration
 * 
 * This file provides essential polyfills required for XION blockchain integration
 * in React Native environments. These polyfills bridge the gap between web APIs
 * expected by XION SDK and React Native's limited global object support.
 * 
 * @requires react-native-get-random-values - Crypto random values polyfill
 * @requires buffer - Node.js Buffer polyfill for React Native
 */

// CRITICAL: Must be first import to ensure crypto polyfill is available
// before any other modules that might need it (like XION SDK components)
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Setup Buffer globally for XION SDK compatibility
// Many blockchain libraries expect Buffer to be available globally
global.Buffer = Buffer;

// Additional crypto polyfills for secure random number generation
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}

// Ensure getRandomValues is available
if (typeof global.crypto.getRandomValues === 'undefined') {
  try {
    // Import crypto from react-native-get-random-values
    const { getRandomValues } = require('react-native-get-random-values');
    global.crypto.getRandomValues = getRandomValues;
  } catch (error) {
    console.warn('Failed to setup crypto.getRandomValues:', error);
  }
}

// Setup TextEncoder and TextDecoder for crypto operations
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('text-encoding').TextDecoder;
}

/**
 * localStorage Polyfill for React Native
 * 
 * XION SDK components may expect localStorage to be available.
 * This provides a minimal in-memory implementation using Map.
 * 
 * Note: This is session-only storage and will be cleared on app restart.
 * For persistent storage, use AsyncStorage in your application logic.
 */
const storageMap = new Map();

global.localStorage = {
  /**
   * Retrieve a value from storage
   * @param {string} key - Storage key
   * @returns {string|null} Stored value or null if not found
   */
  getItem: (key) => storageMap.get(key) || null,
  
  /**
   * Store a value
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem: (key, value) => storageMap.set(key, value),
  
  /**
   * Remove a value from storage
   * @param {string} key - Storage key to remove
   */
  removeItem: (key) => storageMap.delete(key),
  
  /**
   * Clear all stored values
   */
  clear: () => storageMap.clear()
};

/**
 * Minimal DOM API Polyfills
 * 
 * Some web-based libraries may attempt to access document or window objects.
 * These minimal polyfills prevent errors by providing no-op implementations.
 */
global.document = {
  // Prevent errors when libraries try to add event listeners to document
  addEventListener: () => {},
  removeEventListener: () => {},
  
  // Some libraries check for document.createElement
  createElement: () => ({}),
  
  // Minimal body object for libraries that check document.body
  body: {}
};

global.window = {
  // Prevent errors when libraries try to add event listeners to window
  addEventListener: () => {},
  removeEventListener: () => {},
  
  // Make localStorage available on window object as expected by some libraries
  localStorage: global.localStorage,
  
  // Some libraries check for window.document
  document: global.document,
  
  // Minimal location object
  location: {
    href: '',
    origin: '',
    protocol: 'https:',
    host: '',
    pathname: '/'
  }
};

// Log successful polyfill loading for debugging
console.log('✅ XION/Abstraxion polyfills loaded successfully');
console.log('📦 Available globals: Buffer, localStorage, document, window, crypto');
console.log('🔐 Crypto getRandomValues available:', typeof global.crypto?.getRandomValues === 'function');
console.log('📝 TextEncoder/TextDecoder available:', typeof global.TextEncoder === 'function');
