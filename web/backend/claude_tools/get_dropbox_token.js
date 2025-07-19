// Script para interceptar y mostrar el access token de Dropbox
// Uso: node get_dropbox_token.js

const express = require('express');
const app = express();

console.log('🔍 INTERCEPTOR DE TOKEN DE DROPBOX');
console.log('==================================');
console.log('');
console.log('Este servidor interceptará el token cuando hagas OAuth');
console.log('');
console.log('INSTRUCCIONES:');
console.log('1. Modifica temporalmente el DROPBOX_REDIRECT_URI en .env a:');
console.log('   DROPBOX_REDIRECT_URI=http://localhost:9999/callback');
console.log('');
console.log('2. Reinicia el servidor backend');
console.log('3. Haz el flujo OAuth normal en http://localhost:3000');
console.log('4. Este script capturará y mostrará el access token');
console.log('');
console.log('Escuchando en http://localhost:9999/callback ...');

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        console.log('❌ No se recibió código de autorización');
        res.send('Error: No authorization code');
        return;
    }
    
    console.log('✅ Código de autorización recibido:', code);
    console.log('');
    console.log('Intercambiando código por access token...');
    
    // Intercambiar código por token
    const fetch = require('node-fetch');
    const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.DROPBOX_APP_KEY || '347f27hh3e1v1f4',
        client_secret: process.env.DROPBOX_APP_SECRET || 'ceaottv4m7r2fo6',
        redirect_uri: 'http://localhost:9999/callback'
    });
    
    try {
        const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        const data = await response.json();
        
        if (data.access_token) {
            console.log('');
            console.log('🎉 ¡ACCESS TOKEN OBTENIDO!');
            console.log('========================');
            console.log('');
            console.log('ACCESS TOKEN:', data.access_token);
            console.log('');
            console.log('Guarda este token y úsalo con el script dropbox_explorer.sh');
            console.log('');
            
            // Redirigir al usuario de vuelta a la app
            res.redirect(`http://localhost:3000/?token=${data.access_token}`);
        } else {
            console.log('❌ Error obteniendo token:', data);
            res.json(data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(9999, () => {
    console.log('');
    console.log('🚀 Servidor interceptor corriendo en puerto 9999');
});