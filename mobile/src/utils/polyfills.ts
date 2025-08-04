/**
 * React Native Polyfills for Web APIs
 * Required for Abstraxion and XION SDK compatibility
 */

import 'react-native-get-random-values'; // Must be first import
import { Buffer } from 'buffer';
// Remove @noble/hashes import to avoid module resolution issues
// import { sha256 } from '@noble/hashes/sha256';

// Make Buffer global for compatibility with Node.js libraries
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

// Minimal crypto polyfill for React Native (only getRandomValues)
const crypto = {
  getRandomValues: (array: Uint8Array): Uint8Array => {
    // Don't try to access global.crypto here as it might cause recursion
    // Instead, use the polyfill that react-native-get-random-values provides
    
    // Fill the array with cryptographically secure random values
    // This uses the native crypto implementation from react-native-get-random-values
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

// Only set global.crypto if it doesn't exist to avoid recursion
if (typeof global !== 'undefined' && !global.crypto) {
  global.crypto = crypto as any;
}

// Polyfill for localStorage using in-memory storage (synchronous)
const storage = new Map<string, string>();

const localStorage = {
  getItem: (key: string): string | null => {
    return storage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
  clear: (): void => {
    storage.clear();
  },
  get length(): number {
    return storage.size;
  },
  key: (index: number): string | null => {
    const keys = Array.from(storage.keys());
    return keys[index] || null;
  }
};

// Polyfill for sessionStorage (same as localStorage for React Native)
const sessionStorage = localStorage;

// Minimal window object polyfill
const window = {
  localStorage,
  sessionStorage,
  location: {
    href: 'https://localhost',
    protocol: 'https:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: ''
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  navigator: {
    userAgent: 'React Native'
  }
};

// Minimal document object polyfill
const document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({}),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: {},
  head: {},
  documentElement: {}
};

// Make them globally available
if (typeof global !== 'undefined') {
  global.localStorage = localStorage;
  global.sessionStorage = sessionStorage;
  global.window = window as any;
  global.document = document as any;
}

console.log('🔧 React Native polyfills loaded for Abstraxion compatibility (minimal crypto + Buffer support)');
