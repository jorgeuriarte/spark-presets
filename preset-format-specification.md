# Especificación del Formato de Presets Spark

## Estructura General

Los presets de Spark se organizan en una estructura de directorios específica que debe seguirse estrictamente para que sean importables.

### Estructura de Archivos

```
PresetExamples/
├── CategoryName/
│   ├── category.json
│   ├── PresetUUID1/
│   │   ├── preset.json
│   │   └── icon.png
│   ├── PresetUUID2/
│   │   ├── preset.json
│   │   └── icon.png
│   └── ...
```

## Archivo category.json

Define la información de la categoría y lista todos los presets que contiene.

```json
{
    "meta": {
        "id": "UUID-de-categoria",
        "description": "Descripción opcional",
        "name": "Nombre de la Categoría"
    },
    "presets": [
        {
            "id": "UUID-del-preset",
            "description": "Descripción del preset",
            "name": "Nombre del Preset",
            "version": "0.7",
            "icon": "icon.png"
        }
    ]
}
```

## Archivo preset.json

Contiene la configuración completa del preset, incluyendo la cadena de señal y metadatos.

### Estructura Principal

```json
{
    "meta": {
        "id": "UUID-único",
        "name": "Nombre del Preset",
        "description": "Descripción del preset",
        "version": "0.7",
        "icon": "icon.png"
    },
    "type": "jamup_speaker",
    "bpm": 120,
    "sigpath": [
        // Array de efectos y amplificador
    ]
}
```

### Cadena de Señal (sigpath)

La cadena de señal es un array de objetos que representan cada efecto y el amplificador en orden secuencial. Cada elemento tiene la siguiente estructura:

```json
{
    "type": "speaker_fx",
    "dspId": "ID-del-efecto",
    "active": true/false,
    "params": [
        {
            "index": 0,
            "value": 0.5
        }
    ]
}
```

## DSP IDs de Efectos y Amplificadores

### Noise Gate
- **dspId**: `bias.noisegate`
- **Parámetros**:
  - index 0: Threshold (0.0-1.0)
  - index 1: Decay (0.0-1.0)
  - index 2: (opcional, valor 0)

### Compresores
- **LA Comp**: `LA2AComp`
  - index 0: boolean (Limit/Compress)
  - index 1: Peak-Reduction (0.0-1.0)
  - index 2: Gain (0.0-1.0)

- **Red Comp**: `RedComp`
- **Bass Comp**: `BassComp`
- **BBE Optical**: `BBEOpticalComp`
- **Sustainer Comp**: `SustainerComp`

### Overdrives/Distorsión
- **Tube Drive**: `DistortionTS9`
- **Over Drive**: `Overdrive`
- **SAB Driver**: `SABdriver`
- **Clone Drive**: `CloneDrive`
- **Guitar Muff**: `GuitarMuff`
- **Bass Muff**: `BassMuff`
- **Fuzz Face**: `FuzzFace`
- **Black Op**: `BlackOp`
- **Booster**: `Booster`
- **Bassmaster**: `Bassmaster`

### Amplificadores

#### Clean
- **Silver 120**: `JC120`
- **Black DUO**: `Twin`
- **AD Clean**: `ADClean`
- **MATCH DC**: `MatchDC30`
- **ODS 50**: `ODS50`

#### Glassy
- **AC Boost**: `AC30`
- **Checkmate**: `Checkmate`
- **Two Stone SP50**: `TwoRockSP50`

#### Crunch
- **Tweed Bass**: `TweedBass`
- **American Deluxe**: `AmericanDeluxe`
- **Plexiglass**: `Plexiglass`

#### High Gain
- **American High Gain**: `AmericanHighGain`
- **RB 101**: `RB101`
- **British 30**: `British30`
- **SLO 100**: `SLO100`
- **YJM100**: `YJM100`

