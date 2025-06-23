#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Transcribe Anything Web App...\n');

// Start the server
const serverPath = path.join(__dirname, '../server/index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGTERM');
});