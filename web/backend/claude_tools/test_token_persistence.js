#!/usr/bin/env node

const { fileTokenStore } = require('../dist/services/fileTokenStore.service');

// Test storing a token
const testUserId = 'test-user-123';
const testToken = {
  accessToken: 'test-access-token-12345',
  refreshToken: 'test-refresh-token-67890',
  expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
};

console.log('Testing token persistence...\n');

// Store the token
console.log('1. Storing token for user:', testUserId);
fileTokenStore.setToken(testUserId, testToken);

// Try to retrieve it
console.log('2. Retrieving token...');
const retrieved = fileTokenStore.getToken(testUserId);
console.log('   Retrieved:', retrieved ? 'Success' : 'Failed');
if (retrieved) {
  console.log('   Access Token:', retrieved.accessToken);
  console.log('   Has Refresh Token:', !!retrieved.refreshToken);
  console.log('   Expires At:', retrieved.expiresAt);
}

// Check if token file was created
const fs = require('fs');
const path = require('path');
const tokenFilePath = path.join(process.cwd(), '.tokens', 'dropbox-tokens.json');
console.log('\n3. Checking token file...');
console.log('   File path:', tokenFilePath);
console.log('   File exists:', fs.existsSync(tokenFilePath));

if (fs.existsSync(tokenFilePath)) {
  const fileContent = fs.readFileSync(tokenFilePath, 'utf8');
  console.log('   File size:', fileContent.length, 'bytes');
  console.log('   File content (truncated):', fileContent.substring(0, 100) + '...');
}

// Clean up
console.log('\n4. Cleaning up...');
fileTokenStore.removeToken(testUserId);
console.log('   Token removed');

console.log('\nTest complete!');