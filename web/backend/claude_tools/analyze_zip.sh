#!/bin/bash

# Analizar el contenido del ZIP de presets
ACCESS_TOKEN="$1"
ZIP_PATH="/Aplicaciones/Spark Amp/preset_backup.zip"

echo "📦 Analizando contenido del ZIP: $ZIP_PATH"
echo "----------------------------------------"

# Descargar el archivo
TEMP_FILE="/tmp/spark_preset_backup_$(date +%s).zip"

curl -s -X POST https://content.dropboxapi.com/2/files/download \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --header "Dropbox-API-Arg: {\"path\": \"$ZIP_PATH\"}" \
    --output "$TEMP_FILE"

if [ -f "$TEMP_FILE" ]; then
    echo "✅ ZIP descargado temporalmente"
    echo "📏 Tamaño del archivo: $(du -h "$TEMP_FILE" | cut -f1)"
    
    # Listar contenido del ZIP
    echo ""
    echo "📋 Contenido del ZIP:"
    unzip -l "$TEMP_FILE" | head -50
    
    # Contar presets
    PRESET_COUNT=$(unzip -l "$TEMP_FILE" | grep -c "\.preset")
    echo ""
    echo "🎸 Total de archivos .preset en el ZIP: $PRESET_COUNT"
    
    # Mostrar algunos archivos .preset
    echo ""
    echo "🎸 Primeros 10 archivos .preset:"
    unzip -l "$TEMP_FILE" | grep "\.preset" | head -10
    
    # Extraer un preset de ejemplo para ver su contenido
    echo ""
    echo "📄 Extrayendo un preset de ejemplo..."
    FIRST_PRESET=$(unzip -l "$TEMP_FILE" | grep "\.preset" | head -1 | awk '{print $NF}')
    if [ -n "$FIRST_PRESET" ]; then
        unzip -p "$TEMP_FILE" "$FIRST_PRESET" | head -20
    fi
    
    # Limpiar
    rm -f "$TEMP_FILE"
else
    echo "❌ Error descargando el ZIP"
fi