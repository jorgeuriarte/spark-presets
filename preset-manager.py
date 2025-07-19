#!/usr/bin/env python3
"""
Spark Preset Manager

Herramienta de gestión completa para presets de Spark.
Incluye validación, generación, importación y exportación.
"""

import argparse
import json
import shutil
import zipfile
from pathlib import Path
from typing import List, Dict
import sys

# Importar herramientas locales
try:
    from preset_validator import SparkPresetValidator
    from preset_generator import PresetGenerator, PresetTemplates
except ImportError as e:
    print(f"Error importando módulos: {e}")
    print("Asegúrate de que preset-validator.py y preset-generator.py estén en el mismo directorio")
    sys.exit(1)

class PresetManager:
    """Gestor principal de presets Spark"""
    
    def __init__(self):
        self.validator = SparkPresetValidator()
    
    def validate_presets(self, path: str, verbose: bool = False) -> bool:
        """Valida presets en el directorio especificado"""
        print(f"🔍 Validando presets en: {path}")
        
        success = self.validator.validate_all(path)
        
        if verbose or not success:
            self.validator.print_results()
        
        return success
    
    def list_presets(self, path: str) -> Dict[str, List[Dict]]:
        """Lista todos los presets organizados por categoría"""
        root_path = Path(path)
        presets_by_category = {}
        
        if not root_path.exists():
            print(f"❌ Directorio no existe: {path}")
            return {}
        
        for category_dir in root_path.iterdir():
            if not category_dir.is_dir():
                continue
            
            category_json = category_dir / "category.json"
            if not category_json.exists():
                continue
            
            try:
                with open(category_json, 'r', encoding='utf-8') as f:
                    category_data = json.load(f)
                
                category_name = category_data.get('meta', {}).get('name', category_dir.name)
                presets_by_category[category_name] = category_data.get('presets', [])
                
            except Exception as e:
                print(f"⚠️  Error leyendo {category_json}: {e}")
        
        return presets_by_category
    
    def print_preset_list(self, presets_by_category: Dict[str, List[Dict]]):
        """Imprime la lista de presets de forma organizada"""
        total_presets = sum(len(presets) for presets in presets_by_category.values())
        
        print(f"\n📁 Presets encontrados: {total_presets} en {len(presets_by_category)} categorías")
        print("=" * 60)
        
        for category, presets in presets_by_category.items():
            print(f"\n📂 {category} ({len(presets)} presets)")
            print("-" * 40)
            
            for preset in presets:
                name = preset.get('name', 'Sin nombre')
                desc = preset.get('description', '')
                preset_id = preset.get('id', '')[:8] + "..."
                
                print(f"  • {name}")
                if desc:
                    print(f"    {desc}")
                print(f"    ID: {preset_id}")
    
    def generate_templates(self, output_dir: str):
        """Genera presets de plantilla"""
        print(f"🎸 Generando plantillas de presets en: {output_dir}")
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Plantillas predefinidas
        templates = [
            (PresetTemplates.clean_jazz("Crystal Clean"), "Clean"),
            (PresetTemplates.clean_jazz("Jazz Lounge"), "Jazz"),
            (PresetTemplates.blues_overdrive("Blues Driver"), "Blues"),
            (PresetTemplates.blues_overdrive("Delta Crunch"), "Blues"),
            (PresetTemplates.metal_high_gain("Metal Core"), "Metal"),
            (PresetTemplates.metal_high_gain("Heavy Thunder"), "Metal"),
            (PresetTemplates.acoustic_natural("Natural Acoustic"), "Acoustic"),
            (PresetTemplates.acoustic_natural("Campfire Songs"), "Acoustic"),
            (PresetTemplates.bass_funk("Funk Bass"), "Bass"),
            (PresetTemplates.bass_funk("Slap Attack"), "Bass"),
        ]
        
        generated_count = 0
        for template, category in templates:
            try:
                preset_dir = template.save_preset(output_path, category)
                print(f"  ✓ {template.preset_data['meta']['name']} -> {category}")
                generated_count += 1
            except Exception as e:
                print(f"  ✗ Error: {e}")
        
        print(f"\n✅ Generados {generated_count} presets de plantilla")
        
        # Validar presets generados
        if self.validate_presets(str(output_path)):
            print("✅ Todos los presets generados son válidos")
        else:
            print("⚠️  Algunos presets generados tienen problemas")
    
    def export_package(self, source_dir: str, output_file: str, 
                      categories: List[str] = None):
        """Exporta presets a un archivo ZIP importable"""
        print(f"📦 Exportando presets a: {output_file}")
        
        source_path = Path(source_dir)
        if not source_path.exists():
            print(f"❌ Directorio fuente no existe: {source_dir}")
            return False
        
        # Validar antes de exportar
        if not self.validate_presets(source_dir):
            print("❌ Los presets contienen errores. Corrige antes de exportar.")
            return False
        
        try:
            with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for category_dir in source_path.iterdir():
                    if not category_dir.is_dir():
                        continue
                    
                    category_name = category_dir.name
                    
                    # Filtrar categorías si se especifica
                    if categories and category_name not in categories:
                        continue
                    
                    print(f"  📁 Empaquetando categoría: {category_name}")
                    
                    # Añadir todos los archivos de la categoría
                    for file_path in category_dir.rglob('*'):
                        if file_path.is_file():
                            arcname = file_path.relative_to(source_path)
                            zipf.write(file_path, arcname)
                            
            print(f"✅ Paquete creado: {output_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error creando paquete: {e}")
            return False
    
    def import_package(self, package_file: str, target_dir: str, 
                      overwrite: bool = False):
        """Importa presets desde un archivo ZIP"""
        print(f"📥 Importando presets desde: {package_file}")
        
        if not Path(package_file).exists():
            print(f"❌ Archivo no existe: {package_file}")
            return False
        
        target_path = Path(target_dir)
        target_path.mkdir(parents=True, exist_ok=True)
        
        try:
            with zipfile.ZipFile(package_file, 'r') as zipf:
                # Extraer a directorio temporal primero
                temp_dir = target_path / "temp_import"
                temp_dir.mkdir(exist_ok=True)
                
                zipf.extractall(temp_dir)
                
                # Validar contenido extraído
                if not self.validate_presets(str(temp_dir)):
                    print("❌ El paquete contiene presets inválidos")
                    shutil.rmtree(temp_dir)
                    return False
                
                # Mover archivos al destino final
                imported_count = 0
                for item in temp_dir.iterdir():
                    if item.is_dir():
                        dest = target_path / item.name
                        
                        if dest.exists() and not overwrite:
                            print(f"  ⚠️  Categoría existe, omitiendo: {item.name}")
                            continue
                        
                        if dest.exists():
                            shutil.rmtree(dest)
                        
                        shutil.move(str(item), str(dest))
                        imported_count += 1
                        print(f"  ✓ Importada categoría: {item.name}")
                
                # Limpiar directorio temporal
                shutil.rmtree(temp_dir)
                
                print(f"✅ Importadas {imported_count} categorías")
                return True
                
        except Exception as e:
            print(f"❌ Error importando paquete: {e}")
            return False
    
    def create_preset_interactive(self, output_dir: str):
        """Crea un preset de forma interactiva"""
        print("🎸 Creador interactivo de presets")
        print("=" * 40)
        
        # Información básica
        name = input("Nombre del preset: ").strip()
        if not name:
            print("❌ El nombre es requerido")
            return
        
        description = input("Descripción (opcional): ").strip()
        category = input("Categoría: ").strip() or "Custom"
        
        # Crear preset
        generator = PresetGenerator().new_preset(name, description)
        
        # Noise Gate (siempre incluido)
        print("\n🚪 Configurando Noise Gate...")
        threshold = float(input("Threshold (0.0-1.0) [0.1]: ") or "0.1")
        decay = float(input("Decay (0.0-1.0) [0.15]: ") or "0.15")
        generator.add_noise_gate(threshold, decay)
        
        # Compresor (opcional)
        if input("\n🗜️  ¿Añadir compresor? (y/N): ").lower().startswith('y'):
            comp_types = ['la2a', 'red', 'bass', 'optical', 'sustainer']
            print(f"Tipos disponibles: {', '.join(comp_types)}")
            comp_type = input("Tipo de compresor: ").strip()
            
            if comp_type in comp_types:
                # Parámetros básicos para compresor
                params = {
                    'threshold': float(input("Threshold (0.0-1.0) [0.4]: ") or "0.4"),
                    'ratio': float(input("Ratio (0.0-1.0) [0.5]: ") or "0.5")
                }
                generator.add_compressor(comp_type, params)
        
        # Overdrive (opcional)
        if input("\n🎸 ¿Añadir overdrive/distorsión? (y/N): ").lower().startswith('y'):
            drive_types = ['tube', 'overdrive', 'clone', 'guitar_muff', 'fuzz_face']
            print(f"Tipos disponibles: {', '.join(drive_types)}")
            drive_type = input("Tipo de overdrive: ").strip()
            
            if drive_type in drive_types:
                params = {
                    'drive': float(input("Drive (0.0-1.0) [0.5]: ") or "0.5"),
                    'tone': float(input("Tone (0.0-1.0) [0.5]: ") or "0.5"),
                    'level': float(input("Level (0.0-1.0) [0.7]: ") or "0.7")
                }
                generator.add_overdrive(drive_type, params)
        
        # Amplificador (requerido)
        print("\n🔊 Configurando amplificador...")
        amp_types = ['silver_120', 'black_duo', 'ac_boost', 'tweed_bass', 
                    'american_high_gain', 'insane', 'rb_800', 'pure_acoustic']
        print(f"Tipos disponibles: {', '.join(amp_types)}")
        amp_type = input("Tipo de amplificador: ").strip()
        
        if amp_type not in amp_types:
            amp_type = 'black_duo'  # Por defecto
            print(f"Usando amplificador por defecto: {amp_type}")
        
        gain = float(input("Gain (0.0-1.0) [0.5]: ") or "0.5")
        bass = float(input("Bass (0.0-1.0) [0.5]: ") or "0.5")
        mid = float(input("Mid (0.0-1.0) [0.5]: ") or "0.5")
        treble = float(input("Treble (0.0-1.0) [0.5]: ") or "0.5")
        master = float(input("Master (0.0-1.0) [0.6]: ") or "0.6")
        
        generator.add_amplifier(amp_type, gain, bass, mid, treble, master)
        
        # Delay (opcional)
        if input("\n🔄 ¿Añadir delay? (y/N): ").lower().startswith('y'):
            delay_types = ['digital', 'vintage', 'echo_tape']
            print(f"Tipos disponibles: {', '.join(delay_types)}")
            delay_type = input("Tipo de delay: ").strip() or 'digital'
            
            time = float(input("Time (0.0-1.0) [0.3]: ") or "0.3")
            feedback = float(input("Feedback (0.0-1.0) [0.3]: ") or "0.3")
            mix = float(input("Mix (0.0-1.0) [0.3]: ") or "0.3")
            
            generator.add_delay(delay_type, time, feedback, mix)
        
        # Reverb (recomendado)
        if input("\n🌊 ¿Añadir reverb? (Y/n): ").lower() != 'n':
            room_size = float(input("Room Size (0.0-1.0) [0.3]: ") or "0.3")
            decay = float(input("Decay (0.0-1.0) [0.4]: ") or "0.4")
            mix = float(input("Mix (0.0-1.0) [0.4]: ") or "0.4")
            
            generator.add_reverb(room_size, decay, mix=mix)
        
        # Guardar preset
        try:
            preset_dir = generator.save_preset(output_dir, category)
            print(f"\n✅ Preset creado: {preset_dir}")
            
            # Validar preset creado
            if self.validate_presets(str(Path(output_dir) / category)):
                print("✅ Preset válido")
            else:
                print("⚠️  Preset tiene problemas de validación")
                
        except Exception as e:
            print(f"❌ Error creando preset: {e}")

