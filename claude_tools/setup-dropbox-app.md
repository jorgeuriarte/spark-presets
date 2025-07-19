# Guía para Configurar la App de Dropbox

## Pasos para crear la app:

### 1. Iniciar sesión en Dropbox
- Ve a https://www.dropbox.com/developers/apps
- Inicia sesión con tu cuenta de Dropbox

### 2. Crear nueva app
- Click en "Create app"
- Selecciona las siguientes opciones:

#### Choose an API:
- **Scoped access** ✅

#### Choose the type of access:
- **App folder** ✅ (Acceso solo a una carpeta de la app)

#### Name your app:
- Nombre sugerido: `Spark Preset Manager` (o el que prefieras)
- Nota: El nombre debe ser único en Dropbox

### 3. Configurar la app

Una vez creada, ve a la configuración:

#### En la pestaña "Settings":

1. **OAuth 2 - Redirect URIs**:
   - Agrega: `http://localhost:3001/api/auth/dropbox/callback`
   - Click "Add"

2. **Copia las credenciales**:
   - **App key**: (copiar este valor)
   - **App secret**: (click en "Show" y copiar)

### 4. Configurar permisos

Ve a la pestaña "Permissions" y marca:

- ✅ `files.metadata.read` - Ver información sobre archivos y carpetas
- ✅ `files.content.read` - Leer el contenido de archivos
- ✅ `files.content.write` - Editar contenido de archivos y carpetas

Click "Submit" para guardar los permisos.

### 5. Actualizar el archivo .env

En `/web/backend/.env`, actualiza:

```env
# Dropbox OAuth Configuration
DROPBOX_APP_KEY=tu_app_key_aqui
DROPBOX_APP_SECRET=tu_app_secret_aqui
DROPBOX_REDIRECT_URI=http://localhost:3001/api/auth/dropbox/callback
```

### 6. Verificar la configuración

1. Reinicia el servidor backend si está corriendo
2. La URL de autenticación será: `http://localhost:3001/api/auth/dropbox`

## Notas importantes:

- La app tendrá acceso solo a la carpeta `/Apps/[Tu nombre de app]/`
- Spark guarda los presets en `/Apps/Spark Amp/Presets/`
- Los usuarios verán el nombre de tu app cuando autoricen el acceso
- En producción, cambia el redirect URI a tu dominio real

## Próximos pasos:

1. Crear botón "Connect Dropbox" en el frontend
2. Manejar el token JWT después del callback
3. Mostrar los presets del usuario desde Dropbox