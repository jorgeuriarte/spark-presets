#!/bin/bash

# Script rápido para probar acceso directo a Dropbox
# Uso: ./test_dropbox_direct.sh "TU_ACCESS_TOKEN"

ACCESS_TOKEN="$1"

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Uso: ./test_dropbox_direct.sh \"tu_access_token_aqui\""
    echo ""
    echo "Para obtener el token:"
    echo "1. Ve a http://localhost:3000"
    echo "2. Haz click en 'Connect with Dropbox'"
    echo "3. Revisa los logs del servidor backend"
    echo "4. Copia el ACCESS TOKEN que aparece"
    exit 1
fi

echo "🔍 Probando acceso a Dropbox..."
echo ""

# 1. Verificar el token
echo "📋 Información de la cuenta:"
curl -s -X POST https://api.dropboxapi.com/2/users/get_current_account \
    --header "Authorization: Bearer $ACCESS_TOKEN" | jq '.name.display_name, .email' 2>/dev/null || echo "Error obteniendo info de cuenta"

echo ""
echo "📁 Explorando /Aplicaciones/Spark Amp:"
echo "-----------------------------------"

# 2. Listar archivos en Spark Amp
RESPONSE=$(curl -s -X POST https://api.dropboxapi.com/2/files/list_folder \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --header "Content-Type: application/json" \
    --data '{"path": "/Aplicaciones/Spark Amp", "recursive": true}')

echo "$RESPONSE" | jq -r '.entries[] | "\(.".tag") -> \(.name) [\(.path_display // .path_lower)]"' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔎 Buscando preset_backup.zip en todo Dropbox:"
echo "--------------------------------------------"

# 3. Buscar preset_backup.zip
SEARCH=$(curl -s -X POST https://api.dropboxapi.com/2/files/search_v2 \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --header "Content-Type: application/json" \
    --data '{"query": "preset_backup.zip", "options": {"path": "", "max_results": 10}}')

echo "$SEARCH" | jq -r '.matches[].metadata.metadata | "Encontrado: \(.path_display // .path_lower)"' 2>/dev/null || echo "No encontrado"

echo ""
echo "🔎 Buscando cualquier archivo .zip:"
echo "---------------------------------"

# 4. Buscar cualquier ZIP
SEARCH2=$(curl -s -X POST https://api.dropboxapi.com/2/files/search_v2 \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --header "Content-Type: application/json" \
    --data '{"query": ".zip", "options": {"path": "", "max_results": 20}}')

echo "$SEARCH2" | jq -r '.matches[].metadata.metadata | select(.name | endswith(".zip")) | "ZIP: \(.path_display // .path_lower)"' 2>/dev/null || echo "No se encontraron ZIPs"