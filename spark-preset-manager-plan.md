# Plan de Desarrollo - Spark Preset Manager

## 🎯 Visión del Producto

Una aplicación web que permite a los usuarios de Spark Amp gestionar, organizar y crear presets de manera inteligente, integrándose con Dropbox para sincronización y utilizando IA para generación creativa de nuevos presets.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: Firestore
- **Almacenamiento**: Google Cloud Storage + Dropbox API
- **IA**: Claude API (Anthropic)
- **Hosting**: Google Cloud Run
- **Autenticación**: Firebase Auth + Dropbox OAuth

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway (Express)                     │
├──────────────────┬────────────────┬────────────────────────┤
│  Dropbox Service │  Claude Service │  Preset Service        │
├──────────────────┴────────────────┴────────────────────────┤
│                       Firestore DB                           │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Fases de Desarrollo

### Fase 1: MVP Básico (2-3 semanas)

#### Sprint 1.1: Setup y Autenticación (1 semana)
- [ ] Configurar proyecto en Google Cloud "spark-tool"
- [ ] Setup inicial del repositorio y CI/CD
- [ ] Implementar autenticación con Firebase
- [ ] Integrar OAuth con Dropbox (App Folder permissions)
- [ ] Crear landing page y flujo de onboarding

#### Sprint 1.2: Importación de Presets (1 semana)
- [ ] Implementar descarga de `presets_backup.zip` desde Dropbox
- [ ] Parser de archivos JSON de presets
- [ ] Almacenamiento en Firestore
- [ ] UI básica de listado de presets
- [ ] Manejo de errores (archivo no encontrado, formato inválido)

#### Sprint 1.3: Gestión Básica (1 semana)
- [ ] Vista de presets por categorías
- [ ] Funcionalidad de búsqueda
- [ ] Eliminar presets
- [ ] Sistema de archivado básico

### Fase 2: Funcionalidades Avanzadas (3-4 semanas)

#### Sprint 2.1: Generación con IA (1.5 semanas)
- [ ] Integración con Claude API
- [ ] Diseño de prompts optimizados para generación de presets
- [ ] UI de generación (input de texto + sugerencias)
- [ ] Validación de presets generados
- [ ] Sistema de feedback del usuario

#### Sprint 2.2: Exportación y Sincronización (1.5 semanas)
- [ ] Generación de `presets_backup.zip` modificado
- [ ] Upload a Dropbox con permisos de escritura
- [ ] Sistema de detección de cambios
- [ ] Prevención de duplicados (hash de presets)
- [ ] UI de sincronización con estados

#### Sprint 2.3: Mejoras UX/UI (1 semana)
- [ ] Implementar una de las 3 propuestas visuales
- [ ] Vista previa de presets (visualización de parámetros)
- [ ] Drag & drop para reorganizar
- [ ] Modo oscuro/claro
- [ ] Responsive design

### Fase 3: Features Premium (2-3 semanas)

#### Sprint 3.1: Análisis y Recomendaciones (1 semana)
- [ ] Analytics de uso de presets
- [ ] Sistema de recomendaciones basado en uso
- [ ] Comparación de presets similares
- [ ] Tags automáticos con IA

#### Sprint 3.2: Colaboración y Compartir (1 semana)
- [ ] Sistema de compartir presets públicos
- [ ] Comentarios y ratings
- [ ] Colecciones curadas
- [ ] Export/Import directo sin Dropbox

#### Sprint 3.3: Optimización y Polish (1 semana)
- [ ] Optimización de performance
- [ ] Tests E2E
- [ ] Documentación de usuario
- [ ] Sistema de feedback in-app

## 🔧 Detalles Técnicos

### Estructura de Datos

```typescript
interface Preset {
  id: string; // UUID del preset
  userId: string;
  name: string;
  description: string;
  category: string;
  sigpath: SignalPath[];
  bpm: number;
  meta: PresetMeta;
  customTags?: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  source: 'dropbox' | 'ai-generated' | 'manual';
  originalHash?: string; // Para detección de duplicados
}

interface SignalPath {
  type: string;
  dspId: string;
  active: boolean;
  params: Parameter[];
}

interface Parameter {
  index: number;
  value: number | boolean;
}
```

