import { createHash } from 'crypto';
import { Preset, PresetWithHash } from '../types/preset';
import { AppError } from '../middleware/errorHandler';

export class PresetService {
  /**
   * Generate a hash for a preset to detect duplicates
   */
  static generatePresetHash(preset: Preset): string {
    const normalized = {
      name: preset.meta.name.toLowerCase().trim(),
      chain: preset.sigpath.map(fx => ({
        dsp: fx.dspId,
        params: fx.params.map(p => Math.round(p.value * 100))
      }))
    };

    return createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex');
  }

  /**
   * Validate preset structure
   */
  static validatePreset(preset: any): preset is Preset {
    if (!preset || typeof preset !== 'object') {
      return false;
    }

    // Check required fields
    if (!preset.meta || !preset.sigpath || !Array.isArray(preset.sigpath)) {
      return false;
    }

    // Check meta fields
    const meta = preset.meta;
    if (!meta.id || !meta.name || !meta.version) {
      return false;
    }

    // Check signal path
    for (const item of preset.sigpath) {
      if (!item.dspId || !Array.isArray(item.params)) {
        return false;
      }

      for (const param of item.params) {
        if (typeof param.value !== 'number' || param.value < 0 || param.value > 1) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Find duplicates in a collection of presets
   */
  static findDuplicates(presets: Map<string, Preset>): Map<string, string[]> {
    const hashMap = new Map<string, string[]>();

    for (const [id, preset] of presets) {
      const hash = this.generatePresetHash(preset);
      const existing = hashMap.get(hash) || [];
      existing.push(id);
      hashMap.set(hash, existing);
    }

    // Filter out unique presets
    const duplicates = new Map<string, string[]>();
    for (const [hash, ids] of hashMap) {
      if (ids.length > 1) {
        duplicates.set(hash, ids);
      }
    }

    return duplicates;
  }

  /**
   * Merge presets, removing duplicates
   */
  static mergePresets(
    existingPresets: Map<string, Preset>,
    newPresets: Map<string, Preset>
  ): Map<string, Preset> {
    const merged = new Map(existingPresets);
    const existingHashes = new Set<string>();

    // Build hash set of existing presets
    for (const preset of existingPresets.values()) {
      existingHashes.add(this.generatePresetHash(preset));
    }

    // Add new presets that aren't duplicates
    for (const [id, preset] of newPresets) {
      const hash = this.generatePresetHash(preset);
      if (!existingHashes.has(hash)) {
        merged.set(id, preset);
        existingHashes.add(hash);
      }
    }

    return merged;
  }

  /**
   * Extract effect types from preset
   */
  static getPresetEffects(preset: Preset): string[] {
    const effectMap: { [key: string]: string } = {
      'noise_gate': 'Noise Gate',
      'compressor': 'Compressor',
      'overdrive': 'Overdrive',
      'distortion': 'Distortion',
      'fuzz': 'Fuzz',
      'chorus': 'Chorus',
      'flanger': 'Flanger',
      'phaser': 'Phaser',
      'tremolo': 'Tremolo',
      'vibrato': 'Vibrato',
      'delay': 'Delay',
      'reverb': 'Reverb',
      'eq': 'EQ'
    };

    const effects: string[] = [];
    
    for (const item of preset.sigpath) {
      for (const [key, label] of Object.entries(effectMap)) {
        if (item.dspId.toLowerCase().includes(key)) {
          effects.push(label);
          break;
        }
      }
    }

    return effects;
  }
}