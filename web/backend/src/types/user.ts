export interface User {
  id: string;
  email: string;
  displayName?: string;
  dropboxAccessToken?: string;
  dropboxRefreshToken?: string;
  dropboxAccountId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  defaultCategory?: string;
  showTutorial?: boolean;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}