import { Dropbox } from 'dropbox';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DropboxStreamingService } from './dropbox-streaming.service';

interface DropboxTokenResponse {
  access_token: string;
  token_type: string;
  uid: string;
  account_id: string;
  refresh_token?: string;
  expires_in?: number;
}

interface SparkPresetFile {
  name: string;
  path: string;
  id: string;
  size: number;
  modified: string;
}

interface PresetInfo {
  id: string;
  name: string;
  category?: string;
  contentHash?: string;
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
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export class DropboxService {
  private dbx: Dropbox | null = null;
  private readonly APP_FOLDER_PATH = '/'; // Root of app folder
  private readonly SPARK_AMP_PATH = '/Aplicaciones/Spark Amp'; // Spark Amp's folder in Dropbox
  private readonly BACKUP_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'backup-archives');
  private readonly IMPORT_HISTORY_PATH = path.join(process.cwd(), 'data', 'import-history.json');

  constructor(accessToken?: string) {
    if (accessToken) {
      this.dbx = new Dropbox({ 
        accessToken,
        fetch: fetch as any
      });
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<DropboxTokenResponse> {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.DROPBOX_APP_KEY || '',
      client_secret: process.env.DROPBOX_APP_SECRET || '',
      redirect_uri: process.env.DROPBOX_REDIRECT_URI || ''
    });

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json() as Promise<DropboxTokenResponse>;
  }

  /**
   * Get current user info
   */
  async getCurrentAccount() {
    if (!this.dbx) throw new Error('Dropbox client not initialized');
    
    const response = await this.dbx.usersGetCurrentAccount();
    return response.result;
  }

  /**
   * List all preset files in the Spark app folder
   * Returns full preset data, not just file metadata
   */
  async listPresets(): Promise<any[]> {
    if (!this.dbx) throw new Error('Dropbox client not initialized');

    try {
      // DIRECT APPROACH: We know the file is at this exact location
      const PRESET_BACKUP_PATH = '/Aplicaciones/Spark Amp/preset_backup.zip';
      
      try {
        console.log('Attempting direct download of:', PRESET_BACKUP_PATH);
        const presetFiles = await this.extractPresetsFromZip(PRESET_BACKUP_PATH);
        console.log(`Successfully extracted ${presetFiles.length} presets from backup ZIP`);
        return presetFiles;
      } catch (directError: any) {
        console.log('Direct download failed:', directError.message);
        console.log('Falling back to folder listing approach...');
      }
      // Try multiple locations for preset files
      const locations = [
        this.SPARK_AMP_PATH,           // /Aplicaciones/Spark Amp
        '/Aplicaciones',               // /Aplicaciones (parent folder)
        '',                            // Root folder
        this.APP_FOLDER_PATH           // App folder (fallback)
      ];

      let response;
      let foundLocation = null;

      for (const location of locations) {
        try {
          console.log('Attempting to access location:', location);
          
          // For empty string, use '' which lists root
          // For other paths, ensure we're listing contents not the folder itself
          const searchPath = location === '' ? '' : location;
          
          response = await this.dbx.filesListFolder({
            path: searchPath,
            recursive: true,
            include_non_downloadable_files: false,
            include_deleted: false,
            include_has_explicit_shared_members: false
          });
          foundLocation = location;
          console.log(`Successfully accessed location: ${location}`);
          break;
        } catch (error: any) {
          console.log(`Location ${location} not accessible:`, error.message);
        }
      }

      if (!response) {
        throw new Error('No accessible location found');
      }

      console.log('Total entries found:', response.result.entries.length);
      console.log('Searching in location:', foundLocation);
      
      // Debug: show all entries
      if (response.result.entries.length > 0) {
        console.log('All entries:', response.result.entries.map(e => `${e['.tag']} - ${e.name} - ${e.path_display || e.path_lower}`));
      }
      
      const presetFiles: SparkPresetFile[] = [];

      for (const entry of response.result.entries) {
        console.log('Entry found:', {
          tag: entry['.tag'],
          name: entry.name,
          path: entry.path_display || entry.path_lower,
          isZip: entry.name.endsWith('.zip'),
          isPreset: entry.name.endsWith('.preset')
        });
        
        // Look for individual preset files
        if (entry['.tag'] === 'file' && entry.name.endsWith('.preset')) {
          presetFiles.push({
            name: entry.name.replace('.preset', ''),
            path: entry.path_display || entry.path_lower || '',
            id: entry.id,
            size: entry.size,
            modified: entry.client_modified
          });
        }
        
        // Look for preset backup files (both .zip and .xip extensions)
        if (entry['.tag'] === 'file' && 
            (entry.name === 'preset_backup.zip' || 
             entry.name === '__preset_backup.xip' ||
             entry.name.toLowerCase().includes('preset') && (entry.name.endsWith('.zip') || entry.name.endsWith('.xip')))) {
          console.log(`Found preset backup file: ${entry.name}, extracting presets...`);
          try {
            const extractedPresets = await this.extractPresetsFromZip(entry.path_display || entry.path_lower || '');
            presetFiles.push(...extractedPresets);
            console.log(`Extracted ${extractedPresets.length} presets from ZIP`);
          } catch (zipError: any) {
            console.error('Error extracting presets from ZIP:', zipError.message);
          }
        }
      }

      console.log('Total preset files found:', presetFiles.length);
      return presetFiles;
    } catch (error: any) {
      console.error('Error listing presets:', error);
      throw new Error(`Failed to list presets: ${error.message}`);
    }
  }

