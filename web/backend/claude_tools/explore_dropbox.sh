#!/bin/bash

# Script completo para explorar Dropbox y buscar presets de Spark
# Uso: ./explore_dropbox.sh

echo "🔍 EXPLORADOR COMPLETO DE DROPBOX PARA SPARK PRESETS"
echo "=================================================="

# Primero obtenemos un token JWT válido
echo ""
echo "1️⃣ Obteniendo token de autenticación..."
echo "   Ve a http://localhost:3000 y haz login con Dropbox"
echo "   Luego presiona ENTER para continuar"
read -p "   ¿Ya hiciste login? (Enter para continuar): "

# Extraer token del navegador (necesitarás copiarlo manualmente)
echo ""
echo "📋 Abre las herramientas de desarrollador en el navegador y ejecuta:"
echo "   localStorage.getItem('authToken')"
echo ""
read -p "Pega aquí tu token JWT: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Error: Token vacío"
    exit 1
fi

echo ""
echo "✅ Token recibido (${#JWT_TOKEN} caracteres)"

# Función para hacer peticiones autenticadas
make_request() {
    local method=$1
    local url=$2
    local data=$3
    
    if [ "$method" = "POST" ]; then
        curl -s -X POST \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url"
    else
        curl -s \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "$url"
    fi
}

echo ""
echo "2️⃣ Verificando autenticación..."
AUTH_RESPONSE=$(make_request GET "http://localhost:3001/api/auth/me")
echo "   Respuesta: $AUTH_RESPONSE"

if echo "$AUTH_RESPONSE" | grep -q "error"; then
    echo "❌ Error de autenticación. Verifica el token."
    exit 1
fi

echo ""
echo "3️⃣ Probando acceso directo a presets por nuestra API..."
PRESETS_RESPONSE=$(make_request GET "http://localhost:3001/api/presets")
echo "   Respuesta: $PRESETS_RESPONSE"

echo ""
echo "4️⃣ Creando script de exploración manual..."

# Crear un script temporal para explorar ubicaciones específicas
cat > /tmp/explore_locations.py << 'EOF'
import requests
import json
import sys

def explore_dropbox_location(jwt_token, location):
    """Explora una ubicación específica de Dropbox"""
    
    # Primero obtenemos información del usuario para validar el token
    try:
        auth_response = requests.get(
            "http://localhost:3001/api/auth/me",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        
        if auth_response.status_code != 200:
            print(f"❌ Error de autenticación: {auth_response.text}")
            return None
            
        user_info = auth_response.json()
        print(f"✅ Autenticado como: {user_info.get('user', {}).get('email', 'Usuario')}")
        
    except Exception as e:
        print(f"❌ Error verificando autenticación: {e}")
        return None
    
    # Crear un endpoint temporal para explorar ubicaciones específicas
    print(f"\n🔍 Explorando ubicación: {location}")
    print("=" * 60)
    
    # Hacer petición directa a nuestro endpoint de presets
    # (que internamente llamará a Dropbox)
    try:
        response = requests.get(
            "http://localhost:3001/api/presets",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            presets = data.get('data', [])
            print(f"📊 Total presets encontrados: {len(presets)}")
            
            if presets:
                print("\n📋 Lista de presets:")
                for i, preset in enumerate(presets[:10], 1):  # Mostrar solo los primeros 10
                    print(f"   {i}. {preset.get('name', 'Sin nombre')} - {preset.get('path', 'Sin ruta')}")
                
                if len(presets) > 10:
                    print(f"   ... y {len(presets) - 10} más")
            else:
                print("❌ No se encontraron presets")
                
        else:
            print(f"❌ Error en petición: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error explorando: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python explore_locations.py <JWT_TOKEN>")
        sys.exit(1)
    
    jwt_token = sys.argv[1]
    
    # Ubicaciones a explorar
    locations = [
        "/Aplicaciones/Spark Amp",
        "/Aplicaciones", 
        "/",
        "Apps/Spark Amp",
        "Apps"
    ]
    
    for location in locations:
        explore_dropbox_location(jwt_token, location)
        print("\n" + "="*80 + "\n")

EOF

echo ""
echo "5️⃣ Ejecutando exploración avanzada..."
python3 /tmp/explore_locations.py "$JWT_TOKEN"

echo ""
echo "6️⃣ Búsqueda manual con diferentes nombres de archivos..."

# Función para buscar archivos específicos
search_files() {
    local search_term=$1
    echo "🔍 Buscando archivos que contengan: '$search_term'"
    
    # Usaremos el endpoint de presets como proxy para acceder a Dropbox
    # El servidor internamente hará la búsqueda
    SEARCH_RESPONSE=$(make_request GET "http://localhost:3001/api/presets?search=$search_term")
    echo "   Resultado: $SEARCH_RESPONSE"
}

# Buscar diferentes patrones
search_files "preset"
search_files "backup"
search_files ".zip"
search_files "Spark"

echo ""
echo "7️⃣ Información adicional del sistema..."
echo "   🖥️  Plataforma: $(uname -s)"
echo "   📅 Fecha: $(date)"
echo "   🔗 Backend URL: http://localhost:3001"
echo "   🔗 Frontend URL: http://localhost:3000"

echo ""
echo "8️⃣ Comandos útiles para debug manual:"
echo "   # Ver logs del servidor en tiempo real:"
echo "   tail -f server_new.log"
echo ""
echo "   # Hacer petición directa a presets:"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" http://localhost:3001/api/presets"
echo ""
echo "   # Ver información de usuario:"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" http://localhost:3001/api/auth/me"

echo ""
echo "✅ Exploración completada!"
echo ""
echo "💡 PRÓXIMOS PASOS:"
echo "   1. Si no encuentras presets, verifica que realmente tienes archivos en Dropbox"
echo "   2. Revisa los logs del servidor: tail -f server_new.log"
echo "   3. Si los logs muestran 'Using mock data', el token se perdió"
echo "   4. Si encuentras 0 archivos en Dropbox, puede que la carpeta esté vacía"

# Cleanup
rm -f /tmp/explore_locations.py