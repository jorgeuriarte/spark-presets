import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Dropbox OAuth flow
router.get('/dropbox', authController.initiateDropboxAuth);
router.get('/dropbox/callback', authController.handleDropboxCallback);

// Session management
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

export default router;