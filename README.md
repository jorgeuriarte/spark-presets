# Spark Presets - Herramientas de Gestión

Este repositorio contiene herramientas completas para crear, validar y gestionar presets de amplificadores Spark de Positive Grid.

## 📁 Archivos Incluidos

### Documentación
- **`spark-effects-amps-reference.md`** - Referencia completa de todos los efectos y amplificadores disponibles
- **`preset-format-specification.md`** - Especificación técnica del formato de presets
- **`README.md`** - Este archivo

### Herramientas
- **`preset-validator.py`** - Validador de presets con verificación completa
- **`preset-generator.py`** - Generador programático de presets con plantillas
- **`preset-manager.py`** - Herramienta de gestión integral (CLI)

### Ejemplos
- **`PresetExamples/`** - Colección de presets de ejemplo organizados por categoría

## 🚀 Instalación

### Requisitos
```bash
pip install Pillow jsonschema
```

### Verificación
```bash
python preset-validator.py --help
python preset-generator.py --help
python preset-manager.py --help
```

## 🛠️ Uso de las Herramientas

### 1. Validador de Presets

Valida la estructura, formato JSON, DSP IDs y parámetros de presets.

```bash
# Validar presets en un directorio
python preset-validator.py PresetExamples/

# Validación con salida detallada
python preset-validator.py PresetExamples/ --verbose
```

**Validaciones realizadas:**
- ✅ Estructura de directorios correcta
- ✅ JSON válido y esquemas correctos
- ✅ DSP IDs válidos para efectos y amplificadores
- ✅ Rangos de parámetros (0.0-1.0)
- ✅ Unicidad de UUIDs
- ✅ Presencia de archivos requeridos (preset.json, icon.png)
- ✅ Orden correcto de efectos (noise gate primero, reverb último)
- ✅ Exactamente un amplificador por preset

### 2. Generador de Presets

Permite crear presets programáticamente usando plantillas predefinidas.

```bash
# Generar presets de ejemplo
python preset-generator.py
```

**Plantillas disponibles:**
- `clean_jazz()` - Tono limpio para jazz
- `blues_overdrive()` - Overdrive clásico para blues  
- `metal_high_gain()` - Distorsión pesada para metal
- `acoustic_natural()` - Guitarra acústica natural
- `bass_funk()` - Bajo punchy para funk

**Ejemplo programático:**
```python
from preset_generator import PresetGenerator

# Crear preset personalizado
preset = (PresetGenerator()
    .new_preset("Mi Preset", "Descripción personalizada")
    .add_noise_gate(0.1, 0.15)
    .add_compressor('la2a', {'peak_reduction': 0.3, 'gain': 0.4})
    .add_amplifier('black_duo', gain=0.5, bass=0.6, mid=0.5, treble=0.7)
    .add_delay('vintage', 0.3, 0.2, 0.25)
    .add_reverb(0.3, 0.4, mix=0.3)
    .save_preset("output/", "Blues"))
```

### 3. Gestor de Presets (CLI)

Herramienta todo-en-uno para gestionar presets.

```bash
# Listar presets disponibles
python preset-manager.py list PresetExamples/

# Validar presets
python preset-manager.py validate PresetExamples/ --verbose

# Generar plantillas
python preset-manager.py generate output/

# Crear preset interactivamente
python preset-manager.py create output/

# Exportar presets a ZIP
python preset-manager.py export PresetExamples/ my-presets.zip

# Importar presets desde ZIP
python preset-manager.py import my-presets.zip imported/ --overwrite
```

## 📋 Formato de Presets

### Estructura de Directorios
```
PresetCategory/
├── category.json           # Metadatos de la categoría
├── PresetUUID1/
│   ├── preset.json        # Configuración del preset
│   └── icon.png          # Icono 256x256 PNG
└── PresetUUID2/
    ├── preset.json
    └── icon.png
```

### Archivo preset.json
```json
{
  "meta": {
    "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "name": "Nombre del Preset",
    "description": "Descripción del preset",
    "version": "0.7",
    "icon": "icon.png"
  },
  "type": "jamup_speaker",
  "bpm": 120,
  "sigpath": [
    {
      "type": "speaker_fx",
      "dspId": "bias.noisegate",
      "active": true,
      "params": [
        {"index": 0, "value": 0.1},
        {"index": 1, "value": 0.15}
      ]
    }
  ]
}
```

## 🎛️ DSP IDs Disponibles

