import { Dropbox } from 'dropbox';
import { AppError } from '../middleware/errorHandler';
import { Preset } from '../types/preset';
import AdmZip from 'adm-zip';

export class DropboxService {
  private dbx: Dropbox;

  constructor(accessToken: string) {
    this.dbx = new Dropbox({ accessToken });
  }

  async downloadPresetsBackup(): Promise<Buffer> {
    try {
      const response = await this.dbx.filesDownload({
        path: '/Apps/Spark Amp/presets_backup.zip'
      });

      // @ts-ignore - Dropbox types are incomplete
      return response.result.fileBinary as Buffer;
    } catch (error: any) {
      if (error.status === 409) {
        throw new AppError(404, 'Presets backup file not found in Dropbox');
      }
      throw new AppError(500, 'Failed to download presets from Dropbox');
    }
  }

  async uploadPresetsBackup(zipBuffer: Buffer): Promise<void> {
    try {
      await this.dbx.filesUpload({
        path: '/Apps/Spark Amp/presets_backup.zip',
        contents: zipBuffer,
        mode: { '.tag': 'overwrite' }
      });
    } catch (error) {
      throw new AppError(500, 'Failed to upload presets to Dropbox');
    }
  }

  async parsePresetsFromZip(zipBuffer: Buffer): Promise<Map<string, Preset>> {
    const zip = new AdmZip(zipBuffer);
    const presets = new Map<string, Preset>();
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.entryName.endsWith('preset.json') && !entry.isDirectory) {
        try {
          const content = entry.getData().toString('utf8');
          const preset = JSON.parse(content) as Preset;
          
          // Extract category from path
          const pathParts = entry.entryName.split('/');
          if (pathParts.length >= 3) {
            preset.meta.category = pathParts[0];
          }

          presets.set(preset.meta.id, preset);
        } catch (error) {
          console.error(`Failed to parse preset: ${entry.entryName}`, error);
        }
      }
    }

    return presets;
  }

  async createPresetsZip(presets: Map<string, Preset>): Promise<Buffer> {
    const zip = new AdmZip();

    for (const [id, preset] of presets) {
      const category = preset.meta.category || 'Uncategorized';
      const presetPath = `${category}/${id}/preset.json`;
      
      zip.addFile(presetPath, Buffer.from(JSON.stringify(preset, null, 2)));
      
      // Add default icon if needed
      const iconPath = `${category}/${id}/icon.png`;
      // TODO: Add actual icon handling
    }

    return zip.toBuffer();
  }
}