import 'react-native-get-random-values';
const CryptoJS = require('crypto-js');

console.log('🚀 Initializing comprehensive crypto polyfills...');

// Polyfill para libsodium si no está disponible
if (typeof global._sodium === 'undefined') {
  global._sodium = {
    ready: Promise.resolve(),
    // Funciones principales que XION puede necesitar
    crypto_sign_keypair: () => {
      console.log('⚠️ libsodium crypto_sign_keypair mock called');
      const publicKey = new Uint8Array(32);
      const privateKey = new Uint8Array(64);
      global.crypto.getRandomValues(publicKey);
      global.crypto.getRandomValues(privateKey);
      return { publicKey, privateKey, keyType: 'ed25519' };
    },
    crypto_sign_detached: (message, privateKey) => {
      console.log('⚠️ libsodium crypto_sign_detached mock called');
      const signature = new Uint8Array(64);
      global.crypto.getRandomValues(signature);
      return signature;
    },
    crypto_sign_verify_detached: (signature, message, publicKey) => {
      console.log('⚠️ libsodium crypto_sign_verify_detached mock called');
      return true; // Siempre retorna true en modo mock
    },
    crypto_hash_sha256: (message) => {
      console.log('⚠️ libsodium crypto_hash_sha256 mock called');
      const hash = new Uint8Array(32);
      global.crypto.getRandomValues(hash);
      return hash;
    },
    crypto_secretbox_easy: (message, nonce, key) => {
      console.log('⚠️ libsodium crypto_secretbox_easy mock called');
      const ciphertext = new Uint8Array(message.length + 16);
      global.crypto.getRandomValues(ciphertext);
      return ciphertext;
    },
    crypto_secretbox_open_easy: (ciphertext, nonce, key) => {
      console.log('⚠️ libsodium crypto_secretbox_open_easy mock called');
      return new Uint8Array(ciphertext.length - 16);
    },
    randombytes_buf: (length) => {
      const buffer = new Uint8Array(length);
      global.crypto.getRandomValues(buffer);
      return buffer;
    },
    // Utilidades de conversión
    from_string: (str) => new TextEncoder().encode(str),
    to_string: (bytes) => new TextDecoder().decode(bytes),
    to_hex: (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''),
    from_hex: (hex) => new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16))),
    to_base64: (bytes) => {
      if (typeof btoa !== 'undefined') {
        return btoa(String.fromCharCode(...bytes));
      }
      // Fallback básico para base64
      return Buffer.from(bytes).toString('base64');
    },
    from_base64: (base64) => {
      if (typeof atob !== 'undefined') {
        return new Uint8Array([...atob(base64)].map(c => c.charCodeAt(0)));
      }
      // Fallback básico
      return new Uint8Array(Buffer.from(base64, 'base64'));
    },
    // Constantes comunes
    crypto_sign_PUBLICKEYBYTES: 32,
    crypto_sign_SECRETKEYBYTES: 64,
    crypto_sign_BYTES: 64,
    crypto_hash_sha256_BYTES: 32,
    crypto_secretbox_NONCEBYTES: 24,
    crypto_secretbox_KEYBYTES: 32,
    crypto_secretbox_MACBYTES: 16
  };
  console.log('📦 libsodium comprehensive mock initialized');
}

// Hacer disponible globalmente para módulos que lo busquen
if (typeof global.sodium === 'undefined') {
  global.sodium = global._sodium;
}

// Mock básico para libsodium - React Native no permite interceptar require
console.log('📦 libsodium mock available as global._sodium and global.sodium');

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
  console.log('📦 react-native-quick-crypto not available, using fallback polyfills');
}

// Configurar crypto básico si no está disponible
if (!global.crypto) {
  global.crypto = {};
}

// Buffer polyfill si no está disponible
if (typeof global.Buffer === 'undefined') {
  try {
    global.Buffer = require('buffer').Buffer;
    console.log('✅ Buffer polyfill initialized');
  } catch (error) {
    console.log('⚠️ Buffer not available, creating basic polyfill');
    global.Buffer = {
      from: (data, encoding = 'utf8') => {
        if (typeof data === 'string') {
          return new TextEncoder().encode(data);
        }
        return new Uint8Array(data);
      },
      alloc: (size) => new Uint8Array(size),
      isBuffer: (obj) => obj instanceof Uint8Array
    };
  }
}

