# Documentación del Proyecto Spark Preset Manager

## Índice de Documentación

### Documentación Técnica
- [Referencia de Efectos y Amplificadores](../spark-effects-amps-reference.md) - Catálogo completo de DSPs disponibles
- [Especificación del Formato de Presets](../preset-format-specification.md) - Estructura JSON de los archivos preset
- [Plan de Desarrollo del Producto](../spark-preset-manager-plan.md) - Arquitectura y roadmap del proyecto

### Diarios y Notas
- [Diario de Desarrollo](DIARY.md) - Registro diario de progreso y decisiones

### Guías de Desarrollo
- [README Backend](../web/backend/README.md) - Configuración y desarrollo del servidor
- [README Frontend](../web/frontend/README.md) - Configuración y desarrollo del cliente web

### Scripts y Herramientas
- `preset-validator.py` - Validador de archivos preset
- `preset-generator.py` - Generador programático de presets
- `preset-manager.py` - Gestor básico de presets

## Estructura del Proyecto

```
spark-presets/
├── docs/                    # Documentación del proyecto
├── web/                     # Aplicación web
│   ├── backend/            # API Node.js + Express
│   ├── frontend/           # React + TypeScript
│   └── shared/            # Tipos compartidos
├── claude_tools/           # Scripts auxiliares
└── PresetExamples/         # Ejemplos de presets reales
```

## Enlaces Rápidos

- [Dropbox App Console](https://www.dropbox.com/developers/apps) - Para configurar OAuth
- [Google Cloud Console](https://console.cloud.google.com) - Proyecto spark-tool
- [Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) - Para generación con IA