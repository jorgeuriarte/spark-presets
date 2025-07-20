# Diario de Desarrollo - Spark Preset Manager

## 2025-07-19 - Inicio del Proyecto Web

### Qué se hizo
- Creación de rama feature/web-implementation
- Inicialización de estructura del proyecto:
  - Backend: Node.js + Express + TypeScript
  - Frontend: React + TypeScript + Tailwind CSS
- Configuración base del backend:
  - Rutas API para autenticación, presets y Dropbox
  - Servicios para manejo de presets y detección de duplicados
  - Middleware de autenticación y manejo de errores
- Configuración base del frontend:
  - Componentes UI basados en la Propuesta 2 evolucionada
  - Sistema de rutas con React Router
  - Context API para autenticación
  - Integración con React Query para cache de datos

### Decisiones tomadas
- Usar TypeScript en ambos lados para type safety
- Implementar autenticación con JWT tokens
- Usar React Query para manejo eficiente del estado del servidor
- Diseño mobile-first con Tailwind CSS
- Separación clara entre backend API y frontend SPA

### Desafíos/Aprendizajes
- La integración con Dropbox requiere OAuth flow completo
- El sistema de detección de duplicados usa hash SHA256 normalizado
- Los presets no incluyen información de hardware, solo configuración de sonido

### Próximos pasos
- Configurar proyecto en Google Cloud (spark-tool)
- Implementar autenticación completa con Dropbox OAuth
- Crear formularios de edición y creación de presets
- Integrar con Claude API para generación de presets
- Implementar sistema de sincronización bidireccional con Dropbox

## 2025-07-19 - Implementación OAuth Dropbox y Sistema de Tokens

### Qué se hizo
- Implementación completa del flujo OAuth 2.0 con Dropbox:
  - Creación de nueva app Dropbox con permisos Full Dropbox
  - Configuración de tokens offline para acceso permanente
  - Redirect URI funcionando correctamente
- Sistema de almacenamiento persistente de tokens:
  - FileTokenStore con encriptación AES-256-CBC
  - Los tokens sobreviven reinicios del servidor
  - Almacenamiento en directorio .tokens
- Extracción y procesamiento de presets desde ZIP:
  - Búsqueda de preset_backup.zip en Dropbox
  - Extracción de archivos .preset usando adm-zip
  - Parseo de JSON y extracción de nombres reales
- Configuración de Tailwind CSS para estilos
- Limpieza del código: eliminación de PresetExamples

### Decisiones tomadas
- Usar almacenamiento en archivo para tokens (más simple que base de datos)
- Encriptar tokens en reposo por seguridad
- Extraer presets directamente del ZIP sin descargar todo el archivo
- Mostrar nombres reales de presets desde el JSON

### Desafíos/Aprendizajes
- Dropbox requiere permisos "Full Dropbox" para acceder a carpetas de aplicaciones
- Los tokens se perdían en cada reinicio hasta implementar persistencia
- Los nombres de presets estaban en campos variados del JSON (name, preset_name, meta.name)
- Tailwind requiere configuración específica con PostCSS

### Próximos pasos
- Rediseñar flujo: mostrar información del backup sin importar automáticamente
- Implementar botón "Importar backup de Spark" con proceso manual
- Investigar identificadores únicos en presets para evitar duplicados
- Implementar sistema de detección de cambios (MD5/hash)
- Crear archivo histórico de backups ZIP