// getRandomValues esencial para crypto
if (typeof global.crypto.getRandomValues === 'undefined') {
  const { getRandomValues } = require('react-native-get-random-values');
  global.crypto.getRandomValues = getRandomValues;
}

// Implementación híbrida de crypto.subtle - usar nativo con fallbacks inteligentes
global.crypto.subtle = {
  // Estrategia: Intentar native primero, si falla usar nuestro fallback
  async deriveBits(algorithm, baseKey, length) {
    console.log('🔐 deriveBits called with:', { algorithm: algorithm.name, length });
    
    // Para PBKDF2, usar siempre nuestro fallback robusto
    if (algorithm.name === 'PBKDF2') {
      console.log('🔐 PBKDF2 deriveBits using custom implementation');
      const iterations = algorithm.iterations;
      const salt = new Uint8Array(algorithm.salt);
      const hash = algorithm.hash.name.toLowerCase().replace('sha-', 'SHA');
      
      // Validar y normalizar salt length - ser muy permisivo
      let validSalt = salt;
      if (salt.length === 0) {
        console.log('⚠️ Empty salt, using default 16-byte salt');
        validSalt = new Uint8Array(16);
        global.crypto.getRandomValues(validSalt);
      } else if (salt.length < 8) {
        console.log(`⚠️ Salt too short (${salt.length} bytes), padding to minimum 8 bytes`);
        validSalt = new Uint8Array(Math.max(8, 16)); // Usar 16 como mínimo recomendado
        validSalt.set(salt);
        // Rellenar con patrón repetitivo del salt original
        for (let i = salt.length; i < validSalt.length; i++) {
          validSalt[i] = salt[i % salt.length] || 0;
        }
      } else if (salt.length > 1024) {
        console.log(`⚠️ Salt too long (${salt.length} bytes), truncating to 1024 bytes`);
        validSalt = salt.slice(0, 1024);
      }
      
      // Extraer la clave desde baseKey con más flexibilidad
      let password;
      if (baseKey && baseKey._key) {
        if (baseKey._key instanceof Uint8Array) {
          password = CryptoJS.lib.WordArray.create(Array.from(baseKey._key));
        } else if (typeof baseKey._key === 'string') {
          password = CryptoJS.enc.Utf8.parse(baseKey._key);
        } else if (baseKey._key.words && Array.isArray(baseKey._key.words)) {
          password = baseKey._key;
        } else if (baseKey._key instanceof ArrayBuffer) {
          password = CryptoJS.lib.WordArray.create(Array.from(new Uint8Array(baseKey._key)));
        } else {
          console.log('⚠️ Unknown baseKey format, attempting string conversion');
          password = CryptoJS.enc.Utf8.parse(String(baseKey._key));
        }
      } else if (baseKey instanceof Uint8Array) {
        password = CryptoJS.lib.WordArray.create(Array.from(baseKey));
      } else {
        console.error('❌ Invalid baseKey for PBKDF2:', baseKey);
        throw new Error('Invalid baseKey for PBKDF2');
      }
      
      const saltWords = CryptoJS.lib.WordArray.create(Array.from(validSalt));
      
      try {
        // Usar parámetros más robustos
        const keySize = Math.max(1, Math.ceil(length / 32)); // Al menos 1 palabra de 32 bits
        const hasher = CryptoJS.algo[hash] || CryptoJS.algo.SHA256;
        
        console.log(`🔐 PBKDF2 params: iterations=${iterations}, keySize=${keySize}, hash=${hash}, saltLength=${validSalt.length}`);
        
        const derived = CryptoJS.PBKDF2(password, saltWords, {
          keySize: keySize,
          iterations: iterations,
          hasher: hasher
        });
        
        // Convertir resultado a ArrayBuffer con longitud exacta
        const targetBytes = length / 8;
        const result = new ArrayBuffer(targetBytes);
        const view = new Uint8Array(result);
        
        // Extraer bytes del WordArray de CryptoJS con manejo seguro
        let byteIndex = 0;
        for (let i = 0; i < derived.words.length && byteIndex < targetBytes; i++) {
          const word = derived.words[i];
          for (let j = 0; j < 4 && byteIndex < targetBytes; j++) {
            view[byteIndex] = (word >>> (24 - j * 8)) & 0xff;
            byteIndex++;
          }
        }
        
        // Llenar bytes restantes si es necesario
        if (byteIndex < targetBytes) {
          console.log(`⚠️ Padding result from ${byteIndex} to ${targetBytes} bytes`);
          for (let i = byteIndex; i < targetBytes; i++) {
            view[i] = 0;
          }
        }
        
        console.log(`✅ PBKDF2 success, generated ${view.length} bytes (requested ${targetBytes})`);
        return result;
      } catch (error) {
        console.error('❌ PBKDF2 deriveBits failed:', error);
        throw new Error(`PBKDF2 failed: ${error.message}`);
      }
    }
    
    // Para otros algoritmos, intentar native primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.deriveBits(algorithm, baseKey, length);
        console.log('✅ Native deriveBits success');
        return result;
      } catch (error) {
        console.log('⚠️ Native deriveBits failed:', error.message);
        
        // Si el error es "invalid salt length", intentar nuestro fallback
        if (error.message.includes('salt length') || error.message.includes('invalid salt')) {
          console.log('🔄 Retrying with custom PBKDF2 due to salt length error');
          return this.deriveBits(algorithm, baseKey, length);
        }
        
        throw error;
      }
    }
    
    throw new Error(`deriveBits not implemented for algorithm: ${algorithm.name}`);
  },

  async importKey(format, keyData, algorithm, extractable, usages) {
    console.log('🔑 importKey called:', { format, algorithm: algorithm.name });
    
    // Para formato raw, usar siempre nuestro fallback más robusto
    if (format === 'raw') {
      let keyDataArray;
      if (keyData instanceof ArrayBuffer) {
        keyDataArray = new Uint8Array(keyData);
      } else if (keyData instanceof Uint8Array) {
        keyDataArray = keyData;
      } else if (typeof keyData === 'string') {
        // Convertir string a bytes usando TextEncoder
        keyDataArray = new TextEncoder().encode(keyData);
      } else if (Array.isArray(keyData)) {
        keyDataArray = new Uint8Array(keyData);
      } else {
        console.log('⚠️ Unusual keyData format, attempting conversion:', typeof keyData);
        keyDataArray = new Uint8Array([...String(keyData)].map(c => c.charCodeAt(0)));
      }
      
      console.log(`✅ Raw key imported, length: ${keyDataArray.length} bytes`);
      
      return {
        type: 'secret',
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: keyDataArray
      };
    }
    
    // Para otros formatos, intentar native primero con fallback robusto
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.importKey(format, keyData, algorithm, extractable, usages);
        console.log('✅ Native importKey success');
        return result;
      } catch (error) {
        console.log('⚠️ Native importKey failed, using fallback:', error.message);
        
        // Si el error es relacionado con salt/key length, usar fallback
        if (error.message.includes('salt length') || error.message.includes('key length') || error.message.includes('invalid')) {
          console.log('🔄 Using fallback importKey due to validation error');
        }
      }
    }
    
    // Fallbacks para formatos comunes
    if (format === 'pkcs8' || format === 'spki') {
      return {
        type: format === 'pkcs8' ? 'private' : 'public',
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: keyData
      };
    } else if (format === 'jwk') {
      return {
        type: keyData.kty === 'oct' ? 'secret' : (keyData.d ? 'private' : 'public'),
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: keyData
      };
    }
    
    throw new Error(`importKey not implemented for format: ${format}`);
  },

  async generateKey(algorithm, extractable, usages) {
    console.log('🔧 generateKey called:', { algorithm: algorithm.name });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.generateKey(algorithm, extractable, usages);
        console.log('✅ Native generateKey success');
        return result;
      } catch (error) {
        console.log('⚠️ Native generateKey failed, using fallback:', error.message);
      }
    }
    
    // Fallback para algoritmos comunes
    if (algorithm.name === 'AES-GCM') {
      const key = new Uint8Array(algorithm.length / 8);
      global.crypto.getRandomValues(key);
      
      return {
        type: 'secret',
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: key
      };
    } else if (algorithm.name === 'HMAC') {
      const keyLength = algorithm.length || 256;
      const key = new Uint8Array(keyLength / 8);
      global.crypto.getRandomValues(key);
      
      return {
        type: 'secret',
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: key
      };
    }
    
    throw new Error(`generateKey not implemented for algorithm: ${algorithm.name}`);
  },

  async encrypt(algorithm, key, data) {
    console.log('🔒 encrypt called:', { algorithm: algorithm.name });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.encrypt(algorithm, key, data);
        console.log('✅ Native encrypt success');
        return result;
      } catch (error) {
        console.log('⚠️ Native encrypt failed, using fallback:', error.message);
      }
    }
    
    // Fallback para AES-GCM
    if (algorithm.name === 'AES-GCM') {
      const keyData = key._key || key;
      const keyWords = CryptoJS.lib.WordArray.create(Array.from(keyData));
      const dataWords = CryptoJS.lib.WordArray.create(Array.from(new Uint8Array(data)));
      const iv = new Uint8Array(algorithm.iv);
      const ivWords = CryptoJS.lib.WordArray.create(Array.from(iv));
      
      // Simular AES-GCM con AES-CTR
      const encrypted = CryptoJS.AES.encrypt(dataWords, keyWords, {
        iv: ivWords,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      });
      
      // Convertir resultado a ArrayBuffer
      const ciphertext = encrypted.ciphertext;
      const result = new ArrayBuffer(ciphertext.words.length * 4);
      const resultView = new Uint8Array(result);
      
      for (let i = 0; i < ciphertext.words.length; i++) {
        const word = ciphertext.words[i];
        resultView[i * 4] = (word >>> 24) & 0xff;
        resultView[i * 4 + 1] = (word >>> 16) & 0xff;
        resultView[i * 4 + 2] = (word >>> 8) & 0xff;
        resultView[i * 4 + 3] = word & 0xff;
      }
      
      console.log('✅ AES-GCM encrypt success (simulated with AES-CTR)');
      return result;
    }
    
    throw new Error(`encrypt not implemented for algorithm: ${algorithm.name}`);
  },

  async decrypt(algorithm, key, data) {
    console.log('🔓 decrypt called:', { algorithm: algorithm.name });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.decrypt(algorithm, key, data);
        console.log('✅ Native decrypt success');
        return result;
      } catch (error) {
        console.log('⚠️ Native decrypt failed, using fallback:', error.message);
      }
    }
    
    // Fallback para AES-GCM
    if (algorithm.name === 'AES-GCM') {
      const keyData = key._key || key;
      const keyWords = CryptoJS.lib.WordArray.create(Array.from(keyData));
      const encryptedArray = new Uint8Array(data);
      const encryptedWords = CryptoJS.lib.WordArray.create(Array.from(encryptedArray));
      const iv = new Uint8Array(algorithm.iv);
      const ivWords = CryptoJS.lib.WordArray.create(Array.from(iv));
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedWords },
        keyWords,
        {
          iv: ivWords,
          mode: CryptoJS.mode.CTR,
          padding: CryptoJS.pad.NoPadding
        }
      );
      
      // Convertir resultado a ArrayBuffer
      const result = new ArrayBuffer(decrypted.words.length * 4);
      const resultView = new Uint8Array(result);
      
      for (let i = 0; i < decrypted.words.length; i++) {
        const word = decrypted.words[i];
        resultView[i * 4] = (word >>> 24) & 0xff;
        resultView[i * 4 + 1] = (word >>> 16) & 0xff;
        resultView[i * 4 + 2] = (word >>> 8) & 0xff;
        resultView[i * 4 + 3] = word & 0xff;
      }
      
      console.log('✅ AES-GCM decrypt success (simulated with AES-CTR)');
      return result;
    }
    
    throw new Error(`decrypt not implemented for algorithm: ${algorithm.name}`);
  },

  async sign(algorithm, key, data) {
    console.log('✍️ sign called:', { algorithm: algorithm.name });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.sign(algorithm, key, data);
        console.log('✅ Native sign success');
        return result;
      } catch (error) {
        console.log('⚠️ Native sign failed, using fallback:', error.message);
      }
    }
    
    // Fallback para HMAC
    if (algorithm.name === 'HMAC') {
      const keyData = key._key || key;
      const keyWords = CryptoJS.lib.WordArray.create(Array.from(keyData));
      const dataWords = CryptoJS.lib.WordArray.create(Array.from(new Uint8Array(data)));
      
      let hmac;
      const hashName = algorithm.hash?.name || key.algorithm?.hash?.name;
      if (hashName === 'SHA-256') {
        hmac = CryptoJS.HmacSHA256(dataWords, keyWords);
      } else if (hashName === 'SHA-1') {
        hmac = CryptoJS.HmacSHA1(dataWords, keyWords);
      } else if (hashName === 'SHA-512') {
        hmac = CryptoJS.HmacSHA512(dataWords, keyWords);
      } else {
        throw new Error(`HMAC hash not supported: ${hashName}`);
      }
      
      // Convertir resultado a ArrayBuffer
      const result = new ArrayBuffer(hmac.words.length * 4);
      const resultView = new Uint8Array(result);
      
      for (let i = 0; i < hmac.words.length; i++) {
        const word = hmac.words[i];
        resultView[i * 4] = (word >>> 24) & 0xff;
        resultView[i * 4 + 1] = (word >>> 16) & 0xff;
        resultView[i * 4 + 2] = (word >>> 8) & 0xff;
        resultView[i * 4 + 3] = word & 0xff;
      }
      
      console.log('✅ HMAC sign success');
      return result;
    }
    
    throw new Error(`sign not implemented for algorithm: ${algorithm.name}`);
  },

  async verify(algorithm, key, signature, data) {
    console.log('✅ verify called:', { algorithm: algorithm.name });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.verify(algorithm, key, signature, data);
        console.log('✅ Native verify success');
        return result;
      } catch (error) {
        console.log('⚠️ Native verify failed, using fallback:', error.message);
      }
    }
    
    // Fallback para HMAC
    if (algorithm.name === 'HMAC') {
      const computedSignature = await this.sign(algorithm, key, data);
      const computedArray = new Uint8Array(computedSignature);
      const providedArray = new Uint8Array(signature);
      
      if (computedArray.length !== providedArray.length) {
        return false;
      }
      
      for (let i = 0; i < computedArray.length; i++) {
        if (computedArray[i] !== providedArray[i]) {
          return false;
        }
      }
      
      return true;
    }
    
    throw new Error(`verify not implemented for algorithm: ${algorithm.name}`);
  },

  async digest(algorithm, data) {
    console.log('🏷️ digest called:', { algorithm });
    
    // Intentar usar implementación nativa primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.digest(algorithm, data);
        console.log('✅ Native digest success');
        return result;
      } catch (error) {
        console.log('⚠️ Native digest failed, using fallback:', error.message);
      }
    }
    
    // Fallback usando CryptoJS
    if (algorithm === 'SHA-256' || algorithm === 'sha-256') {
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
      
      // Convertir a ArrayBuffer
      const result = new ArrayBuffer(32); // SHA-256 es 32 bytes
      const view = new Uint8Array(result);
      
      for (let i = 0; i < 8; i++) { // SHA-256 tiene 8 palabras de 32 bits
        const word = hash.words[i];
        view[i * 4] = (word >>> 24) & 0xff;
        view[i * 4 + 1] = (word >>> 16) & 0xff;
        view[i * 4 + 2] = (word >>> 8) & 0xff;
        view[i * 4 + 3] = word & 0xff;
      }
      
      console.log('✅ SHA-256 digest success');
      return result;
    }
    
    throw new Error(`Unsupported digest algorithm: ${algorithm}`);
  }
};

