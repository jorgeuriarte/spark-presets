import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { MockDataService } from '../services/mockData.service';
import { DropboxService } from '../services/dropbox.service';
import { tokenStore } from '../services/tokenStore.service';
import { AuthRequest } from '../types/auth';
import { processPreset } from '../utils/preset-processor';

export class PresetController {
  async getAllPresets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        console.log('No user ID found in request');
        res.json({ data: [] });
        return;
      }

      console.log(`Returning local presets for user: ${req.user?.email}`);
      
      // Read presets from local file system
      const fs = require('fs');
      const path = require('path');
      const userPresetsPath = path.join(__dirname, '../../data/user-presets', userId);
      
      const presets: any[] = [];
      
      if (fs.existsSync(userPresetsPath)) {
        const files = fs.readdirSync(userPresetsPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const presetPath = path.join(userPresetsPath, file);
              const presetContent = fs.readFileSync(presetPath, 'utf8');
              const presetData = JSON.parse(presetContent);
              
              // Process preset to ensure effects are extracted
              const processedPreset = processPreset(presetData);
              presets.push(processedPreset);
            } catch (error) {
              console.error(`Error reading preset ${file}:`, error);
            }
          }
        }
      }
      
      // Sort presets by importedAt date (most recent first)
      presets.sort((a, b) => {
        const dateA = new Date(a.importedAt || a.meta?.importedAt || 0).getTime();
        const dateB = new Date(b.importedAt || b.meta?.importedAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`Found ${presets.length} presets for user ${userId}`);
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