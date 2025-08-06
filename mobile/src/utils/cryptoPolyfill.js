/**
 * Enhanced Crypto Polyfills specifically for @noble/hashes and XION
 * This file provides additional crypto polyfills that are specifically
 * needed by the @noble/hashes library used by XION SDK.
 */

// Import base crypto support
import 'react-native-get-random-values';

// Enhanced crypto namespace with all needed methods
const cryptoPolyfill = {
  getRandomValues: (array) => {
    try {
      const getRandomValues = require('react-native-get-random-values').getRandomValues;
      return getRandomValues(array);
    } catch (error) {
      console.warn('Crypto getRandomValues fallback');
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  },

  randomBytes: (size) => {
    const bytes = new Uint8Array(size);
    cryptoPolyfill.getRandomValues(bytes);
    return bytes;
  },

  randomFillSync: (buf, offset = 0, size = buf.length - offset) => {
    const randomBytes = new Uint8Array(size);
    cryptoPolyfill.getRandomValues(randomBytes);
    for (let i = 0; i < size; i++) {
      buf[offset + i] = randomBytes[i];
    }
    return buf;
  },

  // Add webcrypto-like interface for better compatibility
  subtle: {
    digest: async (algorithm, data) => {
      // This is a placeholder - real crypto operations would need native implementation
      console.warn('crypto.subtle.digest is not fully implemented in React Native');
      return new ArrayBuffer(32); // Mock SHA-256 hash length
    }
  }
};

// Setup enhanced global crypto
global.crypto = {
  ...global.crypto,
  ...cryptoPolyfill
};

// Export for direct use if needed
export default cryptoPolyfill;
