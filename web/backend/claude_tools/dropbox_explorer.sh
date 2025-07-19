#!/bin/bash

# Script directo para explorar Dropbox con access token real
# Uso: ./dropbox_explorer.sh

echo "🔍 EXPLORADOR DIRECTO DE DROPBOX"
echo "================================"
echo ""
echo "Este script necesita el ACCESS TOKEN real de Dropbox (NO el JWT)"
echo ""
echo "Para obtenerlo:"
echo "1. Haz login en http://localhost:3000 con Dropbox"
echo "2. Revisa los logs del servidor cuando hagas el OAuth"
echo "3. O usa el Dropbox App Console para generar uno temporal"
echo ""
read -p "Pega aquí tu Dropbox Access Token: " ACCESS_TOKEN

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Error: Token vacío"
    exit 1
fi

echo ""
echo "✅ Token recibido (${#ACCESS_TOKEN} caracteres)"
echo ""

# Función para listar archivos en una ubicación
list_files() {
    local path="$1"
    echo "📁 Explorando: $path"
    echo "-------------------"
    
    RESPONSE=$(curl -s -X POST https://api.dropboxapi.com/2/files/list_folder \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        --data "{\"path\": \"$path\", \"recursive\": true, \"include_non_downloadable_files\": false}")
    
    # Verificar si hay error
    if echo "$RESPONSE" | grep -q '"error"'; then
        echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error_summary // .error')"
        return
    fi
    
    # Contar total de entradas
    TOTAL=$(echo "$RESPONSE" | jq '.entries | length')
    echo "📊 Total de archivos/carpetas encontrados: $TOTAL"
    
    # Listar archivos ZIP
    echo ""
    echo "🗜️  Archivos ZIP encontrados:"
    echo "$RESPONSE" | jq -r '.entries[] | select(.".tag" == "file" and .name | endswith(".zip")) | "   - \(.path_display // .path_lower) (\(.size) bytes)"'
    
    # Listar archivos .preset
    echo ""
    echo "🎸 Archivos .preset encontrados:"
    echo "$RESPONSE" | jq -r '.entries[] | select(.".tag" == "file" and .name | endswith(".preset")) | "   - \(.path_display // .path_lower) (\(.size) bytes)"'
    
    # Listar carpetas
    echo ""
    echo "📂 Carpetas encontradas:"
    echo "$RESPONSE" | jq -r '.entries[] | select(.".tag" == "folder") | "   - \(.path_display // .path_lower)"'
    
    # Mostrar todos los archivos (primeros 20)
    echo ""
    echo "📄 Todos los archivos (máx 20):"
    echo "$RESPONSE" | jq -r '.entries[] | select(.".tag" == "file") | "   - \(.name) -> \(.path_display // .path_lower)"' | head -20
    
    # Si hay más archivos, mostrar cuántos
    if [ "$TOTAL" -gt 20 ]; then
        echo "   ... y $((TOTAL - 20)) archivos más"
    fi
}

# Función para buscar archivos
search_files() {
    local query="$1"
    echo ""
    echo "🔎 Buscando archivos que contengan: '$query'"
    echo "----------------------------------------"
    
    RESPONSE=$(curl -s -X POST https://api.dropboxapi.com/2/files/search_v2 \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        --data "{\"query\": \"$query\", \"options\": {\"path\": \"\", \"max_results\": 100}}")
    
    if echo "$RESPONSE" | grep -q '"error"'; then
        echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error_summary // .error')"
        return
    fi
    
    MATCHES=$(echo "$RESPONSE" | jq '.matches | length')
    echo "📊 Resultados encontrados: $MATCHES"
    
    echo "$RESPONSE" | jq -r '.matches[].metadata.metadata | "   - \(.name) -> \(.path_display // .path_lower)"'
}

# Función para obtener información de la cuenta
get_account_info() {
    echo "👤 Información de la cuenta"
    echo "-------------------------"
    
    RESPONSE=$(curl -s -X POST https://api.dropboxapi.com/2/users/get_current_account \
        --header "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q '"error"'; then
        echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error_summary // .error')"
        return
    fi
    
    echo "$RESPONSE" | jq -r '"   Nombre: \(.name.display_name)\n   Email: \(.email)\n   País: \(.country)"'
}

# Función para descargar y analizar un ZIP
analyze_zip() {
    local zip_path="$1"
    echo ""
    echo "📦 Analizando contenido del ZIP: $zip_path"
    echo "----------------------------------------"
    
    # Descargar el archivo
    TEMP_FILE="/tmp/dropbox_temp_$(date +%s).zip"
    
    curl -s -X POST https://content.dropboxapi.com/2/files/download \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Dropbox-API-Arg: {\"path\": \"$zip_path\"}" \
        --output "$TEMP_FILE"
    
    if [ -f "$TEMP_FILE" ]; then
        echo "✅ ZIP descargado temporalmente"
        
        # Listar contenido del ZIP
        echo ""
        echo "📋 Contenido del ZIP:"
        unzip -l "$TEMP_FILE" | grep -E "\.preset|\.json" | head -20
        
        # Contar presets
        PRESET_COUNT=$(unzip -l "$TEMP_FILE" | grep -c "\.preset")
        echo ""
        echo "🎸 Total de archivos .preset en el ZIP: $PRESET_COUNT"
        
        # Limpiar
        rm -f "$TEMP_FILE"
    else
        echo "❌ Error descargando el ZIP"
    fi
}

# INICIO DE LA EXPLORACIÓN
echo ""
echo "🚀 INICIANDO EXPLORACIÓN..."
echo ""

# 1. Verificar cuenta
get_account_info

# 2. Explorar ubicaciones principales
echo ""
echo "📍 EXPLORANDO UBICACIONES PRINCIPALES"
echo "====================================="

# Lista de ubicaciones a explorar
LOCATIONS=(
    "/Aplicaciones/Spark Amp"
    "/Aplicaciones"
    "/Apps/Spark Amp"
    "/Apps"
    "/"
)

for location in "${LOCATIONS[@]}"; do
    echo ""
    list_files "$location"
    echo ""
    echo "═══════════════════════════════════════════════"
done

# 3. Buscar archivos específicos
echo ""
echo "🔍 BÚSQUEDAS ESPECÍFICAS"
echo "======================="

search_files "preset_backup.zip"
search_files "preset"
search_files "spark"
search_files ".zip"

# 4. Si encontramos un ZIP, analizarlo
echo ""
echo "💡 Si ves algún archivo ZIP que podría contener presets,"
echo "   puedes analizarlo ejecutando:"
echo ""
echo "   ./dropbox_explorer.sh analyze '/ruta/al/archivo.zip'"
echo ""

# Verificar si se pasó un parámetro para analizar un ZIP
if [ "$1" = "analyze" ] && [ -n "$2" ]; then
    analyze_zip "$2"
fi

echo ""
echo "✅ EXPLORACIÓN COMPLETADA"
echo ""
echo "📌 NOTA: Si los archivos existen pero no los encontramos, verifica:"
echo "   1. Que el access token tenga permisos completos"
echo "   2. La capitalización exacta de las carpetas (Aplicaciones vs aplicaciones)"
echo "   3. Si los archivos están en una subcarpeta no explorada"