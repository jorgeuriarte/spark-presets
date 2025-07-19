#!/bin/bash

# Script rápido para probar con token específico
# Uso: ./quick_test.sh "tu_jwt_token_aqui"

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 \"tu_jwt_token\""
    echo ""
    echo "Para obtener el token:"
    echo "1. Ve a http://localhost:3000"
    echo "2. Haz login con Dropbox"
    echo "3. Abre DevTools (F12)"
    echo "4. En la consola ejecuta: localStorage.getItem('authToken')"
    echo "5. Copia el token y úsalo con este script"
    exit 1
fi

TOKEN="$1"

echo "🔍 PRUEBA RÁPIDA DE DROPBOX"
echo "=========================="

echo ""
echo "1️⃣ Verificando autenticación..."
AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me)
echo "$AUTH_RESPONSE" | jq . 2>/dev/null || echo "$AUTH_RESPONSE"

echo ""
echo "2️⃣ Obteniendo presets..."
PRESETS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/presets)
echo "$PRESETS_RESPONSE" | jq . 2>/dev/null || echo "$PRESETS_RESPONSE"

echo ""
echo "3️⃣ Verificando logs del servidor..."
echo "Últimas 10 líneas del log:"
tail -n 10 server_new.log 2>/dev/null || echo "No se pudo leer el log"

echo ""
echo "4️⃣ Estado del servidor..."
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health