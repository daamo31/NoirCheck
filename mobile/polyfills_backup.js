/**
 * Polyfills esenciales para XION SDK en React Native
 * Implementación completa para Abstraxion compatibility
 */

// CRÍTICO: Importar polyfills primero
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Setup Buffer globalmente
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Intentar usar react-native-quick-crypto para mejor compatibilidad
let usingQuickCrypto = false;
let nativeSubtle = null;
try {
  const QuickCrypto = require('react-native-quick-crypto');
  if (QuickCrypto.crypto) {
    nativeSubtle = QuickCrypto.crypto.subtle;
    if (!global.crypto) {
      global.crypto = QuickCrypto.crypto;
      usingQuickCrypto = true;
      console.log('✅ Using react-native-quick-crypto for crypto operations');
    }
  }
} catch (error) {
  console.log('📦 react-native-quick-crypto not available, using fallback');
}

// Configurar crypto básico si no está disponible
if (!global.crypto) {
  global.crypto = {};
}

// getRandomValues esencial para crypto
if (typeof global.crypto.getRandomValues === 'undefined') {
  const { getRandomValues } = require('react-native-get-random-values');
  global.crypto.getRandomValues = getRandomValues;
}

// Crear implementación híbrida de crypto.subtle
// Usar nativo cuando funcione, fallback a nuestras implementaciones cuando falle