  /**
   * Extract preset files from a ZIP archive
   */
  private async extractPresetsFromZip(zipPath: string): Promise<any[]> {
    if (!this.dbx) throw new Error('Dropbox client not initialized');

    try {
      // Download the ZIP file
      console.log('Downloading ZIP file:', zipPath);
      const response = await this.dbx.filesDownload({ path: zipPath });
      const zipBuffer = (response.result as any).fileBinary;

      // Debug: Save ZIP temporarily to analyze it
      const fs = require('fs');
      const path = require('path');
      const tempPath = path.join('/tmp', `debug_preset_backup_${Date.now()}.zip`);
      fs.writeFileSync(tempPath, zipBuffer);
      console.log(`DEBUG: ZIP saved to ${tempPath} (${zipBuffer.length} bytes)`);

      // Extract the ZIP contents
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      console.log(`Total entries in ZIP: ${zipEntries.length}`);
      
      // Log first 10 entries for debugging
      zipEntries.slice(0, 10).forEach(entry => {
        console.log(`  - ${entry.entryName} (${entry.isDirectory ? 'DIR' : 'FILE'})`);
      });
      
      const presets: any[] = [];
      
      for (const zipEntry of zipEntries) {
        // Look for preset.json files (not .preset)
        if (!zipEntry.isDirectory && zipEntry.entryName.endsWith('preset.json')) {
          console.log('Found preset in ZIP:', zipEntry.entryName);
          
          try {
            // Extract and parse the preset JSON content
            const presetContent = zipEntry.getData().toString('utf8');
            const presetData = JSON.parse(presetContent);
            
            // Debug: Log first preset structure
            if (presets.length === 0) {
              console.log('First preset data structure:', JSON.stringify(presetData, null, 2).substring(0, 500));
            }
            
            // Extract metadata from path
            const pathParts = zipEntry.entryName.split('/');
            const presetId = pathParts[pathParts.length - 2]; // UUID folder
            const category = pathParts[2]; // Category (Mic, Alternative, etc)
            
            // Extract effects from tone data
            const effects: string[] = [];
            const tone = presetData.tone || {};
            
            // Check for effects in tone data
            if (tone.effects) {
              Object.entries(tone.effects).forEach(([effect, settings]: [string, any]) => {
                if (settings && settings.isEnabled) {
                  // Map effect names to display names
                  const effectMap: {[key: string]: string} = {
                    'overdrive': 'Overdrive',
                    'distortion': 'Distortion',
                    'delay': 'Delay',
                    'reverb': 'Reverb',
                    'chorus': 'Chorus',
                    'compressor': 'Compressor',
                    'noisegate': 'Noise Gate'
                  };
                  const displayName = effectMap[effect.toLowerCase()] || effect;
                  effects.push(displayName);
                }
              });
            }
            
            // Extract the actual preset name from the data
            let presetName = presetData.name || presetData.preset_name || presetData.meta?.name;
            
            // If no name found, try to get it from sigpath
            if (!presetName && presetData.sigpath) {
              const match = presetData.sigpath.match(/.*?([^/]+)\.sigpack$/);
              if (match) {
                presetName = match[1];
              }
            }
            
            // Final fallback
            if (!presetName) {
              presetName = `${category} Preset`;
            }
            
            // Transform to match PresetWithEffects structure
            const preset = {
              meta: {
                id: presetId,
                name: presetName,
                description: presetData.description || presetData.meta?.description || null,
                icon: presetData.icon || presetData.meta?.icon || 'icon_Custom',
                icon_path: null,
                tags: [category],
                source: 'dropbox'
              },
              sigpath: presetData.sigpath || null,
              tone: tone,
              effects: effects,
              is_preset: true
            };
            
            presets.push(preset);
          } catch (error) {
            console.error(`Error parsing preset ${zipEntry.entryName}:`, error);
          }
        }
      }
      
      console.log(`Successfully parsed ${presets.length} presets from ZIP`);
      return presets;
    } catch (error: any) {
      console.error('Error extracting ZIP:', error);
      throw new Error(`Failed to extract ZIP file: ${error.message}`);
    }
  }

