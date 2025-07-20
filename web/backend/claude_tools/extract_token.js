#!/usr/bin/env node
const fileTokenStore = require('../dist/services/fileTokenStore.service').default;

// Get the token for the user ID we have
const userId = 'dbid:AADii9kfkvLn0FUpf59LofBFQHtuCOLczLM';
const tokenData = fileTokenStore.getToken(userId);

if (tokenData) {
  console.log(tokenData.accessToken);
} else {
  console.error('No token found');
  process.exit(1);
}