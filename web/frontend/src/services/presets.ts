import api from './api';
import { Preset, PresetWithEffects } from '../types/preset';

export const presetsService = {
  async getAll(): Promise<PresetWithEffects[]> {
    const { data } = await api.get('/presets');
    return data.data || data.presets || [];
  },

  async getById(id: string): Promise<PresetWithEffects> {
    const { data } = await api.get(`/presets/${id}`);
    return data.preset;
  },

  async create(preset: Partial<Preset>): Promise<PresetWithEffects> {
    const { data } = await api.post('/presets', preset);
    return data.preset;
  },

  async update(id: string, preset: Partial<Preset>): Promise<PresetWithEffects> {
    const { data } = await api.put(`/presets/${id}`, preset);
    return data.preset;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/presets/${id}`);
  },

  async generateWithAI(prompt: string, referenceArtist?: string): Promise<PresetWithEffects> {
    const { data } = await api.post('/presets/generate', { prompt, referenceArtist });
    return data.preset;
  },

  async duplicate(id: string): Promise<PresetWithEffects> {
    const { data } = await api.post(`/presets/duplicate/${id}`);
    return data.preset;
  },

  async checkDuplicates(): Promise<{ duplicates: string[][] }> {
    const { data } = await api.get('/presets/duplicates/check');
    return data;
  },

  async syncWithDropbox(): Promise<{ message: string }> {
    const { data } = await api.post('/presets/sync');
    return data;
  },

  async exportToDropbox(): Promise<{ message: string }> {
    const { data } = await api.post('/presets/export');
    return data;
  },
};