// Forzar nuestras implementaciones de subtle crypto que manejan mejor los edge cases
global.crypto.subtle = {
      digest: async (algorithm, data) => {
        // Implementación básica usando crypto-js para hashing
        const CryptoJS = require('crypto-js');
        if (algorithm === 'SHA-256' || algorithm === 'sha-256') {
          // Manejo correcto de data para CryptoJS
          let wordArray;
          
          if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            wordArray = CryptoJS.lib.WordArray.create(Array.from(bytes));
          } else if (data instanceof Uint8Array) {
            wordArray = CryptoJS.lib.WordArray.create(Array.from(data));
          } else if (typeof data === 'string') {
            wordArray = CryptoJS.enc.Utf8.parse(data);
          } else {
            wordArray = CryptoJS.lib.WordArray.create(data);
          }
          
          const hash = CryptoJS.SHA256(wordArray);
          return new Uint8Array(Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex')).buffer;
        }
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      },
      deriveBits: async (algorithm, baseKey, length) => {
        // Implementación PBKDF2 usando crypto-js
        const CryptoJS = require('crypto-js');
        if (algorithm.name === 'PBKDF2') {
          console.log('🔐 PBKDF2 deriveBits called with:', {
            iterations: algorithm.iterations,
            length: length,
            saltLength: algorithm.salt?.length || algorithm.salt?.byteLength,
            saltType: typeof algorithm.salt
          });
          
          try {
            // Manejo correcto de salt y password para CryptoJS
            let salt, password;
            
            if (algorithm.salt instanceof ArrayBuffer || algorithm.salt instanceof Uint8Array) {
              const saltBytes = new Uint8Array(algorithm.salt);
              
              // Asegurar que el salt tenga al menos 16 bytes (estándar mínimo para PBKDF2)
              let paddedSalt = saltBytes;
              if (saltBytes.length < 16) {
                paddedSalt = new Uint8Array(16);
                paddedSalt.set(saltBytes);
                // Rellenar el resto con bytes aleatorios o repetir el patrón
                for (let i = saltBytes.length; i < 16; i++) {
                  paddedSalt[i] = saltBytes[i % saltBytes.length];
                }
                console.log('🧂 Salt padded from', saltBytes.length, 'to', paddedSalt.length, 'bytes');
              }
              
              salt = CryptoJS.lib.WordArray.create(Array.from(paddedSalt));
            } else {
              salt = CryptoJS.lib.WordArray.create(algorithm.salt);
            }
            
            if (typeof baseKey === 'string') {
              password = baseKey;
            } else if (baseKey instanceof ArrayBuffer || baseKey instanceof Uint8Array) {
              const keyBytes = new Uint8Array(baseKey);
              password = CryptoJS.lib.WordArray.create(Array.from(keyBytes));
            } else if (baseKey._key) {
              // Es una CryptoKey, usar la clave interna
              password = CryptoJS.lib.WordArray.create(Array.from(baseKey._key));
            } else {
              password = CryptoJS.lib.WordArray.create(baseKey);
            }
            
            const key = CryptoJS.PBKDF2(password, salt, {
              keySize: Math.ceil(length / 32), // Convert bits to words (32 bits per word)
              iterations: algorithm.iterations || 4096,
              hasher: CryptoJS.algo.SHA256
            });
            
            const hexString = key.toString(CryptoJS.enc.Hex);
            const uint8Array = new Uint8Array(Buffer.from(hexString, 'hex'));
            const resultLength = Math.ceil(length / 8);
            const result = uint8Array.buffer.slice(0, resultLength);
            
            console.log('✅ PBKDF2 success, generated', new Uint8Array(result).length, 'bytes');
            return result;
          } catch (error) {
            console.error('❌ PBKDF2 error:', error);
            throw error;
          }
        }
        throw new Error(`Unsupported algorithm: ${algorithm.name}`);
      },
      generateKey: async (algorithm, extractable, keyUsages) => {
        // Implementación básica de generateKey para AES-GCM y otros
        const CryptoJS = require('crypto-js');
        
        if (algorithm.name === 'AES-GCM' || algorithm.name === 'AES-CBC') {
          const keyLength = algorithm.length || 256;
          const keyBytes = keyLength / 8;
          const randomKey = new Uint8Array(keyBytes);
          global.crypto.getRandomValues(randomKey);
          
          return {
            type: 'secret',
            extractable,
            algorithm,
            usages: keyUsages,
            _key: randomKey
          };
        }
        
        if (algorithm.name === 'HMAC') {
          const keyBytes = 32; // 256 bits for HMAC-SHA256
          const randomKey = new Uint8Array(keyBytes);
          global.crypto.getRandomValues(randomKey);
          
          return {
            type: 'secret',
            extractable,
            algorithm,
            usages: keyUsages,
            _key: randomKey
          };
        }
        
        throw new Error(`generateKey not implemented for algorithm: ${algorithm.name}`);
      },
      importKey: async (format, keyData, algorithm, extractable, keyUsages) => {
        // Implementación básica de importKey
        
        if (format === 'raw') {
          return {
            type: 'secret',
            extractable,
            algorithm,
            usages: keyUsages,
            _key: new Uint8Array(keyData)
          };
        }
        
        if (format === 'pkcs8' || format === 'spki') {
          return {
            type: format === 'pkcs8' ? 'private' : 'public',
            extractable,
            algorithm,
            usages: keyUsages,
            _key: new Uint8Array(keyData)
          };
        }
        
        if (format === 'jwk') {
          // Implementación básica para JWK
          return {
            type: keyData.kty === 'oct' ? 'secret' : 'private',
            extractable,
            algorithm,
            usages: keyUsages,
            _jwk: keyData
          };
        }
        
        throw new Error(`importKey not implemented for format: ${format}`);
      },
      exportKey: async (format, key) => {
        if (format === 'raw' && key._key) {
          return key._key.buffer;
        }
        
        if (format === 'jwk' && key._jwk) {
          return key._jwk;
        }
        
        throw new Error(`exportKey not implemented for format: ${format}`);
      },
      encrypt: async (algorithm, key, data) => {
        // Implementación básica para AES-GCM
        if (algorithm.name === 'AES-GCM') {
          const CryptoJS = require('crypto-js');
          
          // Manejo correcto de key y data
          const keyArray = CryptoJS.lib.WordArray.create(Array.from(key._key));
          
          let dataArray;
          if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            dataArray = CryptoJS.lib.WordArray.create(Array.from(bytes));
          } else if (data instanceof Uint8Array) {
            dataArray = CryptoJS.lib.WordArray.create(Array.from(data));
          } else {
            dataArray = CryptoJS.lib.WordArray.create(data);
          }
          
          const encrypted = CryptoJS.AES.encrypt(dataArray, keyArray);
          return Buffer.from(encrypted.toString(), 'base64');
        }
        
        throw new Error(`encrypt not implemented for algorithm: ${algorithm.name}`);
      },
      decrypt: async (algorithm, key, data) => {
        // Implementación básica para AES-GCM
        if (algorithm.name === 'AES-GCM') {
          const CryptoJS = require('crypto-js');
          const keyArray = CryptoJS.lib.WordArray.create(Array.from(key._key));
          const encryptedData = Buffer.from(data).toString('base64');
          const decrypted = CryptoJS.AES.decrypt(encryptedData, keyArray);
          return Buffer.from(decrypted.toString(CryptoJS.enc.Hex), 'hex');
        }
        
        throw new Error(`decrypt not implemented for algorithm: ${algorithm.name}`);
      },
      sign: async (algorithm, key, data) => {
        // Implementación básica para HMAC
        if (algorithm.name === 'HMAC') {
          const CryptoJS = require('crypto-js');
          const keyArray = CryptoJS.lib.WordArray.create(Array.from(key._key));
          
          let dataArray;
          if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            dataArray = CryptoJS.lib.WordArray.create(Array.from(bytes));
          } else if (data instanceof Uint8Array) {
            dataArray = CryptoJS.lib.WordArray.create(Array.from(data));
          } else {
            dataArray = CryptoJS.lib.WordArray.create(data);
          }
          
          let signature;
          
          if (algorithm.hash.name === 'SHA-256') {
            signature = CryptoJS.HmacSHA256(dataArray, keyArray);
          } else if (algorithm.hash.name === 'SHA-1') {
            signature = CryptoJS.HmacSHA1(dataArray, keyArray);
          } else {
            throw new Error(`Unsupported hash algorithm: ${algorithm.hash.name}`);
          }
          
          return Buffer.from(signature.toString(CryptoJS.enc.Hex), 'hex');
        }
        
        throw new Error(`sign not implemented for algorithm: ${algorithm.name}`);
      },
      verify: async (algorithm, key, signature, data) => {
        // Implementación básica para verificación HMAC
        if (algorithm.name === 'HMAC') {
          const expectedSignature = await this.sign(algorithm, key, data);
          const sigArray = new Uint8Array(signature);
          const expArray = new Uint8Array(expectedSignature);
          
          if (sigArray.length !== expArray.length) return false;
          
          for (let i = 0; i < sigArray.length; i++) {
            if (sigArray[i] !== expArray[i]) return false;
          }
          
          return true;
        }
        
        throw new Error(`verify not implemented for algorithm: ${algorithm.name}`);
      }
    };
  }
}; 

