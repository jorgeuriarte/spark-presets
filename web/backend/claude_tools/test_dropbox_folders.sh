#!/bin/bash

# Script para explorar carpetas de Dropbox y encontrar donde están los presets de Spark
# Uso: ./test_dropbox_folders.sh

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYmlkOkFBRGlpOWtma3ZMbjBGVXBmNTlMb2ZCRlFIdHVDT0xjekxNIiwiZW1haWwiOiJqb3JnZS51cmlhcnRlQG9tZWxhcy5uZXQiLCJkcm9wYm94SWQiOiJkYmlkOkFBRGlpOWtma3ZMbjBGVXBmNTlMb2ZCRlFIdHVDT0xjekxNIiwiZHJvcGJveENvbm5lY3RlZCI6dHJ1ZSwiZGlzcGxheU5hbWUiOiJKb3JnZSBVcmlhcnRlIiwiaWF0IjoxNzUyOTUwNzY1LCJleHAiOjE3NTM1NTU1NjV9.VHmoXt5tMSZOxqWmlB0QCFP6DEQg-KrteCGiXcz-P28"

echo "🔍 Explorando Dropbox para encontrar presets de Spark Amp..."
echo "=============================================="

echo ""
echo "1️⃣ Listando carpeta raíz:"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "", "recursive": false}' \
  https://api.dropboxapi.com/2/files/list_folder)
echo "$RESPONSE" | jq -r '.entries[]? | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"' 2>/dev/null || echo "Error: $RESPONSE"

echo ""
echo "2️⃣ Probando /Aplicaciones (español):"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/Aplicaciones", "recursive": false}' \
  https://api.dropboxapi.com/2/files/list_folder)
echo "$RESPONSE" | jq -r '.entries[]? | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"' 2>/dev/null || echo "❌ Error o no encontrada: $(echo "$RESPONSE" | jq -r '.error_summary // "respuesta inesperada"')"

echo ""
echo "3️⃣ Probando /Applications (inglés):"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/Applications", "recursive": false}' \
  https://api.dropboxapi.com/2/files/list_folder)
echo "$RESPONSE" | jq -r '.entries[]? | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"' 2>/dev/null || echo "❌ Error o no encontrada: $(echo "$RESPONSE" | jq -r '.error_summary // "respuesta inesperada"')"

echo ""
echo "4️⃣ Probando /Apps:"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/Apps", "recursive": false}' \
  https://api.dropboxapi.com/2/files/list_folder)
echo "$RESPONSE" | jq -r '.entries[]? | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"' 2>/dev/null || echo "❌ Error o no encontrada: $(echo "$RESPONSE" | jq -r '.error_summary // "respuesta inesperada"')"

echo ""
echo "5️⃣ Buscando carpetas que contengan 'Spark' en el nombre:"
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Spark", "mode": {"".tag": "filename"}}' \
  https://api.dropboxapi.com/2/files/search_v2 | jq -r '.matches[]? | .metadata.metadata | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"'

echo ""
echo "6️⃣ Buscando archivos .preset en toda la cuenta:"
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": ".preset", "mode": {"".tag": "filename"}}' \
  https://api.dropboxapi.com/2/files/search_v2 | jq -r '.matches[]? | .metadata.metadata | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"'

echo ""
echo "7️⃣ Buscando archivos preset_backup.zip:"
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "preset_backup.zip", "mode": {"".tag": "filename"}}' \
  https://api.dropboxapi.com/2/files/search_v2 | jq -r '.matches[]? | .metadata.metadata | "\(.".tag"): \(.name) -> \(.path_display // .path_lower)"'

echo ""
echo "=============================================="
echo "✅ Exploración completada!"