def main():
    parser = argparse.ArgumentParser(description="Gestor de presets Spark")
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponibles')
    
    # Comando validate
    validate_parser = subparsers.add_parser('validate', help='Validar presets')
    validate_parser.add_argument('path', help='Directorio de presets')
    validate_parser.add_argument('--verbose', '-v', action='store_true', help='Salida detallada')
    
    # Comando list
    list_parser = subparsers.add_parser('list', help='Listar presets')
    list_parser.add_argument('path', help='Directorio de presets')
    
    # Comando generate
    generate_parser = subparsers.add_parser('generate', help='Generar plantillas')
    generate_parser.add_argument('output', help='Directorio de salida')
    
    # Comando export
    export_parser = subparsers.add_parser('export', help='Exportar presets')
    export_parser.add_argument('source', help='Directorio fuente')
    export_parser.add_argument('output', help='Archivo de salida (.zip)')
    export_parser.add_argument('--categories', nargs='+', help='Categorías específicas')
    
    # Comando import
    import_parser = subparsers.add_parser('import', help='Importar presets')
    import_parser.add_argument('package', help='Archivo de paquete (.zip)')
    import_parser.add_argument('target', help='Directorio de destino')
    import_parser.add_argument('--overwrite', action='store_true', help='Sobrescribir existentes')
    
    # Comando create
    create_parser = subparsers.add_parser('create', help='Crear preset interactivamente')
    create_parser.add_argument('output', help='Directorio de salida')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    manager = PresetManager()
    
    try:
        if args.command == 'validate':
            success = manager.validate_presets(args.path, args.verbose)
            return 0 if success else 1
        
        elif args.command == 'list':
            presets = manager.list_presets(args.path)
            manager.print_preset_list(presets)
            return 0
        
        elif args.command == 'generate':
            manager.generate_templates(args.output)
            return 0
        
        elif args.command == 'export':
            success = manager.export_package(args.source, args.output, args.categories)
            return 0 if success else 1
        
        elif args.command == 'import':
            success = manager.import_package(args.package, args.target, args.overwrite)
            return 0 if success else 1
        
        elif args.command == 'create':
            manager.create_preset_interactive(args.output)
            return 0
    
    except KeyboardInterrupt:
        print("\n⏹️  Operación cancelada por el usuario")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())