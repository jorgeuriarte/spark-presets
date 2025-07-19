// Token store with persistent file backup
import { fileTokenStore } from './fileTokenStore.service';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

class TokenStoreService {
  private tokens: Map<string, TokenData> = new Map();

  setToken(userId: string, tokenData: TokenData): void {
    // Store in memory
    this.tokens.set(userId, tokenData);
    
    // Also persist to file
    fileTokenStore.setToken(userId, tokenData);
    
    console.log(`Token stored for user ${userId}`);
  }

  getToken(userId: string): TokenData | null {
    // Try memory first
    let token = this.tokens.get(userId);
    
    // If not in memory, try to load from file
    if (!token) {
      const fileToken = fileTokenStore.getToken(userId);
      if (fileToken) {
        // Restore to memory cache
        this.tokens.set(userId, fileToken);
        console.log(`Token restored from file for user ${userId}`);
        token = fileToken;
      }
    }
    
    if (!token) {
      console.log(`No token found for user ${userId}`);
      return null;
    }
    
    // Check if token is expired
    if (token.expiresAt && new Date() > token.expiresAt) {
      console.log(`Token expired for user ${userId}`);
      this.deleteToken(userId);
      return null;
    }
    
    return token;
  }

  deleteToken(userId: string): void {
    // Remove from memory
    this.tokens.delete(userId);
    
    // Also remove from file
    fileTokenStore.removeToken(userId);
    
    console.log(`Token deleted for user ${userId}`);
  }

  // For debugging
  getAllTokens(): Map<string, TokenData> {
    return this.tokens;
  }
}

export const tokenStore = new TokenStoreService();