  /**
   * Extract presets from a local ZIP file
   */
  private extractPresetsFromLocalZip(localZipPath: string): any[] {
    try {
      console.log('Extracting presets from local ZIP:', localZipPath);
      
      // Read the local ZIP file
      const zipBuffer = fs.readFileSync(localZipPath);
      
      // Extract the ZIP contents
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      console.log(`Total entries in ZIP: ${zipEntries.length}`);
      
      const presets: any[] = [];
      
      for (const zipEntry of zipEntries) {
        // Look for preset.json files (not .preset)
        if (!zipEntry.isDirectory && zipEntry.entryName.endsWith('preset.json')) {
          console.log('Found preset in ZIP:', zipEntry.entryName);
          
          try {
            // Extract and parse the preset JSON content
            const presetContent = zipEntry.getData().toString('utf8');
            const presetData = JSON.parse(presetContent);
            
            // Extract metadata from path
            const pathParts = zipEntry.entryName.split('/');
            const presetId = pathParts[pathParts.length - 2]; // UUID folder
            const category = pathParts[2]; // Category (Mic, Alternative, etc)
            
            // We'll extract effects later during import processing
            let effects: string[] = [];
            
            // Extract preset name
            let presetName = 'Unnamed Preset';
            const meta = presetData.meta || presetData.preset?.meta;
            if (meta?.name) {
              presetName = meta.name;
            }
            
            presets.push({
              id: presetId,
              name: presetName,
              category,
              effects,
              filePath: `#${zipEntry.entryName}`, // Mark as ZIP entry
              tone: presetData
            });
          } catch (error) {
            console.error(`Error parsing preset ${zipEntry.entryName}:`, error);
          }
        }
      }
      
      console.log(`Successfully parsed ${presets.length} presets from local ZIP`);
      return presets;
    } catch (error: any) {
      console.error('Error extracting local ZIP:', error);
      throw new Error(`Failed to extract local ZIP file: ${error.message}`);
    }
  }

