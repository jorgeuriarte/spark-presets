import { Dropbox } from 'dropbox';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import { Readable } from 'stream';

interface BackupInfo {
  totalPresets: number;
  categories: string[];
  fileSize: number;
  fileSizeMB: string;
  lastModified?: string;
  md5Hash?: string;
  presetNames?: string[];
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export class DropboxStreamingService {
  private dbx: Dropbox;
  
  constructor(accessToken: string) {
    this.dbx = new Dropbox({ accessToken });
  }

  /**
   * Archive backup to Dropbox and return metadata
   */
  async archiveBackupToDropbox(sourceZipPath: string): Promise<{ dropboxPath: string; md5Hash: string }> {
    try {
      // Download the ZIP file from Spark Amp folder
      const response = await this.dbx.filesDownload({ path: sourceZipPath });
      const zipBuffer = (response.result as any).fileBinary;
      
      // Calculate MD5 hash
      const md5Hash = crypto.createHash('md5').update(zipBuffer).digest('hex');
      
      // Define paths in Dropbox
      const dropboxBackupsPath = '/Aplicaciones/Spark Preset Manager/backups';
      const dropboxArchivePath = `${dropboxBackupsPath}/backup_${md5Hash}.zip`;
      
      // Check if backup already exists in Dropbox
      try {
        await this.dbx.filesGetMetadata({ path: dropboxArchivePath });
        console.log(`Backup already archived in Dropbox: ${dropboxArchivePath}`);
      } catch (error: any) {
        if (error?.status === 409) { // File not found
          // Create directory structure if needed
          try {
            await this.dbx.filesCreateFolderV2({ path: dropboxBackupsPath });
          } catch (folderError: any) {
            // Ignore if folder already exists
            if (folderError?.status !== 409) {
              throw folderError;
            }
          }
          
          // Upload the backup to Dropbox
          await this.dbx.filesUpload({
            path: dropboxArchivePath,
            contents: zipBuffer,
            mode: { '.tag': 'overwrite' },
            autorename: false,
            mute: false
          });
          
          console.log(`Archived new backup to Dropbox: ${dropboxArchivePath}`);
        } else {
          throw error;
        }
      }
      
      return { dropboxPath: dropboxArchivePath, md5Hash };
    } catch (error: any) {
      console.error('Error archiving backup:', error);
      throw new Error(`Failed to archive backup: ${error.message}`);
    }
  }

  /**
   * Stream and process presets directly from Dropbox without downloading to disk
   */
  async streamPresetsFromDropbox(dropboxPath: string): Promise<any[]> {
    try {
      // Download as stream
      const response = await this.dbx.filesDownload({ path: dropboxPath });
      const zipBuffer = (response.result as any).fileBinary;
      
      // Process ZIP in memory
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      const presets: any[] = [];
      
      for (const entry of zipEntries) {
        if (entry.entryName.endsWith('.json')) {
          try {
            const content = entry.getData().toString('utf8');
            const preset = JSON.parse(content);
            presets.push(preset);
          } catch (error) {
            console.error(`Error parsing preset ${entry.entryName}:`, error);
          }
        }
      }
      
      return presets;
    } catch (error: any) {
      console.error('Error streaming presets:', error);
      throw new Error(`Failed to stream presets: ${error.message}`);
    }
  }

  /**
   * Get backup info without downloading the entire file
   */
  async getBackupInfoFromDropbox(dropboxPath: string): Promise<BackupInfo> {
    try {
      // Get file metadata
      const metadata = await this.dbx.filesGetMetadata({ path: dropboxPath }) as any;
      
      // Download and process to get detailed info
      const response = await this.dbx.filesDownload({ path: dropboxPath });
      const zipBuffer = (response.result as any).fileBinary;
      
      // Calculate MD5 hash
      const md5Hash = crypto.createHash('md5').update(zipBuffer).digest('hex');
      
      // Process ZIP to get preset info
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      const presetFiles = zipEntries.filter(entry => entry.entryName.endsWith('.json'));
      const categories = new Set<string>();
      const presetNames: string[] = [];
      
      for (const entry of presetFiles) {
        try {
          const content = entry.getData().toString('utf8');
          const preset = JSON.parse(content);
          if (preset.category) {
            categories.add(preset.category);
          }
          if (preset.name) {
            presetNames.push(preset.name);
          }
        } catch (error) {
          // Skip invalid preset files
        }
      }
      
      return {
        totalPresets: presetFiles.length,
        categories: Array.from(categories).sort(),
        fileSize: metadata.size,
        fileSizeMB: `${(metadata.size / (1024 * 1024)).toFixed(2)} MB`,
        lastModified: metadata.server_modified,
        md5Hash,
        presetNames
      };
    } catch (error: any) {
      console.error('Error getting backup info:', error);
      throw new Error(`Failed to get backup info: ${error.message}`);
    }
  }

  /**
   * Create or update backup index in Dropbox
   */
  async updateBackupIndex(): Promise<void> {
    try {
      const indexPath = '/Aplicaciones/Spark Preset Manager/backup-index.json';
      const backupsPath = '/Aplicaciones/Spark Preset Manager/backups';
      
      // List all backups
      const listResult = await this.dbx.filesListFolder({ path: backupsPath });
      const backups: any[] = [];
      
      for (const entry of listResult.result.entries) {
        if (entry['.tag'] === 'file' && entry.name.endsWith('.zip')) {
          // Extract MD5 from filename
          const md5Match = entry.name.match(/backup_([a-f0-9]{32})\.zip/);
          if (md5Match) {
            backups.push({
              path: entry.path_display,
              name: entry.name,
              md5Hash: md5Match[1],
              size: (entry as any).size,
              modified: (entry as any).server_modified
            });
          }
        }
      }
      
      // Save index to Dropbox
      const indexContent = JSON.stringify({
        updated: new Date().toISOString(),
        backups: backups
      }, null, 2);
      
      await this.dbx.filesUpload({
        path: indexPath,
        contents: indexContent,
        mode: { '.tag': 'overwrite' },
        autorename: false,
        mute: false
      });
      
      console.log(`Updated backup index with ${backups.length} backups`);
    } catch (error: any) {
      console.error('Error updating backup index:', error);
      throw new Error(`Failed to update backup index: ${error.message}`);
    }
  }

  /**
   * Read backup index from Dropbox
   */
  async getBackupIndex(): Promise<any> {
    try {
      const indexPath = '/Aplicaciones/Spark Preset Manager/backup-index.json';
      const response = await this.dbx.filesDownload({ path: indexPath });
      const content = (response.result as any).fileBinary.toString('utf8');
      return JSON.parse(content);
    } catch (error: any) {
      if (error?.status === 409) { // File not found
        return { updated: null, backups: [] };
      }
      console.error('Error reading backup index:', error);
      throw new Error(`Failed to read backup index: ${error.message}`);
    }
  }
}

export default DropboxStreamingService;