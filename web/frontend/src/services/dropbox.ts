import apiClient from './api';

interface PresetInfo {
  id: string;
  name: string;
  category?: string;
  contentHash?: string; // MD5 hash of the preset content
}

interface BackupInfo {
  totalPresets: number;
  categories: string[];
  fileSize: number;
  fileSizeMB: string;
  lastModified?: string;
  md5Hash?: string;
  presetNames?: string[];
  presets?: PresetInfo[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export const dropboxService = {
  // Get backup info without importing
  async getBackupInfo(): Promise<BackupInfo> {
    const response = await apiClient.get('/dropbox/backup-info');
    return response.data;
  },

  // Import presets from backup
  async importBackup(): Promise<ImportResult> {
    const response = await apiClient.post('/dropbox/import-backup');
    return response.data;
  },

  // Get import history
  async getImportHistory(): Promise<any[]> {
    const response = await apiClient.get('/dropbox/import-history');
    return response.data;
  }
};