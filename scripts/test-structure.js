#!/usr/bin/env node

// Simple test to validate the built CLI structure
const fs = require('fs');
const path = require('path');

console.log('Testing K8S Daily Summary CLI structure...\n');

const requiredFiles = [
  'dist/index.js',
  'dist/utils/k8s-client.js',
  'dist/collectors/pod.js',
  'dist/collectors/job.js',
  'dist/collectors/event.js',
  'dist/analyzers/summary.js',
  'dist/formatters/console.js',
  'dist/formatters/markdown.js',
  'dist/types/index.js'
];

let allFilesExist = true;

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - MISSING`);
    allFilesExist = false;
  }
}

console.log('\n' + (allFilesExist ? '✅ All required files are present!' : '❌ Some files are missing!'));

// Test that the main CLI can be required
try {
  console.log('\nTesting CLI import...');
  process.env.K8S_SUMMARY_SKIP_CONNECT = '1';
  require('../dist/index.js');
  console.log('✓ CLI can be imported successfully');
} catch (error) {
  console.log('✗ CLI import failed:', error.message);
}
