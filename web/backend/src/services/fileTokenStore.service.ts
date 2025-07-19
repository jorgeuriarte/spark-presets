import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

interface TokenStore {
  [userId: string]: {
    data: string; // Encrypted token data
    iv: string;   // Initialization vector for decryption
  };
}

class FileTokenStore {
  private filePath: string;
  private encryptionKey: Buffer;

  constructor() {
    // Store tokens in a .tokens directory (gitignored)
    this.filePath = path.join(process.cwd(), '.tokens', 'dropbox-tokens.json');
    
    // Use a consistent encryption key from env or generate one
    const key = process.env.TOKEN_ENCRYPTION_KEY || 'dev-encryption-key';
    this.encryptionKey = crypto.createHash('sha256').update(key).digest();
    
    // Ensure directory exists
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private encrypt(text: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  private decrypt(encrypted: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private loadStore(): TokenStore {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading token store:', error);
    }
    return {};
  }

  private saveStore(store: TokenStore) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2));
    } catch (error) {
      console.error('Error saving token store:', error);
    }
  }

  setToken(userId: string, tokenData: TokenData) {
    const store = this.loadStore();
    
    // Encrypt the token data
    const { encrypted, iv } = this.encrypt(JSON.stringify(tokenData));
    
    store[userId] = { data: encrypted, iv };
    this.saveStore(store);
    
    console.log(`Token stored persistently for user ${userId}`);
  }

  getToken(userId: string): TokenData | null {
    const store = this.loadStore();
    const encryptedData = store[userId];
    
    if (!encryptedData) {
      return null;
    }
    
    try {
      const decrypted = this.decrypt(encryptedData.data, encryptedData.iv);
      const tokenData = JSON.parse(decrypted);
      
      // Check if token is expired
      if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
        console.log(`Token expired for user ${userId}`);
        this.removeToken(userId);
        return null;
      }
      
      return tokenData;
    } catch (error) {
      console.error('Error decrypting token:', error);
      return null;
    }
  }

  removeToken(userId: string) {
    const store = this.loadStore();
    delete store[userId];
    this.saveStore(store);
  }

  hasToken(userId: string): boolean {
    const store = this.loadStore();
    return !!store[userId];
  }

  clearAll() {
    this.saveStore({});
  }
}

// Export singleton instance
export const fileTokenStore = new FileTokenStore();