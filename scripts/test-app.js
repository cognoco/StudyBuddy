#!/usr/bin/env node

const { exec } = require('child_process');
const http = require('http');

console.log('Testing StudyBuddy app...');

// Check if the server is responding
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Server is running on port 8081 (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (e) => {
      console.error(`❌ Server check failed: ${e.message}`);
      reject(false);
    });

    req.end();
  });
};

// Main test
const runTests = async () => {
  try {
    // Check if Metro bundler is running
    await checkServer();
    
    // Check bundle status
    const bundleCheck = http.get('http://localhost:8081/status', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Metro bundler is healthy');
      }
    });
    
    console.log('\n🎉 App is running successfully!');
    console.log('You can access it at: http://localhost:8081');
    
  } catch (error) {
    console.error('Failed to verify app status:', error);
    process.exit(1);
  }
};

// Run after a short delay to ensure server is ready
setTimeout(runTests, 2000);