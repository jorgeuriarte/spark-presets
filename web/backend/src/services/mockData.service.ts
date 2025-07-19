import fs from 'fs';
import path from 'path';
import { Preset, PresetWithEffects } from '../types/preset';
import { PresetService } from './preset.service';

export class MockDataService {
  private static presetsCache: Map<string, PresetWithEffects> | null = null;

  static async loadPresetsFromExamples(): Promise<Map<string, PresetWithEffects>> {
    if (this.presetsCache) {
      return this.presetsCache;
    }

    const presets = new Map<string, PresetWithEffects>();
    const examplesPath = path.join(__dirname, '../../../../PresetExamples');

    try {
      const categories = fs.readdirSync(examplesPath)
        .filter(item => {
          const itemPath = path.join(examplesPath, item);
          return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
        });

      for (const category of categories) {
        const categoryPath = path.join(examplesPath, category);
        const presetDirs = fs.readdirSync(categoryPath)
          .filter(item => {
            const itemPath = path.join(categoryPath, item);
            return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
          });

        for (const presetDir of presetDirs) {
          const presetJsonPath = path.join(categoryPath, presetDir, 'preset.json');
          
          if (fs.existsSync(presetJsonPath)) {
            try {
              const presetData = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
              
              // Add category to metadata
              if (!presetData.meta.category) {
                presetData.meta.category = category;
              }

              // Extract effects from the preset
              const effects = PresetService.getPresetEffects(presetData);

              const presetWithEffects: PresetWithEffects = {
                ...presetData,
                effects,
                hash: PresetService.generatePresetHash(presetData)
              };

              presets.set(presetData.meta.id, presetWithEffects);
            } catch (error) {
              console.error(`Error loading preset from ${presetJsonPath}:`, error);
            }
          }
        }
      }

      this.presetsCache = presets;
      console.log(`Loaded ${presets.size} presets from examples`);
      
      return presets;
    } catch (error) {
      console.error('Error loading preset examples:', error);
      return new Map();
    }
  }

  static async getPresetById(id: string): Promise<PresetWithEffects | null> {
    const presets = await this.loadPresetsFromExamples();
    return presets.get(id) || null;
  }

  static async getAllPresets(): Promise<PresetWithEffects[]> {
    const presets = await this.loadPresetsFromExamples();
    return Array.from(presets.values());
  }

  static async getPresetsByCategory(category: string): Promise<PresetWithEffects[]> {
    const presets = await this.loadPresetsFromExamples();
    return Array.from(presets.values())
      .filter(preset => preset.meta.category === category);
  }

  static async searchPresets(query: string): Promise<PresetWithEffects[]> {
    const presets = await this.loadPresetsFromExamples();
    const lowerQuery = query.toLowerCase();
    
    return Array.from(presets.values())
      .filter(preset => 
        preset.meta.name.toLowerCase().includes(lowerQuery) ||
        preset.meta.description?.toLowerCase().includes(lowerQuery) ||
        preset.effects.some(effect => effect.toLowerCase().includes(lowerQuery))
      );
  }
}