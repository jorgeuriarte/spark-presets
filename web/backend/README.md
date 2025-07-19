# Spark Preset Manager - Backend

Node.js + Express backend for the Spark Preset Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Set up Google Cloud credentials:
- Create a service account in Google Cloud Console
- Download the JSON key file
- Set the path in GOOGLE_APPLICATION_CREDENTIALS

4. Configure Dropbox App:
- Create a new app at https://www.dropbox.com/developers/apps
- Set permissions to access "Apps/Spark Amp" folder
- Add redirect URI: http://localhost:3001/auth/dropbox/callback

## Development

Run the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `GET /api/auth/dropbox` - Initiate Dropbox OAuth
- `GET /api/auth/dropbox/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Presets
- `GET /api/presets` - Get all presets
- `GET /api/presets/:id` - Get preset by ID
- `POST /api/presets` - Create new preset
- `PUT /api/presets/:id` - Update preset
- `DELETE /api/presets/:id` - Delete preset
- `POST /api/presets/generate` - Generate preset with AI
- `POST /api/presets/duplicate/:id` - Duplicate preset
- `GET /api/presets/duplicates/check` - Check for duplicates

### Dropbox
- `GET /api/dropbox/status` - Check connection status
- `POST /api/dropbox/download` - Download presets from Dropbox
- `POST /api/dropbox/upload` - Upload presets to Dropbox