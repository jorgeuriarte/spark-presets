import { Router } from 'express';
import { PresetController } from '../controllers/preset.controller';
import { authMiddleware } from '../middleware/auth';
import { mockAuthMiddleware } from '../middleware/mockAuth';

const router = Router();
const presetController = new PresetController();

// Use mock auth in development, real auth in production
if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
  router.use(mockAuthMiddleware);
} else {
  router.use(authMiddleware);
}

// Preset CRUD operations
router.get('/', presetController.getAllPresets);
router.get('/:id', presetController.getPresetById);
router.post('/', presetController.createPreset);
router.put('/:id', presetController.updatePreset);
router.delete('/:id', presetController.deletePreset);

// Preset operations
router.post('/generate', presetController.generatePreset);
router.post('/duplicate/:id', presetController.duplicatePreset);
router.get('/duplicates/check', presetController.checkDuplicates);

// Bulk operations
router.post('/sync', presetController.syncWithDropbox);
router.post('/export', presetController.exportPresets);

export default router;