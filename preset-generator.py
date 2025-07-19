#!/usr/bin/env python3
"""
Spark Preset Generator

Herramienta para generar presets de Spark programáticamente.
Permite crear presets válidos con configuraciones específicas.
"""

import json
import uuid
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Union
from PIL import Image, ImageDraw, ImageFont
import random

# Importar configuraciones del validador
from preset_validator import VALID_DSP_IDS

class PresetGenerator:
    """Generador de presets Spark"""
    
    def __init__(self):
        self.preset_data = {
            "meta": {
                "id": "",
                "name": "",
                "description": "",
                "version": "0.7",
                "icon": "icon.png"
            },
            "type": "jamup_speaker",
            "bpm": 120,
            "sigpath": []
        }
    
    def new_preset(self, name: str, description: str = "") -> 'PresetGenerator':
        """Crea un nuevo preset"""
        self.preset_data = {
            "meta": {
                "id": str(uuid.uuid4()).upper(),
                "name": name,
                "description": description,
                "version": "0.7",
                "icon": "icon.png"
            },
            "type": "jamup_speaker",
            "bpm": 120,
            "sigpath": []
        }
        return self
    
    def set_bpm(self, bpm: int) -> 'PresetGenerator':
        """Establece el BPM del preset"""
        if 60 <= bpm <= 200:
            self.preset_data["bpm"] = bpm
        else:
            raise ValueError("BPM debe estar entre 60 y 200")
        return self
    
    def add_noise_gate(self, threshold: float = 0.1, decay: float = 0.1, active: bool = True) -> 'PresetGenerator':
        """Añade noise gate (siempre debe ser el primero)"""
        if not (0.0 <= threshold <= 1.0) or not (0.0 <= decay <= 1.0):
            raise ValueError("Threshold y decay deben estar entre 0.0 y 1.0")
        
        effect = {
            "type": "speaker_fx",
            "dspId": "bias.noisegate",
            "active": active,
            "params": [
                {"index": 0, "value": threshold},
                {"index": 1, "value": decay},
                {"index": 2, "value": 0}
            ]
        }
        
        # Insertar al principio si no hay efectos, o antes del primer efecto no-gate
        if not self.preset_data["sigpath"] or self.preset_data["sigpath"][0]["dspId"] != "bias.noisegate":
            self.preset_data["sigpath"].insert(0, effect)
        else:
            # Reemplazar noise gate existente
            self.preset_data["sigpath"][0] = effect
        
        return self
    
    def add_compressor(self, comp_type: str, params: Dict[str, float], active: bool = True) -> 'PresetGenerator':
        """Añade un compresor"""
        comp_map = {
            'la2a': 'LA2AComp',
            'red': 'RedComp',
            'bass': 'BassComp',
            'optical': 'BBEOpticalComp',
            'sustainer': 'SustainerComp'
        }
        
        if comp_type not in comp_map:
            raise ValueError(f"Tipo de compresor inválido: {comp_type}")
        
        dsp_id = comp_map[comp_type]
        return self._add_effect(dsp_id, params, active)
    
    def add_overdrive(self, drive_type: str, params: Dict[str, float], active: bool = True) -> 'PresetGenerator':
        """Añade un overdrive/distorsión"""
        drive_map = {
            'tube': 'DistortionTS9',
            'overdrive': 'Overdrive',
            'sab': 'SABdriver',
            'clone': 'CloneDrive',
            'guitar_muff': 'GuitarMuff',
            'bass_muff': 'BassMuff',
            'fuzz_face': 'FuzzFace',
            'black_op': 'BlackOp',
            'booster': 'Booster',
            'bassmaster': 'Bassmaster'
        }
        
        if drive_type not in drive_map:
            raise ValueError(f"Tipo de overdrive inválido: {drive_type}")
        
        dsp_id = drive_map[drive_type]
        return self._add_effect(dsp_id, params, active)
    
    def add_amplifier(self, amp_type: str, gain: float = 0.5, bass: float = 0.5, 
                     mid: float = 0.5, treble: float = 0.5, master: float = 0.5, 
                     active: bool = True) -> 'PresetGenerator':
        """Añade un amplificador"""
        
        # Mapeo de tipos de amplificador a DSP IDs
        amp_map = {
            # Clean
            'silver_120': 'JC120',
            'black_duo': 'Twin',
            'ad_clean': 'ADClean',
            'match_dc': 'MatchDC30',
            'ods_50': 'ODS50',
            
            # Glassy
            'ac_boost': 'AC30',
            'checkmate': 'Checkmate',
            'two_stone': 'TwoRockSP50',
            
            # Crunch
            'tweed_bass': 'TweedBass',
            'american_deluxe': 'AmericanDeluxe',
            'plexiglass': 'Plexiglass',
            
            # High Gain
            'american_high_gain': 'AmericanHighGain',
            'rb_101': 'RB101',
            'british_30': 'British30',
            'slo_100': 'SLO100',
            'yjm100': 'YJM100',
            
            # Metal
            'treadplate': 'Treadplate',
            'insane': 'EVH',
            'insane_6508': 'Insane6508',
            'switch_axe': 'SwitchAxe',
            'rocker_v': 'RockerV',
            'be_101': 'BE101',
            
            # Bass
            'rb_800': 'RB800',
            'sunny_3000': 'Sunny3000',
            'w600': 'W600',
            'hammer_500': 'Hammer500',
            
            # Acoustic
            'pure_acoustic': 'PureAcoustic',
            'fishboy': 'Fishboy',
            'jumbo': 'Jumbo',
            'flat_acoustic': 'FlatAcoustic'
        }
        
        if amp_type not in amp_map:
            raise ValueError(f"Tipo de amplificador inválido: {amp_type}")
        
        # Verificar que no hay ya un amplificador
        for effect in self.preset_data["sigpath"]:
            if (effect["dspId"] in VALID_DSP_IDS and 
                VALID_DSP_IDS[effect["dspId"]]["category"] == "amp"):
                raise ValueError("Ya hay un amplificador en la cadena de señal")
        
        dsp_id = amp_map[amp_type]
        params = {
            'gain': gain,
            'bass': bass,
            'mid': mid,
            'treble': treble,
            'master': master
        }
        
        return self._add_effect(dsp_id, params, active)
    
    def add_modulation(self, mod_type: str, params: Dict[str, float], active: bool = True) -> 'PresetGenerator':
        """Añade un efecto de modulación"""
        mod_map = {
            'tremolo': 'Tremolo',
            'chorus_digital': 'ChorusDigital',
            'chorus_analog': 'ChorusAnalog',
            'flanger': 'Flanger',
            'phaser': 'Phaser',
            'vibrato': 'Vibrato',
            'univibe': 'UniVibe',
            'classic_vibe': 'ClassicVibe',
            'tremolator': 'Tremolator',
            'tremolo_square': 'TremoloSquare',
            'guitar_eq': 'GuitarEQ',
            'bass_eq': 'BassEQ'
        }
        
        if mod_type not in mod_map:
            raise ValueError(f"Tipo de modulación inválido: {mod_type}")
        
        dsp_id = mod_map[mod_type]
        return self._add_effect(dsp_id, params, active)
    
    def add_delay(self, delay_type: str, time: float = 0.3, feedback: float = 0.3, 
                  mix: float = 0.3, active: bool = True) -> 'PresetGenerator':
        """Añade un efecto de delay"""
        delay_map = {
            'digital': 'DelayMono',
            'vintage': 'VintageDelay',
            'multi_head': 'MultiHead',
            'echo_filt': 'EchoFilt',
            'echo_tape': 'EchoTape',
            'reverse': 'ReverseDelay'
        }
        
        if delay_type not in delay_map:
            raise ValueError(f"Tipo de delay inválido: {delay_type}")
        
        dsp_id = delay_map[delay_type]
        params = {'time': time, 'feedback': feedback, 'mix': mix}
        
        if delay_type == 'digital':
            params['high_cut'] = 0.6  # Parámetro adicional para delay digital
            params['tap_tempo'] = True
        
        return self._add_effect(dsp_id, params, active)
    
    def add_reverb(self, room_size: float = 0.3, decay: float = 0.4, predelay: float = 0.3,
                   low_cut: float = 0.1, high_cut: float = 0.5, mix: float = 0.5, 
                   gate: float = 0.2, active: bool = True) -> 'PresetGenerator':
        """Añade reverb (siempre debe ser el último)"""
        params = {
            'room_size': room_size,
            'decay': decay,
            'predelay': predelay,
            'low_cut': low_cut,
            'high_cut': high_cut,
            'mix': mix,
            'gate': gate
        }
        
        effect = {
            "type": "speaker_fx",
            "dspId": "bias.reverb",
            "active": active,
            "params": [
                {"index": 0, "value": room_size},
                {"index": 1, "value": decay},
                {"index": 2, "value": predelay},
                {"index": 3, "value": low_cut},
                {"index": 4, "value": high_cut},
                {"index": 5, "value": mix},
                {"index": 6, "value": gate}
            ]
        }
        
        # Remover reverb existente si lo hay
        self.preset_data["sigpath"] = [fx for fx in self.preset_data["sigpath"] 
                                      if fx["dspId"] != "bias.reverb"]
        
        # Añadir al final
        self.preset_data["sigpath"].append(effect)
        return self
    
    def _add_effect(self, dsp_id: str, params: Dict[str, float], active: bool) -> 'PresetGenerator':
        """Método auxiliar para añadir efectos"""
        if dsp_id not in VALID_DSP_IDS:
            raise ValueError(f"DSP ID inválido: {dsp_id}")
        
        # Convertir parámetros nombrados a índices
        param_list = []
        for i, (key, value) in enumerate(params.items()):
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                if not (0.0 <= value <= 1.0):
                    raise ValueError(f"Parámetro {key} debe estar entre 0.0 y 1.0")
            param_list.append({"index": i, "value": value})
        
        effect = {
            "type": "speaker_fx",
            "dspId": dsp_id,
            "active": active,
            "params": param_list
        }
        
        # Insertar en posición apropiada
        insert_pos = len(self.preset_data["sigpath"])
        
        # Si hay reverb, insertar antes del reverb
        for i, fx in enumerate(self.preset_data["sigpath"]):
            if fx["dspId"] == "bias.reverb":
                insert_pos = i
                break
        
        self.preset_data["sigpath"].insert(insert_pos, effect)
        return self
    
    def generate_icon(self, output_path: Path, color: str = "blue", style: str = "modern") -> 'PresetGenerator':
        """Genera un icono para el preset"""
        # Crear imagen 256x256
        img = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Colores disponibles
        colors = {
            'blue': '#4A90E2',
            'red': '#E24A4A',
            'green': '#4AE24A',
            'purple': '#A24AE2',
            'orange': '#E2A24A',
            'teal': '#4AE2A2',
            'pink': '#E24AA2',
            'yellow': '#E2E24A'
        }
        
        main_color = colors.get(color, colors['blue'])
        
        if style == "modern":
            # Círculo con gradiente
            draw.ellipse([32, 32, 224, 224], fill=main_color)
            draw.ellipse([48, 48, 208, 208], outline="white", width=4)
            
            # Texto del preset (primeras letras del nombre)
            name = self.preset_data["meta"]["name"]
            initials = ''.join([word[0] for word in name.split()[:2]]).upper()
            
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 64)
            except:
                font = ImageFont.load_default()
            
            bbox = draw.textbbox((0, 0), initials, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (256 - text_width) // 2
            y = (256 - text_height) // 2
            
            draw.text((x, y), initials, fill="white", font=font)
        
        elif style == "vintage":
            # Estilo vintage con esquinas redondeadas
            draw.rounded_rectangle([16, 16, 240, 240], radius=20, fill=main_color)
            draw.rounded_rectangle([24, 24, 232, 232], radius=16, outline="white", width=3)
            
            # Agregar elementos de amplificador vintage
            # Perillas
            for i, (x, y) in enumerate([(80, 80), (176, 80), (80, 176), (176, 176)]):
                draw.ellipse([x-16, y-16, x+16, y+16], fill="white", outline=main_color, width=2)
                draw.ellipse([x-8, y-8, x+8, y+8], fill=main_color)
        
        img.save(output_path, 'PNG')
        return self
    
    def save_preset(self, output_dir: Path, category_name: str = "Custom") -> Path:
        """Guarda el preset en el directorio especificado"""
        output_dir = Path(output_dir)
        
        # Crear estructura de directorios
        category_dir = output_dir / category_name
        preset_id = self.preset_data["meta"]["id"]
        preset_dir = category_dir / preset_id
        
        preset_dir.mkdir(parents=True, exist_ok=True)
        
        # Guardar preset.json
        preset_path = preset_dir / "preset.json"
        with open(preset_path, 'w', encoding='utf-8') as f:
            json.dump(self.preset_data, f, indent=2, ensure_ascii=False)
        
        # Generar icono si no existe
        icon_path = preset_dir / "icon.png"
        if not icon_path.exists():
            self.generate_icon(icon_path)
        
        # Actualizar o crear category.json
        self._update_category_json(category_dir, category_name)
        
        return preset_dir
    
    def _update_category_json(self, category_dir: Path, category_name: str):
        """Actualiza el archivo category.json"""
        category_json = category_dir / "category.json"
        
        if category_json.exists():
            with open(category_json, 'r', encoding='utf-8') as f:
                category_data = json.load(f)
        else:
            category_data = {
                "meta": {
                    "id": str(uuid.uuid4()).upper(),
                    "name": category_name,
                    "description": ""
                },
                "presets": []
            }
        
        # Añadir preset si no existe
        preset_meta = self.preset_data["meta"]
        existing_ids = [p["id"] for p in category_data["presets"]]
        
        if preset_meta["id"] not in existing_ids:
            category_data["presets"].append({
                "id": preset_meta["id"],
                "name": preset_meta["name"],
                "description": preset_meta["description"],
                "version": preset_meta["version"],
                "icon": preset_meta["icon"]
            })
        
        with open(category_json, 'w', encoding='utf-8') as f:
            json.dump(category_data, f, indent=2, ensure_ascii=False)

class PresetTemplates:
    """Plantillas predefinidas para tipos comunes de presets"""
    
    @staticmethod
    def clean_jazz(name: str = "Clean Jazz") -> PresetGenerator:
        """Preset para jazz limpio"""
        return (PresetGenerator()
                .new_preset(name, "Tono limpio para jazz con compresor suave")
                .add_noise_gate(0.08, 0.15)
                .add_compressor('la2a', {'limit_compress': False, 'peak_reduction': 0.3, 'gain': 0.4})
                .add_amplifier('silver_120', gain=0.2, bass=0.6, mid=0.5, treble=0.7, master=0.6)
                .add_reverb(0.4, 0.5, 0.2, 0.1, 0.4, 0.3, 0.1))
    
    @staticmethod
    def blues_overdrive(name: str = "Blues Drive") -> PresetGenerator:
        """Preset para blues con overdrive"""
        return (PresetGenerator()
                .new_preset(name, "Overdrive clásico para blues")
                .add_noise_gate(0.12, 0.18)
                .add_overdrive('tube', {'drive': 0.6, 'tone': 0.7, 'level': 0.8})
                .add_amplifier('black_duo', gain=0.5, bass=0.6, mid=0.7, treble=0.6, master=0.7)
                .add_delay('vintage', 0.35, 0.25, 0.2)
                .add_reverb(0.3, 0.4, 0.3, 0.15, 0.5, 0.4, 0.2))
    
    @staticmethod
    def metal_high_gain(name: str = "Metal Crunch") -> PresetGenerator:
        """Preset para metal con high gain"""
        return (PresetGenerator()
                .new_preset(name, "Distorsión pesada para metal")
                .add_noise_gate(0.15, 0.1)
                .add_overdrive('tube', {'drive': 0.3, 'tone': 0.8, 'level': 0.9})
                .add_amplifier('insane', gain=0.8, bass=0.4, mid=0.6, treble=0.8, master=0.8)
                .add_reverb(0.2, 0.3, 0.1, 0.2, 0.6, 0.25, 0.3))
    
    @staticmethod
    def acoustic_natural(name: str = "Natural Acoustic") -> PresetGenerator:
        """Preset para guitarra acústica natural"""
        return (PresetGenerator()
                .new_preset(name, "Sonido acústico natural y claro")
                .add_noise_gate(0.05, 0.2)
                .add_compressor('optical', {'attack': 0.3, 'release': 0.6})
                .add_amplifier('pure_acoustic', gain=0.3, bass=0.5, mid=0.5, treble=0.6, master=0.6)
                .add_modulation('chorus_digital', {'rate': 0.3, 'depth': 0.2, 'tone': 0.6, 'level': 0.8})
                .add_reverb(0.5, 0.6, 0.4, 0.1, 0.3, 0.4, 0.1))
    
    @staticmethod
    def bass_funk(name: str = "Funk Bass") -> PresetGenerator:
        """Preset para bajo funk"""
        return (PresetGenerator()
                .new_preset(name, "Bajo punchy para funk")
                .add_noise_gate(0.1, 0.12)
                .add_compressor('bass', {'threshold': 0.4, 'ratio': 0.6})
                .add_amplifier('rb_800', gain=0.4, bass=0.7, mid=0.6, treble=0.5, master=0.7)
                .add_reverb(0.2, 0.3, 0.1, 0.05, 0.7, 0.2, 0.4))

def main():
    """Función principal para demostrar el uso"""
    
    # Crear directorio de salida
    output_dir = Path("generated_presets")
    output_dir.mkdir(exist_ok=True)
    
    print("Generando presets de ejemplo...")
    
    # Generar presets usando plantillas
    templates = [
        PresetTemplates.clean_jazz("Jazz Lounge"),
        PresetTemplates.blues_overdrive("Delta Blues"),
        PresetTemplates.metal_high_gain("Heavy Thunder"),
        PresetTemplates.acoustic_natural("Campfire Acoustic"),
        PresetTemplates.bass_funk("Slap Master")
    ]
    
    categories = ["Jazz", "Blues", "Metal", "Acoustic", "Bass"]
    
    for template, category in zip(templates, categories):
        try:
            preset_dir = template.save_preset(output_dir, category)
            print(f"✓ Generado: {preset_dir}")
        except Exception as e:
            print(f"✗ Error generando preset: {e}")
    
    print(f"\nPresets generados en: {output_dir.absolute()}")
    print("Usar preset-validator.py para validar los presets generados")

if __name__ == "__main__":
    main()