import { dspIdToDisplayName } from './dsp-mappings';

export interface ProcessedPreset {
  meta: any;
  type: string;
  bpm: number;
  sigpath: any[];
  effects: string[];
  importedAt?: string;
}

/**
 * Extract effects from sigpath and return display names
 */
export function extractEffectsFromSigpath(sigpath: any[]): string[] {
  const effects: string[] = [];
  
  if (!sigpath || !Array.isArray(sigpath)) {
    return effects;
  }
  
  // Process each item in the signal path
  for (const item of sigpath) {
    if (item && item.dspId) {
      // Get display name from mapping
      const displayName = dspIdToDisplayName[item.dspId] || item.dspId;
      
      // Check if it's an active effect (has parameters with non-zero values)
      const isActive = item.params && 
                      Array.isArray(item.params) && 
                      item.params.some((p: any) => p.value > 0);
      
      if (isActive) {
        effects.push(displayName);
      }
    }
  }
  
  return effects;
}

/**
 * Process a preset to ensure it has all required fields
 */
export function processPreset(presetData: any): ProcessedPreset {
  // Extract sigpath from various possible locations
  const sigpath = presetData.sigpath || 
                  presetData.tone?.sigpath || 
                  presetData.preset?.tone?.sigpath ||
                  [];
  
  // Extract effects from sigpath
  const effects = extractEffectsFromSigpath(sigpath);
  
  // Ensure all required fields exist
  const processedPreset: ProcessedPreset = {
    meta: presetData.meta || {
      id: presetData.id || 'unknown',
      name: presetData.name || 'Unnamed Preset',
      description: presetData.description || '',
      version: presetData.version || '0.7',
      icon: presetData.icon || 'icon.png',
      category: presetData.category || 'Custom',
      tags: presetData.tags || []
    },
    type: presetData.type || 'jamup_speaker',
    bpm: presetData.bpm || 120,
    sigpath: sigpath,
    effects: effects,
    importedAt: presetData.importedAt
  };
  
  return processedPreset;
}