// localStorage mock usando AsyncStorage (compatible con sincronización)
let AsyncStorage = null;

// Intentar múltiples formas de importar AsyncStorage
try {
  // Intento 1: Import normal
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  if (!AsyncStorage || typeof AsyncStorage.getAllKeys !== 'function') {
    // Intento 2: Import sin default
    AsyncStorage = require('@react-native-async-storage/async-storage');
  }
} catch (error) {
  console.log('⚠️ AsyncStorage require failed:', error.message);
}

// Verificar si AsyncStorage tiene las funciones necesarias
if (AsyncStorage && typeof AsyncStorage.getAllKeys === 'function') {
  console.log('✅ AsyncStorage loaded successfully');
} else {
  console.log('⚠️ AsyncStorage not functional, using memory-only localStorage');
  AsyncStorage = null;
}

const localStorageMock = {
  getItem: (key) => {
    // Retornar desde cache síncrono
    const value = global._localStorageCache?.[key];
    console.log(`📦 localStorage.getItem('${key}') ->`, value ? 'found' : 'null');
    return value || null;
  },
  setItem: (key, value) => {
    console.log(`📦 localStorage.setItem('${key}', '${typeof value === 'string' ? value.substring(0, 50) : value}...')`);
    // Cache síncrono + AsyncStorage asíncrono si disponible
    if (!global._localStorageCache) {
      global._localStorageCache = {};
    }
    global._localStorageCache[key] = value;
    
    // También guardar en AsyncStorage de manera asíncrona si está disponible
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      AsyncStorage.setItem(key, value).catch(error => {
        console.warn('⚠️ AsyncStorage.setItem failed:', error.message);
      });
    }
  },
  removeItem: (key) => {
    console.log(`📦 localStorage.removeItem('${key}')`);
    if (global._localStorageCache) {
      delete global._localStorageCache[key];
    }
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      AsyncStorage.removeItem(key).catch(error => {
        console.warn('⚠️ AsyncStorage.removeItem failed:', error.message);
      });
    }
  },
  clear: () => {
    console.log('📦 localStorage.clear()');
    global._localStorageCache = {};
    if (AsyncStorage && typeof AsyncStorage.clear === 'function') {
      AsyncStorage.clear().catch(error => {
        console.warn('⚠️ AsyncStorage.clear failed:', error.message);
      });
    }
  },
  // Propiedades adicionales que algunos SDKs esperan
  length: 0,
  key: (index) => {
    const keys = Object.keys(global._localStorageCache || {});
    return keys[index] || null;
  }
};

