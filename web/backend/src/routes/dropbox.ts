import { Router } from 'express';
import { dropboxController } from '../controllers/dropbox.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All Dropbox routes require authentication
router.use(authMiddleware);

// Get backup info without importing
router.get('/backup-info', dropboxController.getBackupInfo);

// Import presets from backup (manual process)
router.post('/import-backup', dropboxController.importBackup);

// Get import history
router.get('/import-history', dropboxController.getImportHistory);

export default router;