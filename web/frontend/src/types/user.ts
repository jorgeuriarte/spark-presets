export interface User {
  id: string;
  email: string;
  displayName?: string;
  dropboxConnected: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}