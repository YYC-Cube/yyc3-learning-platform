import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  authTagLength?: number;
  saltLength?: number;
  iterations?: number;
}

export interface EncryptedData {
  iv: string;
  salt?: string;
  ciphertext: string;
  authTag?: string;
  algorithm: string;
}

export interface HashedData {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

export class EncryptionUtility {
  private static instance: EncryptionUtility;
  private config: Required<EncryptionConfig>;

  private constructor(config: EncryptionConfig = {}) {
    this.config = {
      algorithm: config.algorithm || 'aes-256-gcm',
      keyLength: config.keyLength || 32,
      ivLength: config.ivLength || 16,
      authTagLength: config.authTagLength || 16,
      saltLength: config.saltLength || 64,
      iterations: config.iterations || 100000
    };
  }

  static getInstance(config?: EncryptionConfig): EncryptionUtility {
    if (!EncryptionUtility.instance) {
      EncryptionUtility.instance = new EncryptionUtility(config);
    }
    return EncryptionUtility.instance;
  }

  private generateKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, this.config.iterations, this.config.keyLength, 'sha512');
  }

  private generateIV(): Buffer {
    return crypto.randomBytes(this.config.ivLength);
  }

  private generateSalt(): Buffer {
    return crypto.randomBytes(this.config.saltLength);
  }

  encrypt(plaintext: string, password: string): EncryptedData {
    const salt = this.generateSalt();
    const key = this.generateKey(password, salt);
    const iv = this.generateIV();

    const cipher = crypto.createCipheriv(this.config.algorithm, key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = (cipher as any).getAuthTag();

    return {
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      ciphertext,
      authTag: authTag.toString('hex'),
      algorithm: this.config.algorithm
    };
  }

  decrypt(encryptedData: EncryptedData, password: string): string {
    const salt = Buffer.from(encryptedData.salt!, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag!, 'hex');

    const key = this.generateKey(password, salt);

    const decipher = crypto.createDecipheriv(encryptedData.algorithm, key, iv);
    (decipher as any).setAuthTag(authTag);

    let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  encryptObject<T extends Record<string, any>>(obj: T, password: string): EncryptedData {
    const plaintext = JSON.stringify(obj);
    return this.encrypt(plaintext, password);
  }

  decryptObject<T extends Record<string, any>>(encryptedData: EncryptedData, password: string): T {
    const plaintext = this.decrypt(encryptedData, password);
    return JSON.parse(plaintext) as T;
  }

  hashPassword(password: string, salt?: string): HashedData {
    const passwordSalt = salt ? Buffer.from(salt, 'hex') : this.generateSalt();

    const hash = crypto.pbkdf2Sync(
      password,
      passwordSalt,
      this.config.iterations,
      this.config.keyLength,
      'sha512'
    );

    return {
      hash: hash.toString('hex'),
      salt: passwordSalt.toString('hex'),
      iterations: this.config.iterations,
      algorithm: 'pbkdf2-sha512'
    };
  }

  verifyPassword(password: string, hashedData: HashedData): boolean {
    const { hash, salt, iterations, algorithm } = hashedData;

    if (algorithm !== 'pbkdf2-sha512') {
      throw new Error(`Unsupported hashing algorithm: ${algorithm}`);
    }

    const newHash = crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, 'hex'),
      iterations,
      this.config.keyLength,
      'sha512'
    );

    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), newHash);
  }

  hashData(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  hashObject<T extends Record<string, any>>(obj: T, algorithm: string = 'sha256'): string {
    const data = JSON.stringify(obj);
    return this.hashData(data, algorithm);
  }

  generateHMAC(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  verifyHMAC(data: string, signature: string, secret: string, algorithm: string = 'sha256'): boolean {
    const expectedSignature = this.generateHMAC(data, secret, algorithm);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  }

  generateToken(length: number = 32, encoding: BufferEncoding = 'hex'): string {
    return crypto.randomBytes(length).toString(encoding);
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }

  generateJWT(payload: Record<string, any>, secret: string, expiresIn: string = '1h'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.parseExpiration(expiresIn)
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const signature = this.generateHMAC(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyJWT(token: string, secret: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      const expectedSignature = this.generateHMAC(`${encodedHeader}.${encodedPayload}`, secret);
      if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
        return { valid: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token verification failed' };
    }
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiration format. Use format like "1h", "30m", etc.');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const unitToSeconds: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };

    return value * unitToSeconds[unit];
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
  }

  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  encryptWithPublicKey(plaintext: string, publicKey: string): string {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    return encrypted.toString('base64');
  }

  decryptWithPrivateKey(ciphertext: string, privateKey: string): string {
    const buffer = Buffer.from(ciphertext, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    return decrypted.toString('utf8');
  }

  sign(data: string, privateKey: string): string {
    const sign = crypto.createSign('sha256');
    sign.update(data);
    sign.end();

    return sign.sign(privateKey).toString('hex');
  }

  verify(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('sha256');
    verify.update(data);
    verify.end();

    return verify.verify(publicKey, Buffer.from(signature, 'hex'));
  }

  maskSensitiveData(data: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (data.length <= visibleChars * 2) {
      return maskChar.repeat(data.length);
    }

    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const masked = maskChar.repeat(data.length - visibleChars * 2);

    return `${start}${masked}${end}`;
  }

  generateSecureRandom(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const cutoff = Math.floor((256 ** bytesNeeded) / range) * range;
    const buffer = crypto.randomBytes(bytesNeeded);

    let value = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      value = (value << 8) + buffer[i];
    }

    if (value >= cutoff) {
      return this.generateSecureRandom(min, max);
    }

    return min + (value % range);
  }
}

export default EncryptionUtility;