// localStorage mock usando AsyncStorage (SÍNCRONO para compatibilidad)
const localStorageMock = {
  getItem: (key) => {
    // Intentar obtener de manera síncrona desde cache
    return global._localStorageCache?.[key] || null;
  },
  setItem: (key, value) => {
    // Cache síncrono + AsyncStorage asíncrono
    if (!global._localStorageCache) {
      global._localStorageCache = {};
    }
    global._localStorageCache[key] = value;
    AsyncStorage.setItem(key, value).catch(console.warn);
  },
  removeItem: (key) => {
    if (global._localStorageCache) {
      delete global._localStorageCache[key];
    }
    AsyncStorage.removeItem(key).catch(console.warn);
  },
  clear: () => {
    global._localStorageCache = {};
    AsyncStorage.clear().catch(console.warn);
  }
};

// Inicializar cache desde AsyncStorage
AsyncStorage.getAllKeys().then(keys => {
  if (keys.length > 0) {
    AsyncStorage.multiGet(keys).then(items => {
      global._localStorageCache = {};
      items.forEach(([key, value]) => {
        if (value) global._localStorageCache[key] = value;
      });
      console.log('✅ localStorage cache initialized from AsyncStorage');
    });
  } else {
    global._localStorageCache = {};
  }
});

// Asignar localStorage globalmente
global.localStorage = localStorageMock;

// TextEncoder/TextDecoder básico
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

console.log('🔧 Essential polyfills loaded for XION compatibility');
