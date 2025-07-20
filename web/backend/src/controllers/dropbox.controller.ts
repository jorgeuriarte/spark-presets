import { Request, Response } from 'express';
import DropboxService from '../services/dropbox.service';
import { tokenStore } from '../services/tokenStore.service';

export const dropboxController = {
  // Get backup info without importing
  async getBackupInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const tokenData = tokenStore.getToken(userId);
      
      if (!tokenData) {
        res.status(401).json({ error: 'No Dropbox connection found' });
        return;
      }

      const dropboxService = new DropboxService();
      const info = await dropboxService.getBackupInfo(tokenData.accessToken);
      res.json(info);
    } catch (error) {
      console.error('Error getting backup info:', error);
      res.status(500).json({ 
        error: 'Failed to get backup information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Import presets from backup (manual process)
  async importBackup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const tokenData = tokenStore.getToken(userId);
      
      if (!tokenData) {
        res.status(401).json({ error: 'No Dropbox connection found' });
        return;
      }

      const dropboxService = new DropboxService();
      
      // Archive the backup if it's new
      const backupPath = await dropboxService.downloadAndArchiveBackup(tokenData.accessToken);
      
      // Process and import presets
      const result = await dropboxService.importPresetsFromBackup(backupPath, userId);
      
      res.json({
        success: true,
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors
      });
    } catch (error) {
      console.error('Error importing backup:', error);
      res.status(500).json({ 
        error: 'Failed to import backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get import history
  async getImportHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const dropboxService = new DropboxService();
      const history = await dropboxService.getImportHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Error getting import history:', error);
      res.status(500).json({ 
        error: 'Failed to get import history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};