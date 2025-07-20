import { Dropbox } from 'dropbox';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BACKUP_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'backup-archives');
const DROPBOX_BACKUPS_PATH = '/Aplicaciones/Spark Preset Manager/backups';

async function uploadExistingBackups() {
  // Use the fileTokenStore to get token
  const fileTokenStore = await import('../services/fileTokenStore.service').then(m => m.fileTokenStore);
  
  // Get the first user ID from history
  const historyPath = path.join(process.cwd(), 'data', 'import-history.json');
  if (!fs.existsSync(historyPath)) {
    console.error('No import history found');
    return;
  }
  
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  const userId = history[0]?.userId;
  
  if (!userId) {
    console.error('No user ID found in history');
    return;
  }
  
  const tokenData = fileTokenStore.getToken(userId);
  if (!tokenData?.accessToken) {
    console.error('No access token found for user:', userId);
    return;
  }

  const dbx = new Dropbox({ accessToken: tokenData.accessToken });

  // Create Dropbox folder if it doesn't exist
  try {
    await dbx.filesCreateFolderV2({ path: DROPBOX_BACKUPS_PATH });
    console.log(`Created folder: ${DROPBOX_BACKUPS_PATH}`);
  } catch (error: any) {
    if (error?.status !== 409) { // 409 means folder already exists
      console.error('Error creating folder:', error);
      return;
    }
  }

  // Get all backup files
  const backupFiles = fs.readdirSync(BACKUP_ARCHIVE_PATH).filter(f => f.endsWith('.zip'));
  
  console.log(`Found ${backupFiles.length} backup files to upload`);

  for (const fileName of backupFiles) {
    const localPath = path.join(BACKUP_ARCHIVE_PATH, fileName);
    const dropboxPath = `${DROPBOX_BACKUPS_PATH}/${fileName}`;
    
    try {
      // Check if file already exists in Dropbox
      try {
        await dbx.filesGetMetadata({ path: dropboxPath });
        console.log(`✓ Already exists in Dropbox: ${fileName}`);
        continue;
      } catch (error) {
        // File doesn't exist, proceed with upload
      }

      console.log(`Uploading ${fileName}...`);
      const fileContent = fs.readFileSync(localPath);
      
      await dbx.filesUpload({
        path: dropboxPath,
        contents: fileContent,
        mode: { '.tag': 'overwrite' },
        autorename: false,
        mute: false
      });
      
      console.log(`✓ Uploaded: ${fileName}`);
    } catch (error) {
      console.error(`✗ Error uploading ${fileName}:`, error);
    }
  }

  console.log('\nUpload complete!');
  console.log('\nYou can now delete local backups with:');
  console.log(`rm -rf ${BACKUP_ARCHIVE_PATH}/*`);
}

// Run the script
uploadExistingBackups().catch(console.error);