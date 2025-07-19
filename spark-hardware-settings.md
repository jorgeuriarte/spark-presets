# Settings de Hardware del Amplificador Spark

## 🎛️ Configuraciones Físicas del Hardware

### Panel Superior - Controles Principales

#### Selector de Tipo de Amplificador
- **Ubicación**: Perilla principal izquierda
- **Función**: Selecciona entre 7 presets de fábrica predefinidos
- **Configuraciones**:
  1. **Acoustic** - Guitarra acústica
  2. **Clean** - Sonido limpio eléctrico
  3. **Blues** - Crunch suave
  4. **Rock** - Distorsión media
  5. **Punk** - Distorsión alta
  6. **Metal** - Máxima distorsión
  7. **Bass** - Configuración para bajo

#### Controles de Tono del Amplificador
- **Gain**: Cantidad de saturación/distorsión
- **Bass**: Frecuencias graves (80Hz-250Hz)
- **Mid**: Frecuencias medias (250Hz-4kHz) 
- **Treble**: Frecuencias agudas (4kHz-20kHz)
- **Master**: Volumen general del amplificador

#### Controles de Efectos
- **Mod**: Intensidad de efectos de modulación (chorus, flanger, phaser, tremolo)
- **Delay**: Intensidad del efecto de delay/echo
- **Reverb**: Intensidad del efecto de reverberación

#### Controles de Volumen
- **Output**: Volumen de salida del amplificador
- **Music**: Volumen de la entrada auxiliar (Bluetooth/cable)

### Botones Programables

#### 4 Botones de Presets de Usuario
- **Función Principal**: Activar presets guardados
  - **Presión corta**: Cargar preset
  - **Mantener presionado**: Guardar preset actual
- **LED indicador**: Muestra qué preset está activo
- **Sincronización**: Se sincronizan con la app automáticamente

#### Botón Tap/Tuner
- **Función Dual**:
  - **Tap Tempo**: Establecer tempo para delays sincronizados
  - **Afinador**: Mantener presionado para activar afinador integrado
- **LED**: Indica tempo actual o estado del afinador

## 🔌 Conexiones y Puertos

### Panel Frontal
- **Entrada Guitarra**: Jack 1/4" mono (TS)
  - Impedancia: 1MΩ
  - Nivel: Instrumento
  - Compatible con pastillas activas y pasivas

### Panel Lateral
- **Entrada Auxiliar**: Jack 1/8" estéreo
  - Para dispositivos móviles, reproductores MP3
  - Mezcla con señal de guitarra
- **Salida Auriculares**: Jack 1/8" estéreo
  - Corta automáticamente los altavoces
  - Salida estéreo completa

### Panel Trasero
- **Puerto USB**: USB-B
  - Solo para datos/control (no audio analógico)
  - Comunicación con app y DAW
  - Actualizaciones de firmware
- **Entrada AUX**: RCA estéreo
  - Entrada de línea para fuentes externas
  - Nivel de línea estándar
- **Puerto DC**: Alimentación 19V

## ⚙️ Settings Internos del Sistema

### Configuraciones de Conectividad

#### Bluetooth Dual
```
1. "Spark 40 Audio" - Streaming de audio
   - Protocolo: A2DP
   - Codec: SBC/AAC
   - Latencia: ~150-300ms
   - Uso: Música de fondo, backing tracks

2. "Spark 40 BLE" - Control de app  
   - Protocolo: Bluetooth Low Energy
   - Latencia: <50ms
   - Uso: Control de presets, parámetros
   - Requisito: Servicios de ubicación habilitados
```

#### Configuración como Interfaz de Audio
```
Windows:
- Driver: ASIO específico de Positive Grid
- Latencia: 5-15ms (con ASIO)
- Configuración: Control Panel → Sound

Mac:
- Driver: Core Audio (clase estándar)
- Latencia: 3-10ms
- Configuración: System Preferences → Sound
```

### Settings de Performance

#### Especificaciones de Audio
- **Clase de Amplificador**: Clase D (eficiente, bajo calor)
- **Potencia**: 40W RMS
- **Altavoces**: 2x 4" custom design
- **Respuesta de Frecuencia**: 20Hz - 20kHz
- **Tasa de Muestreo**: 48kHz/24-bit
- **Procesamiento**: DSP dedicado en tiempo real

#### Configuraciones de Latencia
```json
{
  "bluetooth_audio": "150-300ms (alta latencia)",
  "usb_asio": "5-15ms (Windows con driver)",
  "usb_core_audio": "3-10ms (Mac nativo)", 
  "spark_link": "<3ms (con pedal inalámbrico)",
  "direct_input": "<1ms (entrada directa)"
}
```

## 🔧 Configuraciones Avanzadas

### Comportamiento de Controles Físicos

#### Perillas Digitales
```python
# Comportamiento de las perillas físicas
class DigitalKnob:
    def __init__(self):
        self.physical_position = 0.5    # Posición física
        self.virtual_value = 0.3        # Valor del preset
        self.takeover_mode = "pickup"   # Modo de control
    
    def on_turn(self, new_position):
        if abs(new_position - self.virtual_value) < 0.05:
            # "Pickup" - toma control cuando posiciones coinciden
            self.virtual_value = new_position
            self.sync_to_app()
```