  /**
   * Download a preset file
   */
  async downloadPreset(path: string): Promise<any> {
    if (!this.dbx) throw new Error('Dropbox client not initialized');

    try {
      // Check if this is a virtual path from a ZIP file
      if (path.includes('#')) {
        const [zipPath, presetFileName] = path.split('#');
        console.log(`Downloading preset ${presetFileName} from ZIP ${zipPath}`);
        
        // Download the ZIP file
        const response = await this.dbx.filesDownload({ path: zipPath });
        const zipBuffer = (response.result as any).fileBinary;
        
        // Extract the specific preset file from the ZIP
        const zip = new AdmZip(zipBuffer);
        const presetEntry = zip.getEntry(presetFileName);
        
        if (!presetEntry) {
          throw new Error(`Preset file ${presetFileName} not found in ZIP`);
        }
        
        const presetContent = presetEntry.getData().toString();
        const presetData = JSON.parse(presetContent);
        
        return presetData;
      } else {
        // Handle regular file download
        const response = await this.dbx.filesDownload({ path });
        
        // The file binary is in response.result.fileBinary
        const fileContent = (response.result as any).fileBinary;
        
        // Parse the preset JSON
        const presetData = JSON.parse(fileContent.toString());
        
        return presetData;
      }
    } catch (error: any) {
      console.error('Error downloading preset:', error);
      throw new Error(`Failed to download preset: ${error.message}`);
    }
  }

  /**
   * Upload a preset file
   */
  async uploadPreset(name: string, presetData: any): Promise<void> {
    if (!this.dbx) throw new Error('Dropbox client not initialized');

    // Save to Spark Amp's folder to ensure compatibility
    const path = `${this.SPARK_AMP_PATH}/${name}.preset`;
    const contents = JSON.stringify(presetData, null, 2);

    try {
      await this.dbx.filesUpload({
        path,
        contents,
        mode: { '.tag': 'overwrite' },
        autorename: false,
        mute: true
      });
    } catch (error: any) {
      console.error('Error uploading preset:', error);
      throw new Error(`Failed to upload preset: ${error.message}`);
    }
  }

  /**
   * Delete a preset file
   */
  async deletePreset(path: string): Promise<void> {
    if (!this.dbx) throw new Error('Dropbox client not initialized');

    try {
      await this.dbx.filesDeleteV2({ path });
    } catch (error: any) {
      console.error('Error deleting preset:', error);
      throw new Error(`Failed to delete preset: ${error.message}`);
    }
  }

  /**
   * Check if we have access to the Spark app folder
   */
  async checkAccess(): Promise<boolean> {
    if (!this.dbx) return false;

    try {
      await this.dbx.filesListFolder({ path: this.APP_FOLDER_PATH });
      return true;
    } catch (error) {
      console.error('No access to Spark app folder:', error);
      return false;
    }
  }

  /**
   * Get backup info without downloading the entire file
   */
  async getBackupInfo(accessToken: string): Promise<BackupInfo> {
    this.dbx = new Dropbox({ accessToken, fetch: fetch as any });
    
    try {
      const zipPath = `${this.SPARK_AMP_PATH}/preset_backup.zip`;
      
      // Get file metadata
      const metadata = await this.dbx.filesGetMetadata({ path: zipPath });
      const fileMetadata = metadata.result as any;
      
      // Download just to get info (we'll optimize this later with partial download)
      const response = await this.dbx.filesDownload({ path: zipPath });
      const zipBuffer = (response.result as any).fileBinary;
      
      // Calculate MD5 hash
      const md5Hash = crypto.createHash('md5').update(zipBuffer).digest('hex');
      
      // Extract info from ZIP
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      const categories = new Set<string>();
      const presetNames: string[] = [];
      const presets: PresetInfo[] = [];
      let presetCount = 0;
      
      for (const entry of zipEntries) {
        if (!entry.isDirectory && entry.entryName.endsWith('preset.json')) {
          presetCount++;
          const pathParts = entry.entryName.split('/');
          const categoryFromPath = pathParts[2];
          if (categoryFromPath) {
            categories.add(categoryFromPath);
          }
          
          // Try to extract preset info from the JSON
          try {
            const presetContent = entry.getData().toString('utf8');
            const presetData = JSON.parse(presetContent);
            const name = presetData.meta?.name || presetData.name || presetData.preset_name || 'Unknown Preset';
            const id = presetData.meta?.id || presetData.id || pathParts[pathParts.length - 2];
            const category = presetData.meta?.category || presetData.category || categoryFromPath;
            
            // Generate content hash from preset tone data
            const toneData = presetData.tone || presetData;
            const contentToHash = JSON.stringify({
              sigpath: toneData.sigpath || [],
              bpm: toneData.bpm
            });
            const contentHash = crypto.createHash('md5').update(contentToHash).digest('hex');
            
            presetNames.push(name);
            if (id) {
              presets.push({ 
                id, 
                name,
                category,
                contentHash
              });
            }
          } catch (err) {
            // If we can't parse, use folder name
            const folderName = pathParts[pathParts.length - 2] || 'Unknown';
            presetNames.push(folderName);
            // Try to use folder name as ID if it looks like a UUID
            if (folderName && folderName.match(/^[0-9a-fA-F-]{36}$/)) {
              presets.push({ 
                id: folderName, 
                name: folderName,
                category: categoryFromPath
              });
            }
          }
        }
      }
      
      return {
        totalPresets: presetCount,
        categories: Array.from(categories).sort(),
        fileSize: fileMetadata.size || zipBuffer.length,
        fileSizeMB: ((fileMetadata.size || zipBuffer.length) / 1024 / 1024).toFixed(2) + ' MB',
        lastModified: fileMetadata.server_modified,
        md5Hash,
        presetNames: presetNames.sort(),
        presets
      };
    } catch (error: any) {
      console.error('Error getting backup info:', error);
      throw new Error(`Failed to get backup info: ${error.message}`);
    }
  }

