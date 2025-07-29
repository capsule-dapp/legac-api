import crypto from 'crypto'
import { config } from '../config/config';

export function encrypt(data: unknown) {
    try {
      // Convert key to 32 bytes (256 bits) for AES-256
      const derivedKey = crypto
        .createHash("sha256")
        .update(config.encryptionKey)
        .digest();

      // Generate a random 16-byte !V (Initialization Vector)
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
      let encrypted = cipher.update((data as never), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error("could not encrypt data");
    }
  }

  export function decrypt(decryptedData: string) {
    // Convert key to 32 bytes (256 bits) for AES-256
    const derivedKey = crypto
      .createHash("sha256")
      .update(config.encryptionKey)
      .digest();

    const [ivHex, encrypted] = decryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      derivedKey,
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }