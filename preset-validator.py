#!/usr/bin/env python3
"""
Spark Preset Validator

Herramienta para validar presets de Spark según la especificación definida.
Valida estructura de archivos, JSON, DSP IDs, parámetros y más.
"""

import json
import os
import re
import uuid
from pathlib import Path
from typing import Dict, List, Tuple, Union, Optional
from PIL import Image
import jsonschema

# DSP IDs válidos por categoría
VALID_DSP_IDS = {
    # Noise Gate
    'bias.noisegate': {'category': 'gate', 'params': [0, 1, 2]},
    
    # Compresores
    'LA2AComp': {'category': 'comp', 'params': [0, 1, 2]},
    'RedComp': {'category': 'comp', 'params': [0, 1]},
    'BassComp': {'category': 'comp', 'params': [0, 1]},
    'BBEOpticalComp': {'category': 'comp', 'params': [0, 1, 2]},
    'SustainerComp': {'category': 'comp', 'params': [0, 1]},
    
    # Overdrives/Distorsión
    'DistortionTS9': {'category': 'drive', 'params': [0, 1, 2]},
    'Overdrive': {'category': 'drive', 'params': [0, 1, 2]},
    'SABdriver': {'category': 'drive', 'params': [0, 1, 2, 3]},
    'CloneDrive': {'category': 'drive', 'params': [0, 1, 2]},
    'GuitarMuff': {'category': 'drive', 'params': [0, 1, 2]},
    'BassMuff': {'category': 'drive', 'params': [0, 1, 2]},
    'FuzzFace': {'category': 'drive', 'params': [0, 1]},
    'BlackOp': {'category': 'drive', 'params': [0, 1, 2]},
    'Booster': {'category': 'drive', 'params': [0]},
    'Bassmaster': {'category': 'drive', 'params': [0, 1, 2]},
    
    # Amplificadores Clean
    'JC120': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Twin': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'ADClean': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'MatchDC30': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'ODS50': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores Glassy
    'AC30': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Checkmate': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'TwoRockSP50': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores Crunch
    'TweedBass': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'AmericanDeluxe': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Plexiglass': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores High Gain
    'AmericanHighGain': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'RB101': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'British30': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'SLO100': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'YJM100': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores Metal
    'Treadplate': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'EVH': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Insane6508': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'SwitchAxe': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'RockerV': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'BE101': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores Bass
    'RB800': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Sunny3000': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'W600': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Hammer500': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Amplificadores Acoustic
    'PureAcoustic': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Fishboy': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'Jumbo': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    'FlatAcoustic': {'category': 'amp', 'params': [0, 1, 2, 3, 4]},
    
    # Efectos de Modulación
    'Tremolo': {'category': 'mod', 'params': [0, 1]},
    'ChorusDigital': {'category': 'mod', 'params': [0, 1, 2, 3]},
    'ChorusAnalog': {'category': 'mod', 'params': [0, 1, 2, 3]},
    'Flanger': {'category': 'mod', 'params': [0, 1, 2]},
    'Phaser': {'category': 'mod', 'params': [0, 1]},
    'Vibrato': {'category': 'mod', 'params': [0, 1]},
    'UniVibe': {'category': 'mod', 'params': [0, 1, 2]},
    'ClassicVibe': {'category': 'mod', 'params': [0, 1, 2]},
    'Tremolator': {'category': 'mod', 'params': [0, 1]},
    'TremoloSquare': {'category': 'mod', 'params': [0, 1]},
    'GuitarEQ': {'category': 'mod', 'params': [0, 1, 2, 3, 4, 5]},
    'BassEQ': {'category': 'mod', 'params': [0, 1, 2, 3, 4, 5]},
    
    # Efectos de Delay
    'DelayMono': {'category': 'delay', 'params': [0, 1, 2, 3, 4]},
    'VintageDelay': {'category': 'delay', 'params': [0, 1, 2, 3]},
    'MultiHead': {'category': 'delay', 'params': [0, 1, 2, 3]},
    'EchoFilt': {'category': 'delay', 'params': [0, 1, 2, 3]},
    'EchoTape': {'category': 'delay', 'params': [0, 1, 2, 3]},
    'ReverseDelay': {'category': 'delay', 'params': [0, 1, 2]},
    
    # Reverb
    'bias.reverb': {'category': 'reverb', 'params': [0, 1, 2, 3, 4, 5, 6]},
}

# Esquemas JSON para validación
PRESET_SCHEMA = {
    "type": "object",
    "required": ["meta", "type", "bpm", "sigpath"],
    "properties": {
        "meta": {
            "type": "object",
            "required": ["id", "name", "version", "icon"],
            "properties": {
                "id": {"type": "string", "pattern": "^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$"},
                "name": {"type": "string", "minLength": 1},
                "description": {"type": "string"},
                "version": {"type": "string"},
                "icon": {"type": "string", "const": "icon.png"}
            }
        },
        "type": {"type": "string", "const": "jamup_speaker"},
        "bpm": {"type": "integer", "minimum": 60, "maximum": 200},
        "sigpath": {
            "type": "array",
            "minItems": 2,
            "items": {
                "type": "object",
                "required": ["type", "dspId", "active", "params"],
                "properties": {
                    "type": {"type": "string", "const": "speaker_fx"},
                    "dspId": {"type": "string"},
                    "active": {"type": "boolean"},
                    "params": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["index", "value"],
                            "properties": {
                                "index": {"type": "integer", "minimum": 0},
                                "value": {"type": ["number", "boolean", "integer"]}
                            }
                        }
                    }
                }
            }
        }
    }
}

CATEGORY_SCHEMA = {
    "type": "object",
    "required": ["meta", "presets"],
    "properties": {
        "meta": {
            "type": "object",
            "required": ["id", "name"],
            "properties": {
                "id": {"type": "string", "pattern": "^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$"},
                "name": {"type": "string", "minLength": 1},
                "description": {"type": "string"}
            }
        },
        "presets": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "version", "icon"],
                "properties": {
                    "id": {"type": "string", "pattern": "^[A-F0-9-]{36}$"},
                    "name": {"type": "string", "minLength": 1},
                    "description": {"type": "string"},
                    "version": {"type": "string"},
                    "icon": {"type": "string", "const": "icon.png"}
                }
            }
        }
    }
}

class ValidationError(Exception):
    """Error de validación personalizado"""
    pass

class SparkPresetValidator:
    """Validador principal para presets de Spark"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_directory_structure(self, root_path: Path) -> bool:
        """Valida la estructura de directorios"""
        if not root_path.exists():
            self.errors.append(f"Directorio raíz no existe: {root_path}")
            return False
        
        if not root_path.is_dir():
            self.errors.append(f"La ruta no es un directorio: {root_path}")
            return False
        
        # Buscar categorías
        categories = [d for d in root_path.iterdir() if d.is_dir()]
        if not categories:
            self.errors.append("No se encontraron categorías")
            return False
        
        for category_dir in categories:
            if not self._validate_category_structure(category_dir):
                return False
        
        return True
    
    def _validate_category_structure(self, category_path: Path) -> bool:
        """Valida la estructura de una categoría"""
        category_json = category_path / "category.json"
        
        if not category_json.exists():
            self.errors.append(f"Falta category.json en: {category_path}")
            return False
        
        # Validar presets en la categoría
        preset_dirs = [d for d in category_path.iterdir() 
                      if d.is_dir() and d.name != '__pycache__']
        
        for preset_dir in preset_dirs:
            if not self._validate_preset_structure(preset_dir):
                return False
        
        return True
    
    def _validate_preset_structure(self, preset_path: Path) -> bool:
        """Valida la estructura de un preset"""
        required_files = ["preset.json", "icon.png"]
        
        for file_name in required_files:
            file_path = preset_path / file_name
            if not file_path.exists():
                self.errors.append(f"Falta {file_name} en: {preset_path}")
                return False
        
        return True
    
    def validate_json_file(self, json_path: Path, schema: dict) -> bool:
        """Valida un archivo JSON contra un esquema"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            jsonschema.validate(data, schema)
            return True
            
        except json.JSONDecodeError as e:
            self.errors.append(f"JSON inválido en {json_path}: {e}")
            return False
        except jsonschema.ValidationError as e:
            self.errors.append(f"Esquema inválido en {json_path}: {e.message}")
            return False
        except Exception as e:
            self.errors.append(f"Error leyendo {json_path}: {e}")
            return False
    
    def validate_preset_json(self, preset_path: Path) -> bool:
        """Valida el JSON de un preset específico"""
        json_path = preset_path / "preset.json"
        
        if not self.validate_json_file(json_path, PRESET_SCHEMA):
            return False
        
        # Validaciones adicionales específicas de presets
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                preset_data = json.load(f)
            
            return self._validate_preset_sigpath(preset_data, preset_path)
            
        except Exception as e:
            self.errors.append(f"Error validando preset {preset_path}: {e}")
            return False
    
    def _validate_preset_sigpath(self, preset_data: dict, preset_path: Path) -> bool:
        """Valida la cadena de señal del preset"""
        sigpath = preset_data.get('sigpath', [])
        
        # Verificar que hay al menos noise gate y amplificador
        if len(sigpath) < 2:
            self.errors.append(f"Cadena de señal muy corta en {preset_path}")
            return False
        
        # Verificar primer elemento es noise gate
        if sigpath[0].get('dspId') != 'bias.noisegate':
            self.warnings.append(f"Primer efecto no es noise gate en {preset_path}")
        
        # Verificar último elemento es reverb (recomendado)
        if sigpath[-1].get('dspId') != 'bias.reverb':
            self.warnings.append(f"Último efecto no es reverb en {preset_path}")
        
        # Verificar que hay exactamente un amplificador
        amp_count = sum(1 for fx in sigpath 
                       if fx.get('dspId') in VALID_DSP_IDS and 
                       VALID_DSP_IDS[fx.get('dspId')]['category'] == 'amp')
        
        if amp_count != 1:
            self.errors.append(f"Debe haber exactamente un amplificador en {preset_path}, encontrados: {amp_count}")
            return False
        
        # Validar cada efecto
        for i, fx in enumerate(sigpath):
            if not self._validate_effect(fx, preset_path, i):
                return False
        
        return True
    
    def _validate_effect(self, effect: dict, preset_path: Path, index: int) -> bool:
        """Valida un efecto individual"""
        dsp_id = effect.get('dspId')
        
        if dsp_id not in VALID_DSP_IDS:
            self.errors.append(f"DSP ID inválido '{dsp_id}' en {preset_path} posición {index}")
            return False
        
        # Validar parámetros
        params = effect.get('params', [])
        valid_params = VALID_DSP_IDS[dsp_id]['params']
        
        for param in params:
            param_index = param.get('index')
            param_value = param.get('value')
            
            if param_index not in valid_params:
                self.warnings.append(f"Parámetro index {param_index} no documentado para {dsp_id} en {preset_path}")
            
            # Validar rango de valores para parámetros numéricos
            if isinstance(param_value, (int, float)) and not isinstance(param_value, bool):
                if not (0.0 <= param_value <= 1.0):
                    self.warnings.append(f"Valor {param_value} fuera de rango [0.0-1.0] para {dsp_id} en {preset_path}")
        
        return True
    
    def validate_icon(self, icon_path: Path) -> bool:
        """Valida el archivo de icono"""
        try:
            with Image.open(icon_path) as img:
                if img.format != 'PNG':
                    self.warnings.append(f"Icono no es PNG: {icon_path}")
                
                if img.size != (256, 256):
                    self.warnings.append(f"Icono no es 256x256: {icon_path} (actual: {img.size})")
            
            return True
            
        except Exception as e:
            self.errors.append(f"Error validando icono {icon_path}: {e}")
            return False
    
    def validate_uuid_uniqueness(self, root_path: Path) -> bool:
        """Valida que todos los UUIDs sean únicos"""
        uuids = set()
        
        for category_dir in root_path.iterdir():
            if not category_dir.is_dir():
                continue
            
            # UUID de categoría
            category_json = category_dir / "category.json"
            if category_json.exists():
                try:
                    with open(category_json, 'r', encoding='utf-8') as f:
                        category_data = json.load(f)
                    
                    category_id = category_data.get('meta', {}).get('id')
                    if category_id:
                        if category_id in uuids:
                            self.errors.append(f"UUID duplicado: {category_id}")
                            return False
                        uuids.add(category_id)
                    
                    # UUIDs de presets
                    for preset_info in category_data.get('presets', []):
                        preset_id = preset_info.get('id')
                        if preset_id:
                            if preset_id in uuids:
                                self.errors.append(f"UUID duplicado: {preset_id}")
                                return False
                            uuids.add(preset_id)
                
                except Exception as e:
                    self.errors.append(f"Error leyendo {category_json}: {e}")
                    return False
        
        return True
    
    def validate_all(self, root_path: Path) -> bool:
        """Ejecuta todas las validaciones"""
        self.errors.clear()
        self.warnings.clear()
        
        root_path = Path(root_path)
        
        print(f"Validando presets en: {root_path}")
        
        # Validaciones principales
        validations = [
            ("Estructura de directorios", lambda: self.validate_directory_structure(root_path)),
            ("Unicidad de UUIDs", lambda: self.validate_uuid_uniqueness(root_path)),
        ]
        
        for name, validation in validations:
            print(f"  • {name}...", end=' ')
            if validation():
                print("✓")
            else:
                print("✗")
                return False
        
        # Validar cada archivo individualmente
        for category_dir in root_path.iterdir():
            if not category_dir.is_dir():
                continue
            
            print(f"  • Validando categoría {category_dir.name}...")
            
            # Validar category.json
            category_json = category_dir / "category.json"
            if not self.validate_json_file(category_json, CATEGORY_SCHEMA):
                return False
            
            # Validar cada preset
            for preset_dir in category_dir.iterdir():
                if not preset_dir.is_dir():
                    continue
                
                print(f"    - Preset {preset_dir.name}...", end=' ')
                
                if (self.validate_preset_json(preset_dir) and 
                    self.validate_icon(preset_dir / "icon.png")):
                    print("✓")
                else:
                    print("✗")
                    return False
        
        return True
    
    def print_results(self):
        """Imprime los resultados de la validación"""
        if self.errors:
            print("\n❌ ERRORES:")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print("\n⚠️  ADVERTENCIAS:")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        if not self.errors and not self.warnings:
            print("\n✅ Validación completada sin errores ni advertencias")
        elif not self.errors:
            print(f"\n✅ Validación completada con {len(self.warnings)} advertencias")
        else:
            print(f"\n❌ Validación falló con {len(self.errors)} errores y {len(self.warnings)} advertencias")

def main():
    """Función principal para ejecutar desde línea de comandos"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validador de presets Spark")
    parser.add_argument("path", help="Ruta al directorio de presets")
    parser.add_argument("--verbose", "-v", action="store_true", help="Salida detallada")
    
    args = parser.parse_args()
    
    validator = SparkPresetValidator()
    success = validator.validate_all(args.path)
    validator.print_results()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())