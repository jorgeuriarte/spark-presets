import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { DropboxService } from '../services/dropbox.service';
import { tokenStore } from '../services/tokenStore.service';
import jwt from 'jsonwebtoken';

export class AuthController {
  async initiateDropboxAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      // Build Dropbox OAuth URL
      const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
      authUrl.searchParams.append('client_id', process.env.DROPBOX_APP_KEY || '');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', process.env.DROPBOX_REDIRECT_URI || '');
      authUrl.searchParams.append('token_access_type', 'offline'); // For refresh tokens
      
      res.redirect(authUrl.toString());
    } catch (error) {
      next(error);
    }
  }

  async handleDropboxCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, error } = req.query;
      
      if (error) {
        throw new AppError(400, 'Dropbox authorization denied');
      }

      if (!code || typeof code !== 'string') {
        throw new AppError(400, 'Authorization code not provided');
      }

      // Exchange code for access token
      const dropboxService = new DropboxService();
      const tokenResponse = await dropboxService.exchangeCodeForToken(code);
      
      // Initialize Dropbox with access token
      const authenticatedService = new DropboxService(tokenResponse.access_token);
      const accountInfo = await authenticatedService.getCurrentAccount();
      
      // Create user object
      const user = {
        id: accountInfo.account_id,
        email: accountInfo.email,
        displayName: accountInfo.name.display_name,
        dropboxId: accountInfo.account_id,
        accessToken: tokenResponse.access_token // In production, encrypt this
      };

      // Store the access token in our token store
      tokenStore.setToken(user.id, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000) : undefined
      });

      // LOG THE REAL DROPBOX ACCESS TOKEN FOR DEBUGGING
      console.log('');
      console.log('🔑 DROPBOX ACCESS TOKEN OBTAINED:');
      console.log('==================================');
      console.log('ACCESS TOKEN:', tokenResponse.access_token);
      console.log('==================================');
      console.log('Use this token with dropbox_explorer.sh');
      console.log('');

      // Generate JWT token with dropbox connection info
      const jwtToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          dropboxId: user.dropboxId,
          dropboxConnected: true,
          displayName: user.displayName
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );
      
      console.log('Generated JWT token for user:', user.email);

      // Store in session
      if (req.session) {
        req.session.user = user;
        req.session.dropboxAccessToken = tokenResponse.access_token;
      }
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/?token=${jwtToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Dropbox callback error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/login?error=auth_failed`;
      res.redirect(redirectUrl);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement logout
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // In mock mode, return a mock user
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
        res.json({
          user: {
            id: 'mock-user-123',
            email: 'test@sparkpresets.com',
            displayName: 'Test User',
            dropboxConnected: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          }
        });
        return;
      }
      
      // Try to get user from JWT token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'dev-secret'
          ) as any;
          
          res.json({
            user: {
              id: decoded.userId,
              email: decoded.email,
              displayName: decoded.displayName || decoded.email,
              dropboxConnected: decoded.dropboxConnected || false,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            }
          });
          return;
        } catch (error) {
          // Invalid token, continue to return null user
        }
      }
      
      res.json({
        user: null
      });
    } catch (error) {
      next(error);
    }
  }
}