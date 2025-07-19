import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { MockDataService } from '../services/mockData.service';
import { DropboxService } from '../services/dropbox.service';
import { tokenStore } from '../services/tokenStore.service';
import { AuthRequest } from '../types/auth';

export class PresetController {
  async getAllPresets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user has a Dropbox token stored
      if (req.user?.userId) {
        const tokenData = tokenStore.getToken(req.user.userId);
        
        if (tokenData?.accessToken) {
          try {
            console.log('Fetching presets from Dropbox for user:', req.user.email);
            const dropboxService = new DropboxService(tokenData.accessToken);
            const presets = await dropboxService.listPresets();
            console.log(`Found ${presets.length} presets in Dropbox`);
            res.json({ data: presets });
            return;
          } catch (error) {
            console.error('Error fetching from Dropbox:', error);
            // Fall back to mock data if Dropbox fails
          }
        }
      }
      
      // Fall back to mock data
      console.log('Using mock data (no Dropbox token or fetch failed)');
      const presets = await MockDataService.getAllPresets();
      res.json({ data: presets });
    } catch (error) {
      next(error);
    }
  }

  async getPresetById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const preset = await MockDataService.getPresetById(id);
      
      if (!preset) {
        throw new AppError(404, 'Preset not found');
      }
      
      res.json({ preset });
    } catch (error) {
      next(error);
    }
  }

  async createPreset(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement create preset
      res.status(201).json({ preset: null });
    } catch (error) {
      next(error);
    }
  }

  async updatePreset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: Implement update preset
      res.json({ preset: null });
    } catch (error) {
      next(error);
    }
  }

  async deletePreset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: Implement delete preset
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async generatePreset(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement AI preset generation
      res.json({ preset: null });
    } catch (error) {
      next(error);
    }
  }

  async duplicatePreset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: Implement duplicate preset
      res.status(201).json({ preset: null });
    } catch (error) {
      next(error);
    }
  }

  async checkDuplicates(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement check duplicates
      res.json({ duplicates: [] });
    } catch (error) {
      next(error);
    }
  }

  async syncWithDropbox(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement sync with Dropbox
      res.json({ message: 'Sync completed' });
    } catch (error) {
      next(error);
    }
  }

  async exportPresets(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement export presets
      res.json({ message: 'Export completed' });
    } catch (error) {
      next(error);
    }
  }
}