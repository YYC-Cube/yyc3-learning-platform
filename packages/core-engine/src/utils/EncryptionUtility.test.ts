import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import EncryptionUtility, { EncryptionConfig, EncryptedData, HashedData } from './EncryptionUtility';

describe('EncryptionUtility', () => {
  const encryption = EncryptionUtility.getInstance();
  const testPassword = encryption.generateToken(16);
  const testPlaintext = 'Hello, World! This is a secret message.';

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const encrypted: EncryptedData = encryption.encrypt(testPlaintext, testPassword);
      const decrypted = encryption.decrypt(encrypted, testPassword);

      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('algorithm');
      expect(decrypted).toBe(testPlaintext);
    });

    it('should fail to decrypt with wrong password', () => {
      const encrypted: EncryptedData = encryption.encrypt(testPlaintext, testPassword);

      expect(() => {
        encryption.decrypt(encrypted, 'WrongPassword');
      }).toThrow();
    });

    it('should produce different ciphertext for same plaintext', () => {
      const encrypted1: EncryptedData = encryption.encrypt(testPlaintext, testPassword);
      const encrypted2: EncryptedData = encryption.encrypt(testPlaintext, testPassword);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });
  });

  describe('encryptObject and decryptObject', () => {
    it('should encrypt and decrypt objects correctly', () => {
      const testObject = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        active: true
      };

      const encrypted: EncryptedData = encryption.encryptObject(testObject, testPassword);
      const decrypted = encryption.decryptObject(encrypted, testPassword);

      expect(decrypted).toEqual(testObject);
    });

    it('should handle nested objects', () => {
      const testObject = {
        user: {
          name: 'John Doe',
          address: {
            city: 'New York',
            country: 'USA'
          }
        }
      };

      const encrypted: EncryptedData = encryption.encryptObject(testObject, testPassword);
      const decrypted = encryption.decryptObject(encrypted, testPassword);

      expect(decrypted).toEqual(testObject);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify password correctly', () => {
      const hashed: HashedData = encryption.hashPassword(testPassword);
      const isValid = encryption.verifyPassword(testPassword, hashed);

      expect(hashed).toHaveProperty('hash');
      expect(hashed).toHaveProperty('salt');
      expect(hashed).toHaveProperty('iterations');
      expect(hashed).toHaveProperty('algorithm');
      expect(isValid).toBe(true);
    });

    it('should fail to verify wrong password', () => {
      const hashed: HashedData = encryption.hashPassword(testPassword);
      const isValid = encryption.verifyPassword('WrongPassword', hashed);

      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password', () => {
      const hashed1: HashedData = encryption.hashPassword(testPassword);
      const hashed2: HashedData = encryption.hashPassword(testPassword);

      expect(hashed1.hash).not.toBe(hashed2.hash);
      expect(hashed1.salt).not.toBe(hashed2.salt);
    });

    it('should verify password with provided salt', () => {
      const hashed1: HashedData = encryption.hashPassword(testPassword);
      const hashed2: HashedData = encryption.hashPassword(testPassword, hashed1.salt);

      expect(hashed1.hash).toBe(hashed2.hash);
    });
  });

  describe('hashData and hashObject', () => {
    it('should hash data correctly', () => {
      const hash1 = encryption.hashData(testPlaintext);
      const hash2 = encryption.hashData(testPlaintext);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = encryption.hashData('Data 1');
      const hash2 = encryption.hashData('Data 2');

      expect(hash1).not.toBe(hash2);
    });

    it('should hash objects correctly', () => {
      const testObject = { name: 'John', age: 30 };
      const hash1 = encryption.hashObject(testObject);
      const hash2 = encryption.hashObject(testObject);

      expect(hash1).toBe(hash2);
    });

    it('should support different hash algorithms', () => {
      const sha256 = encryption.hashData(testPlaintext, 'sha256');
      const sha512 = encryption.hashData(testPlaintext, 'sha512');

      expect(sha256).not.toBe(sha512);
      expect(sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(sha512).toMatch(/^[a-f0-9]{128}$/);
    });
  });

  describe('generateHMAC and verifyHMAC', () => {
    it('should generate and verify HMAC correctly', () => {
      const secret = 'my-secret-key';
      const signature = encryption.generateHMAC(testPlaintext, secret);
      const isValid = encryption.verifyHMAC(testPlaintext, signature, secret);

      expect(signature).toMatch(/^[a-f0-9]{64}$/);
      expect(isValid).toBe(true);
    });

    it('should fail to verify with wrong signature', () => {
      const secret = 'my-secret-key';
      const signature = encryption.generateHMAC(testPlaintext, secret);
      const isValid = encryption.verifyHMAC(testPlaintext, 'wrong-signature', secret);

      expect(isValid).toBe(false);
    });

    it('should fail to verify with wrong secret', () => {
      const signature = encryption.generateHMAC(testPlaintext, 'secret1');
      const isValid = encryption.verifyHMAC(testPlaintext, signature, 'secret2');

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate token with default length', () => {
      const token = encryption.generateToken();

      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate token with custom length', () => {
      const token = encryption.generateToken(16);

      expect(token).toMatch(/^[a-f0-9]{32}$/);
    });

    it('should generate different tokens each time', () => {
      const token1 = encryption.generateToken();
      const token2 = encryption.generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = encryption.generateUUID();

      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate different UUIDs each time', () => {
      const uuid1 = encryption.generateUUID();
      const uuid2 = encryption.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateJWT and verifyJWT', () => {
    it('should generate and verify JWT correctly', () => {
      const payload = { userId: '123', name: 'John Doe' };
      const secret = 'jwt-secret';
      const token = encryption.generateJWT(payload, secret, '1h');
      const result = encryption.verifyJWT(token, secret);

      expect(result.valid).toBe(true);
      expect(result.payload).toHaveProperty('userId', '123');
      expect(result.payload).toHaveProperty('name', 'John Doe');
      expect(result.payload).toHaveProperty('iat');
      expect(result.payload).toHaveProperty('exp');
    });

    it('should fail to verify with wrong secret', () => {
      const payload = { userId: '123' };
      const token = encryption.generateJWT(payload, 'secret1', '1h');
      const result = encryption.verifyJWT(token, 'secret2');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('signature');
    });

    it('should detect expired tokens', () => {
      const payload = { userId: '123' };
      const token = encryption.generateJWT(payload, 'secret', '1ms');

      setTimeout(() => {
        const result = encryption.verifyJWT(token, 'secret');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
      }, 10);
    });

    it('should reject invalid token format', () => {
      const result = encryption.verifyJWT('invalid-token', 'secret');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('format');
    });

    it('should support different expiration formats', () => {
      const payload = { userId: '123' };
      const secret = 'secret';

      const token1s = encryption.generateJWT(payload, secret, '1s');
      const token1m = encryption.generateJWT(payload, secret, '1m');
      const token1h = encryption.generateJWT(payload, secret, '1h');
      const token1d = encryption.generateJWT(payload, secret, '1d');

      const result1s = encryption.verifyJWT(token1s, secret);
      const result1m = encryption.verifyJWT(token1m, secret);
      const result1h = encryption.verifyJWT(token1h, secret);
      const result1d = encryption.verifyJWT(token1d, secret);

      expect(result1s.valid).toBe(true);
      expect(result1m.valid).toBe(true);
      expect(result1h.valid).toBe(true);
      expect(result1d.valid).toBe(true);

      expect(result1s.payload.exp - result1s.payload.iat).toBe(1);
      expect(result1m.payload.exp - result1m.payload.iat).toBe(60);
      expect(result1h.payload.exp - result1h.payload.iat).toBe(3600);
      expect(result1d.payload.exp - result1d.payload.iat).toBe(86400);
    });
  });

  describe('generateKeyPair', () => {
    it('should generate RSA key pair', () => {
      const { publicKey, privateKey } = encryption.generateKeyPair();

      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(publicKey).toContain('-----END PUBLIC KEY-----');
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(privateKey).toContain('-----END PRIVATE KEY-----');
    });

    it('should generate different key pairs each time', () => {
      const keyPair1 = encryption.generateKeyPair();
      const keyPair2 = encryption.generateKeyPair();

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe('encryptWithPublicKey and decryptWithPrivateKey', () => {
    it('should encrypt and decrypt with RSA key pair', () => {
      const { publicKey, privateKey } = encryption.generateKeyPair();
      const encrypted = encryption.encryptWithPublicKey(testPlaintext, publicKey);
      const decrypted = encryption.decryptWithPrivateKey(encrypted, privateKey);

      expect(decrypted).toBe(testPlaintext);
    });

    it('should fail to decrypt with wrong private key', () => {
      const { publicKey } = encryption.generateKeyPair();
      const { privateKey: wrongPrivateKey } = encryption.generateKeyPair();
      const encrypted = encryption.encryptWithPublicKey(testPlaintext, publicKey);

      expect(() => {
        encryption.decryptWithPrivateKey(encrypted, wrongPrivateKey);
      }).toThrow();
    });
  });

  describe('sign and verify', () => {
    it('should sign and verify data correctly', () => {
      const { publicKey, privateKey } = encryption.generateKeyPair();
      const signature = encryption.sign(testPlaintext, privateKey);
      const isValid = encryption.verify(testPlaintext, signature, publicKey);

      expect(signature).toMatch(/^[a-f0-9]+$/);
      expect(isValid).toBe(true);
    });

    it('should fail to verify with wrong signature', () => {
      const { publicKey, privateKey } = encryption.generateKeyPair();
      encryption.sign(testPlaintext, privateKey);
      const isValid = encryption.verify(testPlaintext, 'wrong-signature', publicKey);

      expect(isValid).toBe(false);
    });

    it('should fail to verify with wrong public key', () => {
      const { publicKey, privateKey } = encryption.generateKeyPair();
      const { publicKey: wrongPublicKey } = encryption.generateKeyPair();
      const signature = encryption.sign(testPlaintext, privateKey);
      const isValid = encryption.verify(testPlaintext, signature, wrongPublicKey);

      expect(isValid).toBe(false);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask sensitive data with default settings', () => {
      const data = '1234567890123456';
      const masked = encryption.maskSensitiveData(data);

      expect(masked).toBe('1234********3456');
    });

    it('should mask with custom visible characters', () => {
      const data = '1234567890123456';
      const masked = encryption.maskSensitiveData(data, 2);

      expect(masked).toBe('12**********56');
    });

    it('should mask with custom mask character', () => {
      const data = '1234567890123456';
      const masked = encryption.maskSensitiveData(data, 4, '#');

      expect(masked).toBe('1234########3456');
    });

    it('should fully mask short strings', () => {
      const data = '1234';
      const masked = encryption.maskSensitiveData(data, 4);

      expect(masked).toBe('****');
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate random number in range', () => {
      const min = 10;
      const max = 100;
      const random = encryption.generateSecureRandom(min, max);

      expect(random).toBeGreaterThanOrEqual(min);
      expect(random).toBeLessThan(max);
    });

    it('should generate different numbers each time', () => {
      const random1 = encryption.generateSecureRandom(0, 1000);
      const random2 = encryption.generateSecureRandom(0, 1000);

      expect(random1).not.toBe(random2);
    });

    it('should handle large ranges', () => {
      const random = encryption.generateSecureRandom(0, Number.MAX_SAFE_INTEGER);

      expect(random).toBeGreaterThanOrEqual(0);
      expect(random).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('custom configuration', () => {
    it('should use custom encryption configuration', () => {
      const customConfig: EncryptionConfig = {
        algorithm: 'aes-256-cbc',
        keyLength: 32,
        ivLength: 16
      };

      const customEncryption = EncryptionUtility.getInstance(customConfig);
      const encrypted = customEncryption.encrypt(testPlaintext, testPassword);
      const decrypted = customEncryption.decrypt(encrypted, testPassword);

      expect(encrypted.algorithm).toBe('aes-256-cbc');
      expect(decrypted).toBe(testPlaintext);
    });
  });
});
