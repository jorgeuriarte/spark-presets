import { Router } from 'express';
import { PresetController } from '../controllers/preset.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const presetController = new PresetController();

// All preset routes require authentication
router.use(authMiddleware);

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