# Flujo de Autenticación OAuth con Dropbox

## Configuración Necesaria

### 1. Crear App en Dropbox

1. Ir a [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Crear nueva app:
   - **Tipo**: Scoped access
   - **Acceso**: App folder
   - **Nombre**: Tu nombre de app
3. Configurar permisos:
   - `files.metadata.read`
   - `files.content.read`
   - `files.content.write`
4. Agregar Redirect URI: `http://localhost:3001/api/auth/dropbox/callback`

### 2. Variables de Entorno

```env
# Dropbox OAuth
DROPBOX_APP_KEY=tu_app_key_aqui
DROPBOX_APP_SECRET=tu_app_secret_aqui
DROPBOX_REDIRECT_URI=http://localhost:3001/api/auth/dropbox/callback

# Session
SESSION_SECRET=tu-session-secret-aqui
JWT_SECRET=tu-jwt-secret-aqui
```

## Flujo de Autenticación

### 1. Inicio del Flujo
```
Usuario → Click "Connect Dropbox" → GET /api/auth/dropbox
```

### 2. Redirección a Dropbox
```javascript
// Backend redirige a:
https://www.dropbox.com/oauth2/authorize?
  client_id=APP_KEY&
  response_type=code&
  redirect_uri=REDIRECT_URI&
  token_access_type=offline
```

### 3. Usuario Autoriza
- Usuario ve la página de autorización de Dropbox
- Acepta permisos para la carpeta `/Apps/Spark Amp/`

### 4. Callback
```
Dropbox → GET /api/auth/dropbox/callback?code=AUTH_CODE
```

### 5. Intercambio de Token
```javascript
// Backend intercambia código por token:
POST https://api.dropboxapi.com/oauth2/token
{
  code: AUTH_CODE,
  grant_type: 'authorization_code',
  client_id: APP_KEY,
  client_secret: APP_SECRET,
  redirect_uri: REDIRECT_URI
}
```

### 6. Almacenamiento de Token
- Token se guarda en sesión (desarrollo)
- En producción: Encriptar y guardar en base de datos
- Se genera JWT para el frontend

### 7. Redirección Final
```
Backend → Redirect → Frontend /dashboard?token=JWT_TOKEN
```

## Uso del Token

### Listar Presets
```javascript
const dropboxService = new DropboxService(accessToken);
const presets = await dropboxService.listPresets();
// Retorna archivos .preset en /Apps/Spark Amp/
```

### Descargar Preset
```javascript
const presetData = await dropboxService.downloadPreset('/preset-name.preset');
// Retorna el JSON del preset
```

### Subir Preset
```javascript
await dropboxService.uploadPreset('My New Preset', presetData);
// Guarda en /Apps/Spark Amp/My New Preset.preset
```

## Estructura de la Carpeta

```
/Apps/Spark Amp/
├── Preset1.preset
├── Preset2.preset
├── My Custom Preset.preset
└── ...
```

## Notas Importantes

1. **App Folder**: La app solo tiene acceso a `/Apps/Spark Amp/`
2. **Formato**: Los archivos son `.preset` con JSON interno
3. **Permisos**: Solo necesitamos leer/escribir archivos
4. **Token**: En producción, usar refresh tokens
5. **Seguridad**: Nunca exponer tokens en el frontend

## Testing en Desarrollo

Para probar sin Dropbox real:
```env
USE_MOCK_AUTH=true
```

Esto usa datos de ejemplo de `/PresetExamples/`