### Integración Dropbox

```typescript
// Configuración de permisos
const DROPBOX_PERMISSIONS = {
  scope: 'files.content.read files.content.write',
  appFolder: '/Apps/Spark Amp',
  targetFile: 'presets_backup.zip'
};

// Flujo de autenticación
async function authenticateDropbox(userId: string) {
  // 1. Redirect a Dropbox OAuth
  // 2. Callback con token
  // 3. Guardar token encriptado en Firestore
  // 4. Verificar acceso a carpeta de app
}
```

### Prompts para Claude

```typescript
const PRESET_GENERATION_PROMPT = `
Genera un preset de Spark Amp basado en la siguiente descripción:
"{userInput}"

Usa el formato JSON especificado, con valores normalizados 0.0-1.0.
Incluye una cadena de señal lógica con:
1. Noise gate (siempre primero)
2. Efectos apropiados para el estilo
3. Amplificador adecuado
4. Modulación/delay si corresponde
5. Reverb (siempre último)

Devuelve solo el JSON válido sin explicaciones.
`;
```

### Sistema Anti-Duplicados

```typescript
function generatePresetHash(preset: Preset): string {
  // Hash basado en:
  // - Nombre normalizado
  // - DSP IDs en orden
  // - Valores de parámetros redondeados
  const normalized = {
    name: preset.name.toLowerCase().trim(),
    chain: preset.sigpath.map(fx => ({
      dsp: fx.dspId,
      params: fx.params.map(p => Math.round(p.value * 100))
    }))
  };
  return crypto.createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
```

## 🚀 Deployment

### Google Cloud Setup

```bash
# Crear proyecto
gcloud projects create spark-tool --name="Spark Preset Manager"

# Asociar facturación
gcloud beta billing projects link spark-tool \
  --billing-account=BILLING_ACCOUNT_ID

# Habilitar APIs necesarias
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com

# Configurar Firebase
firebase init --project spark-tool
```

### Variables de Entorno

```env
# Dropbox
DROPBOX_APP_KEY=xxx
DROPBOX_APP_SECRET=xxx
DROPBOX_REDIRECT_URI=https://spark-tool.web.app/auth/dropbox/callback

# Claude API
ANTHROPIC_API_KEY=xxx

# Firebase
FIREBASE_PROJECT_ID=spark-tool
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# Google Cloud
GCP_PROJECT_ID=spark-tool
GCS_BUCKET=spark-tool-presets
```

## 📊 Métricas de Éxito

### KPIs Principales
- **Usuarios Activos Mensuales (MAU)**: Target 1,000 en 3 meses
- **Presets Generados con IA**: 30% del total
- **Tasa de Retención**: >60% después de 1 mes
- **Tiempo de Sincronización**: <5 segundos
- **Satisfacción del Usuario**: NPS >50

### Analytics a Implementar
- Eventos de generación de presets
- Flujo de usuario (funnel)
- Errores de sincronización
- Uso de features
- Performance metrics

## 🔒 Seguridad

### Consideraciones
- Tokens de Dropbox encriptados en reposo
- Rate limiting en API endpoints
- Validación estricta de presets
- Sanitización de inputs para IA
- CORS configurado correctamente
- Secrets en Google Secret Manager

## 💰 Modelo de Monetización (Futuro)

### Plan Gratuito
- 50 presets activos
- 10 generaciones con IA/mes
- Sincronización básica

### Plan Pro ($4.99/mes)
- Presets ilimitados
- 100 generaciones con IA/mes
- Backup automático
- Compartir presets
- Soporte prioritario

## 🗓️ Timeline Estimado

- **MVP**: 6-8 semanas
- **Beta Pública**: 10-12 semanas
- **Lanzamiento v1.0**: 14-16 semanas

## 📝 Próximos Pasos

1. Crear repositorio GitHub
2. Setup proyecto Google Cloud
3. Diseño detallado de API
4. Mockups finales basados en propuestas Frame0
5. Inicio Sprint 1.1

---

**Última actualización**: ${new Date().toISOString()}
**Estado**: En planificación
**Owner**: jorge.uriarte@gailen.es