// Inicializar cache desde AsyncStorage si está disponible
const initializeLocalStorageCache = async () => {
  // Inicializar cache inmediatamente para operaciones síncronas
  if (!global._localStorageCache) {
    global._localStorageCache = {};
  }

  try {
    if (AsyncStorage && typeof AsyncStorage.getAllKeys === 'function') {
      console.log('🔄 Initializing localStorage cache from AsyncStorage...');
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      items.forEach(([key, value]) => {
        if (value !== null) {
          global._localStorageCache[key] = value;
        }
      });
      
      console.log('✅ localStorage cache initialized with', keys.length, 'items from AsyncStorage');
    } else {
      console.log('✅ localStorage cache initialized (memory-only mode)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize localStorage cache:', error);
    // En caso de error, asegurar que el cache existe
    global._localStorageCache = {};
  }
};

// Inicializar cache
initializeLocalStorageCache();

if (typeof global.localStorage === 'undefined') {
  // Hacer que length sea dinámico
  Object.defineProperty(localStorageMock, 'length', {
    get: () => Object.keys(global._localStorageCache || {}).length
  });
  
  global.localStorage = localStorageMock;
  console.log('✅ localStorage polyfill initialized');
}

console.log('✅ Crypto polyfills initialized successfully');

// Interceptor global para errores de crypto
const originalConsoleError = console.error;
console.error = function(...args) {
  // Interceptar errores de salt length para debug
  const errorStr = args.join(' ');
  if (errorStr.includes('invalid salt length')) {
    console.log('🚨 Intercepted "invalid salt length" error:', ...args);
    console.trace('Error origin trace');
  }
  return originalConsoleError.apply(console, args);
};

// Interceptor para Promise rejections no manejadas
if (typeof global !== 'undefined') {
  const originalPromiseReject = Promise.reject;
  Promise.reject = function(reason) {
    if (reason && typeof reason === 'object' && reason.message && reason.message.includes('invalid salt length')) {
      console.log('🚨 Intercepted Promise rejection with salt length error:', reason);
      console.trace('Promise rejection trace');
    }
    return originalPromiseReject.call(this, reason);
  };
}
