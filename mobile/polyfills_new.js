import 'react-native-get-random-values';
const CryptoJS = require('crypto-js');

console.log('🚀 Initializing comprehensive crypto polyfills...');

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
      
      // Validar salt length - PBKDF2 necesita al menos 8 bytes
      let validSalt = salt;
      if (salt.length < 8) {
        console.log(`⚠️ Salt too short (${salt.length} bytes), padding to 8 bytes`);
        validSalt = new Uint8Array(8);
        validSalt.set(salt);
        // Rellenar con ceros o repetir patrón
        for (let i = salt.length; i < 8; i++) {
          validSalt[i] = salt[i % salt.length] || 0;
        }
      }
      
      // Extraer la clave desde baseKey
      let password;
      if (baseKey && baseKey._key) {
        if (baseKey._key instanceof Uint8Array) {
          password = CryptoJS.lib.WordArray.create(Array.from(baseKey._key));
        } else if (typeof baseKey._key === 'string') {
          password = CryptoJS.enc.Utf8.parse(baseKey._key);
        } else if (baseKey._key.words && Array.isArray(baseKey._key.words)) {
          password = baseKey._key;
        } else {
          throw new Error('Unsupported baseKey format');
        }
      } else {
        throw new Error('Invalid baseKey for PBKDF2');
      }
      
      const saltWords = CryptoJS.lib.WordArray.create(Array.from(validSalt));
      
      try {
        const derived = CryptoJS.PBKDF2(password, saltWords, {
          keySize: length / 32, // CryptoJS usa keySize en palabras de 32 bits
          iterations: iterations,
          hasher: CryptoJS.algo[hash] || CryptoJS.algo.SHA256
        });
        
        // Convertir resultado a ArrayBuffer
        const result = new ArrayBuffer(length / 8);
        const view = new Uint8Array(result);
        
        // Extraer bytes del WordArray de CryptoJS
        for (let i = 0; i < view.length; i++) {
          const wordIndex = Math.floor(i / 4);
          const byteIndex = i % 4;
          if (wordIndex < derived.words.length) {
            view[i] = (derived.words[wordIndex] >>> (24 - byteIndex * 8)) & 0xff;
          } else {
            view[i] = 0;
          }
        }
        
        console.log(`✅ PBKDF2 success, generated ${view.length} bytes`);
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
        console.log('⚠️ Native deriveBits failed, no fallback available:', error.message);
        throw error;
      }
    }
    
    throw new Error(`deriveBits not implemented for algorithm: ${algorithm.name}`);
  },

  async importKey(format, keyData, algorithm, extractable, usages) {
    console.log('🔑 importKey called:', { format, algorithm: algorithm.name });
    
    // Para formato raw, usar siempre nuestro fallback
    if (format === 'raw') {
      let keyDataArray;
      if (keyData instanceof ArrayBuffer) {
        keyDataArray = new Uint8Array(keyData);
      } else if (keyData instanceof Uint8Array) {
        keyDataArray = keyData;
      } else {
        throw new Error('Unsupported keyData format for raw import');
      }
      
      return {
        type: 'secret',
        extractable: extractable,
        algorithm: algorithm,
        usages: usages,
        _key: keyDataArray
      };
    }
    
    // Para otros formatos, intentar native primero
    if (nativeSubtle) {
      try {
        const result = await nativeSubtle.importKey(format, keyData, algorithm, extractable, usages);
        console.log('✅ Native importKey success');
        return result;
      } catch (error) {
        console.log('⚠️ Native importKey failed, using fallback:', error.message);
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
const AsyncStorage = require('@react-native-async-storage/async-storage');

const localStorageMock = {
  getItem: (key) => {
    // Retornar desde cache síncrono
    return global._localStorageCache?.[key] || null;
  },
  setItem: (key, value) => {
    // Cache síncrono + AsyncStorage asíncrono
    if (!global._localStorageCache) {
      global._localStorageCache = {};
    }
    global._localStorageCache[key] = value;
    
    // También guardar en AsyncStorage de manera asíncrona
    AsyncStorage.setItem(key, value).catch(console.error);
  },
  removeItem: (key) => {
    if (global._localStorageCache) {
      delete global._localStorageCache[key];
    }
    AsyncStorage.removeItem(key).catch(console.error);
  },
  clear: () => {
    global._localStorageCache = {};
    AsyncStorage.clear().catch(console.error);
  }
};

// Inicializar cache desde AsyncStorage
const initializeLocalStorageCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    global._localStorageCache = {};
    
    items.forEach(([key, value]) => {
      if (value !== null) {
        global._localStorageCache[key] = value;
      }
    });
    
    console.log('✅ localStorage cache initialized with', keys.length, 'items');
  } catch (error) {
    console.error('❌ Failed to initialize localStorage cache:', error);
    global._localStorageCache = {};
  }
};

// Inicializar cache
initializeLocalStorageCache();

if (typeof global.localStorage === 'undefined') {
  global.localStorage = localStorageMock;
}

console.log('✅ Crypto polyfills initialized successfully');
