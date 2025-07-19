# Spark Preset Manager

Web application for managing Spark amp presets through Dropbox integration.

## Project Structure

```
web/
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express API
└── shared/           # Shared types and utilities
```

## Features

- Connect to Dropbox account to access presets
- View, edit, and delete presets
- AI-powered preset generation using Claude API
- Duplicate prevention system
- Export presets back to Dropbox

## Quick Start (Development Mode)

1. Install dependencies:
```bash
npm run install:all
```

2. Start both servers in development mode:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

In development mode with mock authentication enabled, you'll be automatically logged in as a test user and can see example presets from the PresetExamples directory.

## Development Mode Features

- **Mock Authentication**: No need for real Dropbox OAuth in development
- **Example Presets**: Loads presets from `PresetExamples/` directory
- **Hot Reload**: Both frontend and backend support hot reloading

## Environment Variables

Both frontend and backend have `.env.example` files. Copy them to `.env` for development:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

## Available Scripts

- `npm run dev` - Start both servers concurrently
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend server
- `npm run install:all` - Install dependencies for both projects

## Next Steps

1. Configure Google Cloud project (spark-tool)
2. Set up Dropbox OAuth for production
3. Integrate Claude API for preset generation
4. Deploy to Google Cloud Run