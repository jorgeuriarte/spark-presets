#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Configuration
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'dev-encryption-key';
const encryptionKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
const tokensFile = path.join(__dirname, '..', '.tokens', 'dropbox-tokens.json');

// Read file
const data = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
const userId = Object.keys(data)[0];
const encrypted = data[userId];

// Decrypt
const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(encrypted.iv, 'hex'));
let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
decrypted += decipher.final('utf8');

const tokenData = JSON.parse(decrypted);
console.log(tokenData.accessToken);