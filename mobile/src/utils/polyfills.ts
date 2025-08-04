/**
 * React Native Polyfills for Web APIs
 * Required for Abstraxion and XION SDK compatibility
 */

import 'react-native-get-random-values'; // Must be first import
import { Buffer } from 'buffer';
import { sha256 } from '@noble/hashes/sha256';

// Make Buffer global for compatibility with Node.js libraries
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

// Crypto polyfill for React Native
const crypto = {
  subtle: {
    digest: async (algorithm: string, data: ArrayBuffer): Promise<ArrayBuffer> => {
      if (algorithm === 'SHA-256') {
        const uint8Array = new Uint8Array(data);
        const hash = sha256(uint8Array);
        
        // Convert the hash result to a proper ArrayBuffer
        const hashBuffer = new ArrayBuffer(hash.length);
        const hashView = new Uint8Array(hashBuffer);
        hashView.set(hash);
        
        return hashBuffer;
      }
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  },
  getRandomValues: (array: Uint8Array): Uint8Array => {
    // This is already handled by react-native-get-random-values
    if (typeof global !== 'undefined' && global.crypto && global.crypto.getRandomValues) {
      return global.crypto.getRandomValues(array);
    }
    throw new Error('crypto.getRandomValues not available');
  }
};

// Make crypto globally available
if (typeof global !== 'undefined') {
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

console.log('🔧 React Native polyfills loaded for Abstraxion compatibility (with Buffer support)');
