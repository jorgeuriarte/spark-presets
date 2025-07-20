# Diario de Desarrollo - Spark Preset Manager

## 2025-07-20 - Mapeo Completo de Efectos y DSP IDs

### Qué se hizo
- Análisis del problema de mapeo de IDs de efectos (bias.noisegate, BassComp, etc.)
- Investigación del proyecto Ignitron para obtener mapeos correctos
- Creación de archivo dsp-mappings.ts con mapeo completo de DSP IDs a nombres
- Implementación de preset-processor para extraer efectos del sigpath
- Actualización de PresetViewer para usar nombres correctos de efectos
- Integración del procesador en el controlador de presets

### Decisiones tomadas
- Crear un mapeo centralizado basado en la información de Ignitron
- Procesar presets al cargarlos para extraer efectos correctamente
- Mantener compatibilidad con diferentes formatos de presets
- Usar el mismo mapeo en frontend y backend

### Desafíos/Aprendizajes
- Los DSP IDs varían entre diferentes versiones del Spark
- Algunos efectos tienen múltiples IDs posibles
- El proyecto Ignitron tiene documentación valiosa sobre los efectos
- Necesario manejar claves duplicadas en el mapeo

### Próximos pasos
- Completar el mapeo con más efectos si aparecen
- Implementar la visualización de sprites faltantes
- Mejorar la extracción de parámetros específicos por tipo

## 2025-07-20 - Corrección de Mapeo de Sprites

### Qué se hizo
- Identificación del problema: los dspIds del backend no coincidían con los del sprite map
- Creación de mapeo de IDs alternativos en sprite-coordinates.ts
- Actualización de getSpriteByDspId para buscar por IDs alternativos
- Mapeo de efectos como bias.noisegate → NoiseGate, BassComp → Comp, etc.

### Decisiones tomadas
- Mantener los dspIds originales del sprite map como canónicos
- Crear un mapeo de traducción para IDs alternativos
- Reutilizar sprites existentes para efectos similares

### Desafíos/Aprendizajes
- Los presets usan diferentes IDs que los sprites (ej: bias.noisegate vs NoiseGate)
- Algunos efectos comparten el mismo sprite visual
- Necesario mantener compatibilidad con múltiples formatos de IDs

### Próximos pasos
- Obtener coordenadas exactas para efectos que no tienen sprite propio
- Crear sprites genéricos para efectos no mapeados
- Documentar todos los posibles dspIds

## 2025-07-20 - Mejoras UI: Filtros y Visor de Presets

### Qué se hizo
- Implementación de filtros por categoría en la lista de presets
- Añadido badge de categoría en cada preset con colores distintivos
- Rediseño de PresetItem con diseño más compacto (padding reducido)
- Añadido botón "ver" (ícono de ojo) para expandir el visor de preset
- Implementación de visor de preset expandible que muestra la cadena de efectos
- Tooltips interactivos que muestran la configuración de cada efecto al hacer clic

### Decisiones tomadas
- Usar categorías existentes del backup de Spark para los filtros
- Mostrar contador de presets en cada categoría
- Diseño inline para el visor expandible en lugar de modal
- Tooltips con información de parámetros formateada en porcentajes
- Mantener el tema claro para mejor legibilidad

### Desafíos/Aprendizajes
- Las categorías vienen del campo category o del primer tag
- Los parámetros de efectos necesitan nombres descriptivos por tipo
- El visor necesita ser responsive para cadenas largas de efectos

### Próximos pasos
- Implementar edición de presets
- Añadir funcionalidad de búsqueda en el header
- Implementar creación de nuevos presets
- Sistema de detección de presets modificados (MD5/hash)

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