### Efectos
- **Noise Gate:** `bias.noisegate`
- **Compresores:** `LA2AComp`, `RedComp`, `BassComp`, `BBEOpticalComp`, `SustainerComp`
- **Overdrives:** `DistortionTS9`, `Overdrive`, `CloneDrive`, `GuitarMuff`, `FuzzFace`, etc.
- **Modulación:** `Tremolo`, `ChorusDigital`, `Flanger`, `Phaser`, `UniVibe`, etc.
- **Delays:** `DelayMono`, `VintageDelay`, `MultiHead`, `EchoTape`, etc.
- **Reverb:** `bias.reverb`

### Amplificadores por Categoría

**Clean:** `JC120`, `Twin`, `ADClean`, `MatchDC30`, `ODS50`
**Glassy:** `AC30`, `Checkmate`, `TwoRockSP50`
**Crunch:** `TweedBass`, `AmericanDeluxe`, `Plexiglass`
**High Gain:** `AmericanHighGain`, `RB101`, `SLO100`, `YJM100`
**Metal:** `Treadplate`, `EVH`, `Insane6508`, `RockerV`, `BE101`
**Bass:** `RB800`, `W600`, `Sunny3000`, `Hammer500`
**Acoustic:** `PureAcoustic`, `Fishboy`, `Jumbo`, `FlatAcoustic`

## 🔧 Desarrollo

### Estructura del Código

- **`preset_validator.py`** - Clases de validación con esquemas JSON
- **`preset_generator.py`** - Generador con API fluida y plantillas
- **`preset_manager.py`** - CLI y funciones de alto nivel

### Extender el Sistema

```python
# Añadir nueva plantilla
@staticmethod
def mi_estilo_personalizado(name: str = "Mi Estilo") -> PresetGenerator:
    return (PresetGenerator()
        .new_preset(name, "Descripción de mi estilo")
        .add_noise_gate(0.08, 0.12)
        .add_amplifier('ac_boost', gain=0.6, bass=0.5, mid=0.8, treble=0.7)
        .add_modulation('chorus_digital', {'rate': 0.4, 'depth': 0.3})
        .add_reverb(0.4, 0.5, mix=0.35))
```

### Validaciones Personalizadas

```python
# Extender validador
class MyValidator(SparkPresetValidator):
    def validate_custom_rule(self, preset_data):
        # Implementar validación personalizada
        pass
```

## 📖 Referencia Completa

Para información detallada sobre todos los efectos y amplificadores disponibles, consulta:

- **`spark-effects-amps-reference.md`** - Descripción completa de cada efecto y amplificador
- **`preset-format-specification.md`** - Especificación técnica del formato

## 🤝 Contribuir

1. Añadir nuevas plantillas en `preset_generator.py`
2. Mejorar validaciones en `preset_validator.py`
3. Extender funcionalidad CLI en `preset_manager.py`
4. Actualizar documentación de efectos/amplificadores

## 📝 Ejemplos de Uso

### Crear Preset Estilo "The Edge" (U2)
```python
edge_preset = (PresetGenerator()
    .new_preset("Where Streets", "Sonido estilo The Edge")
    .add_noise_gate(0.05, 0.18)
    .add_amplifier('ac_boost', gain=0.3, bass=0.4, mid=0.6, treble=0.8, master=0.7)
    .add_delay('digital', 0.375, 0.4, 0.5)  # Delay sincronizado
    .add_reverb(0.6, 0.7, mix=0.4)
    .save_preset("output/", "Rock"))
```

### Validar y Exportar Colección
```bash
# Validar toda la colección
python preset-manager.py validate my-presets/

# Exportar solo categorías específicas
python preset-manager.py export my-presets/ collection.zip --categories Rock Blues Metal
```

### Importar Presets de la Comunidad
```bash
# Importar presets descargados
python preset-manager.py import community-pack.zip my-library/ --overwrite
```

## ⚡ Características Destacadas

- ✅ **Validación Completa** - Verifica estructura, JSON, DSP IDs y parámetros
- 🎨 **Generación de Iconos** - Crea iconos automáticamente con estilos personalizables
- 📦 **Import/Export** - Paquetes ZIP compatibles con Spark
- 🎛️ **Plantillas Listas** - Estilos pre-configurados para empezar rápido
- 🖥️ **CLI Intuitivo** - Comandos simples para todas las operaciones
- 📚 **Documentación Completa** - Referencia de todos los efectos y amplificadores
- 🔧 **Extensible** - Fácil de extender con nuevas funcionalidades

---

**Compatibilidad:** Spark 40, Spark MINI, Spark GO  
**Versión del Formato:** 0.7  
**Efectos Soportados:** 43 efectos + 33 amplificadores