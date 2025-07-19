#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYmlkOkFBRGlpOWtma3ZMbjBGVXBmNTlMb2ZCRlFIdHVDT0xjekxNIiwiZW1haWwiOiJqb3JnZS51cmlhcnRlQG9tZWxhcy5uZXQiLCJkcm9wYm94SWQiOiJkYmlkOkFBRGlpOWtma3ZMbjBGVXBmNTlMb2ZCRlFIdHVDT0xjekxNIiwiZHJvcGJveENvbm5lY3RlZCI6dHJ1ZSwiZGlzcGxheU5hbWUiOiJKb3JnZSBVcmlhcnRlIiwiaWF0IjoxNzUyOTUwNzY1LCJleHAiOjE3NTM1NTU1NjV9.VHmoXt5tMSZOxqWmlB0QCFP6DEQg-KrteCGiXcz-P28"

echo "🔍 Debug Dropbox API"
echo "==================="

echo ""
echo "1️⃣ Raw response - listar raíz:"
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "", "recursive": false}' \
  https://api.dropboxapi.com/2/files/list_folder

echo ""
echo ""
echo "2️⃣ Testeando nuestra propia API:"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/presets

echo ""