# Dropbox App Credentials

## App Information
- **App Name**: Spark Preset Manager
- **App Type**: Scoped App (App Folder)
- **App Folder Name**: Spark Preset Manager
- **App Key**: `bvygqywoiveh5xl`
- **App Secret**: `kmql1z4otjjm5nu`

## Configuration
- **Status**: Development
- **Redirect URI**: `http://localhost:3001/api/auth/dropbox/callback`

## Permissions Configured
- ✅ `account_info.read` - View basic account information (automatically included)
- ✅ `files.metadata.read` - View information about files and folders
- ✅ `files.content.read` - View content of files and folders
- ✅ `files.content.write` - Edit content of files and folders

## Access
- The app has access to `/Apps/Spark Preset Manager/` folder
- This is where Spark stores presets (we'll access the `/Presets` subfolder)

## Next Steps
1. ✅ Dropbox app created and configured
2. ✅ Redirect URI added
3. ✅ Permissions set
4. ✅ Credentials saved to .env file
5. [ ] Implement "Connect Dropbox" button in frontend
6. [ ] Test OAuth flow
7. [ ] Display presets from Dropbox

## Notes
- The app is in development mode, only accessible by the app owner
- For production, you'll need to apply for production approval
- The app folder will be created automatically when the user authorizes the app