#### Metal
- **Treadplate**: `Treadplate`
- **Insane**: `EVH` (anteriormente `5153`)
- **Insane 6508**: `Insane6508`
- **SwitchAxe**: `SwitchAxe`
- **Rocker V**: `RockerV`
- **BE 101**: `BE101`

#### Bass
- **RB-800**: `RB800`
- **Sunny 3000**: `Sunny3000`
- **W600**: `W600`
- **Hammer 500**: `Hammer500`

#### Acoustic
- **Pure Acoustic**: `PureAcoustic`
- **Fishboy**: `Fishboy`
- **Jumbo**: `Jumbo`
- **Flat Acoustic**: `FlatAcoustic`

### Efectos de Modulación
- **Tremolo**: `Tremolo`
- **Digital Chorus**: `ChorusDigital`
- **Cloner Chorus**: `ChorusAnalog`
- **Flanger**: `Flanger`
- **Phaser**: `Phaser`
- **Vibrato**: `Vibrato`
- **UniVibe**: `UniVibe`
- **Classic Vibe**: `ClassicVibe`
- **Tremolator**: `Tremolator`
- **Tremolo Square**: `TremoloSquare`
- **Guitar EQ**: `GuitarEQ`
- **Bass EQ**: `BassEQ`

### Efectos de Delay
- **Digital Delay**: `DelayMono`
- **Vintage Delay**: `VintageDelay`
- **Multi Head**: `MultiHead`
- **Echo Filt**: `EchoFilt`
- **Echo Tape**: `EchoTape`
- **Reverse Delay**: `ReverseDelay`

### Reverb
- **dspId**: `bias.reverb`
- **Parámetros** (7 parámetros típicamente):
  - index 0: Room Size
  - index 1: Decay
  - index 2: Pre-delay
  - index 3: Low Cut
  - index 4: High Cut
  - index 5: Mix
  - index 6: Gate

## Generación de UUIDs

Cada preset y categoría debe tener un UUID único. Formato estándar:
- Mayúsculas
- Formato: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

## Rangos de Valores

- Todos los parámetros numéricos están en el rango 0.0 - 1.0
- Los parámetros booleanos usan `true`/`false`
- Algunos efectos tienen parámetros enteros (como index 2 en noise gate = 0)

## Orden de la Cadena de Señal

El orden típico recomendado en la cadena de señal:

1. **Noise Gate** (bias.noisegate) - Siempre primero
2. **Compresor** - Segundo si se usa
3. **Overdrive/Distorsión** - Antes del amplificador
4. **Amplificador** - Elemento central (requerido)
5. **Modulación** - Después del amplificador
6. **Delay** - Antes del reverb
7. **Reverb** (bias.reverb) - Siempre último

## Archivo icon.png

- Imagen PNG de 256x256 píxeles recomendado
- Representa visualmente el preset
- Debe estar presente en cada directorio de preset

## Validaciones Requeridas

1. **UUID Único**: Cada preset debe tener un UUID único
2. **Estructura de Archivos**: Seguir la estructura exacta de directorios
3. **JSON Válido**: Todos los archivos JSON deben ser válidos
4. **DSP IDs Válidos**: Solo usar DSP IDs documentados
5. **Rangos de Parámetros**: Valores entre 0.0-1.0
6. **Amplificador Requerido**: Cada preset debe tener exactamente un amplificador
7. **Orden de Efectos**: Noise gate primero, reverb último
8. **Iconos**: Archivo icon.png presente y válido

## Herramientas de Validación Propuestas

1. **Validador de Estructura**: Verificar estructura de directorios
2. **Validador de JSON**: Verificar sintaxis JSON
3. **Validador de DSP**: Verificar IDs y parámetros válidos
4. **Generador de UUID**: Crear UUIDs únicos automáticamente
5. **Validador de Iconos**: Verificar formato y tamaño de imágenes
6. **Exportador de Paquetes**: Crear archivos importables por Spark

Esta especificación permite crear presets compatibles con el ecosistema Spark y facilita el desarrollo de herramientas de generación y validación automática.