  /**
   * Archive backup to Dropbox (no local download)
   */
  async archiveBackupToDropbox(accessToken: string): Promise<{ dropboxPath: string; md5Hash: string }> {
    const streamingService = new DropboxStreamingService(accessToken);
    const zipPath = `${this.SPARK_AMP_PATH}/preset_backup.zip`;
    
    return await streamingService.archiveBackupToDropbox(zipPath);
  }

  /**
   * Import presets from Dropbox backup (streaming)
   */
  async importPresetsFromDropbox(dropboxPath: string, userId: string, accessToken: string): Promise<ImportResult> {
    const streamingService = new DropboxStreamingService(accessToken);
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    
    try {
      // Stream presets directly from Dropbox
      const presets = await streamingService.streamPresetsFromDropbox(dropboxPath);
      
      // Create user presets directory if it doesn't exist
      const userPresetsPath = path.join(__dirname, '../../data/user-presets', userId);
      if (!fs.existsSync(userPresetsPath)) {
        fs.mkdirSync(userPresetsPath, { recursive: true });
      }
      
      // Process each preset
      for (const preset of presets) {
        try {
          // Save preset to local file system
          const presetPath = path.join(userPresetsPath, `${preset.id}.json`);
          
          // Create preset object with metadata
          const presetData = {
            meta: {
              id: preset.id,
              name: preset.name,
              category: preset.category,
              description: '',
              version: preset.tone?.meta?.version || '0.7',
              icon: 'icon.png',
              importedAt: new Date().toISOString(),
              importedFrom: 'dropbox_backup'
            },
            type: 'jamup_speaker',
            bpm: preset.tone?.bpm || 120,
            sigpath: preset.tone?.sigpath || preset.tone?.tone?.sigpath || [],
            importedAt: new Date().toISOString() // Add at root level for easier access
          };
          
          // Save preset file
          fs.writeFileSync(presetPath, JSON.stringify(presetData, null, 2));
          result.imported++;
          
          console.log(`Imported preset: ${preset.name} (${preset.id})`);
        } catch (error: any) {
          console.error(`Error importing preset ${preset.id}:`, error);
          result.errors.push(`Failed to import ${preset.name}: ${error.message}`);
        }
      }
      
      console.log(`Import completed: ${result.imported} imported, ${result.errors.length} errors`);
      
      // Get backup info for history
      const backupInfo = await streamingService.getBackupInfoFromDropbox(dropboxPath);
      
      // Save import history with backup info
      this.saveImportHistory(userId, dropboxPath, result, backupInfo);
      
      // Update backup index
      await streamingService.updateBackupIndex();
      
      return result;
    } catch (error: any) {
      console.error('Error importing presets:', error);
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Import presets from archived backup (legacy - for local files)
   */
  async importPresetsFromBackup(backupPath: string, userId: string): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    
    try {
      // Extract presets from local ZIP file
      const presets = this.extractPresetsFromLocalZip(backupPath);
      
      // Create user presets directory if it doesn't exist
      const userPresetsPath = path.join(__dirname, '../../data/user-presets', userId);
      if (!fs.existsSync(userPresetsPath)) {
        fs.mkdirSync(userPresetsPath, { recursive: true });
      }
      
      // Process each preset
      for (const preset of presets) {
        try {
          // Save preset to local file system
          const presetPath = path.join(userPresetsPath, `${preset.id}.json`);
          
          // Create preset object with metadata
          const presetData = {
            meta: {
              id: preset.id,
              name: preset.name,
              category: preset.category,
              description: '',
              version: preset.tone?.meta?.version || '0.7',
              icon: 'icon.png',
              importedAt: new Date().toISOString(),
              importedFrom: 'dropbox_backup'
            },
            type: 'jamup_speaker',
            bpm: preset.tone?.bpm || 120,
            sigpath: preset.tone?.sigpath || preset.tone?.tone?.sigpath || [],
            importedAt: new Date().toISOString() // Add at root level for easier access
          };
          
          // Save preset file
          fs.writeFileSync(presetPath, JSON.stringify(presetData, null, 2));
          result.imported++;
          
          console.log(`Imported preset: ${preset.name} (${preset.id})`);
        } catch (error: any) {
          console.error(`Error importing preset ${preset.id}:`, error);
          result.errors.push(`Failed to import ${preset.name}: ${error.message}`);
        }
      }
      
      console.log(`Import completed: ${result.imported} imported, ${result.errors.length} errors`);
      
      // Get backup info for history
      const backupInfo = await this.getBackupInfoFromArchive(backupPath);
      
      // Save import history with backup info
      this.saveImportHistory(userId, backupPath, result, backupInfo);
      
      return result;
    } catch (error: any) {
      console.error('Error importing presets:', error);
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Save import history
   */
  private saveImportHistory(userId: string, backupPath: string, result: ImportResult, backupInfo?: BackupInfo) {
    try {
      let history: any[] = [];
      
      if (fs.existsSync(this.IMPORT_HISTORY_PATH)) {
        const content = fs.readFileSync(this.IMPORT_HISTORY_PATH, 'utf8');
        history = JSON.parse(content);
      }
      
      history.push({
        userId,
        backupPath,
        timestamp: new Date().toISOString(),
        result,
        backupInfo
      });
      
      // Ensure directory exists
      const dir = path.dirname(this.IMPORT_HISTORY_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.IMPORT_HISTORY_PATH, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving import history:', error);
    }
  }

  /**
   * Get backup info from archived file
   */
  private async getBackupInfoFromArchive(archivePath: string): Promise<BackupInfo> {
    try {
      const zipBuffer = fs.readFileSync(archivePath);
      const zip = new AdmZip(archivePath);
      
      // Get file stats
      const stats = fs.statSync(archivePath);
      const fileSize = stats.size;
      const lastModified = stats.mtime.toISOString();
      
      // Calculate MD5 hash
      const md5Hash = crypto.createHash('md5').update(zipBuffer).digest('hex');
      
      // Count presets and get categories
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
        fileSize,
        fileSizeMB: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
        lastModified,
        md5Hash,
        presetNames
      };
    } catch (error) {
      console.error('Error getting backup info from archive:', error);
      // Return minimal info on error
      return {
        totalPresets: 0,
        categories: [],
        fileSize: 0,
        fileSizeMB: '0 MB',
        md5Hash: crypto.createHash('md5').update(archivePath).digest('hex')
      };
    }
  }

  /**
   * Get import history for user
   */
  async getImportHistory(userId: string): Promise<any[]> {
    try {
      if (!fs.existsSync(this.IMPORT_HISTORY_PATH)) {
        return [];
      }
      
      const content = fs.readFileSync(this.IMPORT_HISTORY_PATH, 'utf8');
      const history = JSON.parse(content);
      
      return history.filter((entry: any) => entry.userId === userId);
    } catch (error) {
      console.error('Error reading import history:', error);
      return [];
    }
  }
}

export default DropboxService;