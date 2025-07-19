export interface PresetParameter {
  value: number;
}

export interface SignalPathItem {
  dspId: string;
  params: PresetParameter[];
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
}

export interface Preset {
  meta: PresetMetadata;
  type: string;
  bpm: number;
  sigpath: SignalPathItem[];
}

export interface PresetCategory {
  name: string;
  icon: string;
  order: number;
}

export interface PresetWithHash extends Preset {
  hash: string;
  filePath?: string;
}

export interface PresetWithEffects extends Preset {
  effects: string[];
  hash?: string;
}