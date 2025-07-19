import { Request } from 'express';
import { User } from './user';

export interface AuthRequest extends Request {
  user?: AuthToken;
  session?: any & {
    user?: User;
    dropboxAccessToken?: string;
  };
}

export interface AuthToken {
  userId: string;
  email: string;
  dropboxId?: string;
  dropboxConnected?: boolean;
  displayName?: string;
  iat: number;
  exp: number;
}