#### Modos de Takeover
1. **Pickup Mode** (por defecto): El control toma efecto cuando la posición física coincide con el valor virtual
2. **Jump Mode**: El valor salta inmediatamente a la posición física
3. **Relative Mode**: Cambios relativos desde la posición actual

### Configuración de Routing de Audio

#### Matriz de Señal Interna
```
INPUT SOURCES:
├── Guitar Input (1/4")
├── Aux Input (1/8")  
├── Aux Input (RCA)
├── Bluetooth Audio
└── USB Audio (DAW)

PROCESSING CHAIN:
Guitar → Noise Gate → Effects → Amp Model → EQ → Mix

OUTPUT DESTINATIONS:
├── Main Speakers (40W)
├── Headphone Out (1/8")
├── USB Audio (to DAW)
└── Bluetooth Audio (monitoring)
```

#### Configuraciones de Mezcla
```json
{
  "guitar_level": "0.0 - 1.0",
  "music_level": "0.0 - 1.0", 
  "master_level": "0.0 - 1.0",
  "headphone_mix": "guitar + music",
  "usb_send": "guitar_processed + music_raw",
  "speaker_cut": "auto_on_headphone_insert"
}
```

## 📱 Integración con App

### Settings Sincronizados
```json
{
  "preset_slots": {
    "hardware_buttons": [1, 2, 3, 4],
    "app_library": "unlimited",
    "sync_mode": "bidirectional"
  },
  "knob_positions": {
    "update_frequency": "real_time",
    "direction": "hardware_to_app",
    "precision": "7-bit (128 steps)"
  },
  "effect_parameters": {
    "access": "app_only",
    "realtime_control": true,
    "automation": "supported"
  }
}
```

### Configuraciones de Sistema en App

#### Audio Settings
- **Input Gain**: Ajuste de sensibilidad de entrada
- **Noise Gate Threshold**: Umbral global de ruido
- **Output Limiting**: Protección contra clipping
- **EQ Global**: EQ maestro post-procesamiento

#### Connectivity Settings  
- **Bluetooth Pairing**: Gestión de dispositivos emparejados
- **WiFi Setup**: Para modelos con conectividad WiFi
- **USB Audio Mode**: Configuración para DAW
- **MIDI Settings**: Para controladores externos

#### Performance Settings
- **Buffer Size**: Tamaño de buffer de audio (latencia vs. estabilidad)
- **Sample Rate**: 44.1kHz/48kHz seleccionable
- **DSP Load**: Monitor de carga del procesador
- **Memory Usage**: Uso de memoria de presets

## 🔄 Actualizaciones y Mantenimiento

### Firmware Updates
```bash
# Proceso de actualización
1. Connect USB cable (not battery powered)
2. Open Spark app
3. Settings → Firmware Update
4. Download and install (auto-restart)
5. Verify version in About section
```

#### Changelog Típico
- **DSP Optimizations**: Mejoras en algoritmos de efectos
- **New Effects**: Adición de nuevos modelos
- **Bug Fixes**: Corrección de problemas de conectividad
- **Performance**: Reducción de latencia, estabilidad

### Calibración y Reset

#### Factory Reset
```
Method 1 (Hardware):
1. Hold Preset Button 1 + 4 while powering on
2. Release when all LEDs flash
3. Wait for reboot

Method 2 (App):
Settings → Advanced → Factory Reset
```

#### Calibración de Controles
```json
{
  "knob_calibration": {
    "auto_calibration": "on_first_boot",
    "manual_calibration": "settings_menu",
    "tolerance": "±2% full_scale"
  },
  "button_response": {
    "debounce_time": "50ms",
    "long_press_threshold": "1.5s",
    "double_tap_window": "300ms"
  }
}
```

## 🎯 Configuraciones Específicas por Uso

### Para Grabación en DAW
```json
{
  "usb_mode": "interface",
  "monitoring": "direct_hardware",
  "latency_mode": "ultra_low",
  "effects_send": "pre_amp_only",
  "dry_wet_mix": "configurable"
}
```

### Para Práctica Silenciosa
```json
{
  "headphone_mode": "full_stereo",
  "speaker_auto_mute": true,
  "music_mix": "bluetooth_priority",
  "effects_processing": "full_chain"
}
```

### Para Presentación en Vivo
```json
{
  "preset_switching": "instant_no_gaps",
  "master_volume_limit": "safety_enabled",
  "bluetooth_audio": "disabled_low_latency",
  "backup_presets": "local_storage_priority"
}
```

## 🔍 Diagnósticos y Troubleshooting

### Información del Sistema
```
Access via App → Settings → About:
- Firmware Version
- Hardware Revision  
- Serial Number
- Bluetooth MAC Address
- Total Operating Hours
- DSP Load Average
- Memory Usage Stats
```

### Logs y Debugging
```json
{
  "connection_log": "bluetooth_stability_tracking",
  "audio_dropouts": "buffer_underrun_counting", 
  "preset_load_time": "performance_monitoring",
  "app_crash_reports": "automatic_upload_optional"
}
```

Esta configuración híbrida hardware/software del Spark permite un balance entre **simplicidad de uso físico** y **flexibilidad digital avanzada**, manteniendo la mayoría de configuraciones complejas en la app mientras proporciona controles esenciales accesibles directamente en el hardware.