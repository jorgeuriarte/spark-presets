export interface PresetParameter {
  value: number;
}

export interface SignalPathItem {
  dspId: string;
  params: PresetParameter[];
  active?: boolean;
  isEnabled?: boolean;
}

export interface PresetMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  createdAt?: string;
  modifiedAt?: string;
  category?: string;
  tags?: string[];
  importedAt?: string;
  importedFrom?: string;
}

export interface Preset {
  meta: PresetMetadata;
  type: string;
  bpm: number;
  sigpath: SignalPathItem[];
}

export interface PresetWithEffects extends Preset {
  effects: string[];
  hash?: string;
  importedAt?: string; // Also at root level for easier access
}