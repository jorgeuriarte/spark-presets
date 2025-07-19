import { Router } from 'express';
import { DropboxController } from '../controllers/dropbox.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const dropboxController = new DropboxController();

// All Dropbox routes require authentication
router.use(authMiddleware);

// Dropbox operations
router.get('/status', dropboxController.getConnectionStatus);
router.post('/download', dropboxController.downloadPresets);
router.post('/upload', dropboxController.uploadPresets);

export default router;