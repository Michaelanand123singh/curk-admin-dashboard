#!/usr/bin/env node

/**
 * Environment Validation Script for Admin Dashboard
 * 
 * This script validates that all required environment variables are set
 * and provides helpful error messages if they're missing.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

console.log('🔍 Validating Admin Dashboard Environment Configuration...\n');

const requiredVars = [
  {
    name: 'VITE_API_BASE_URL',
    description: 'Backend API base URL',
    example: 'http://localhost:8080/api/v1'
  }
];

const optionalVars = [
  {
    name: 'VITE_USE_API_KEY',
    description: 'Use API key authentication',
    example: 'false'
  },
  {
    name: 'VITE_API_KEY',
    description: 'API key for authentication',
    example: 'your-secure-api-key-here'
  }
];

let hasErrors = false;

// Check required variables
console.log('📋 Required Environment Variables:');
requiredVars.forEach(({ name, description, example }) => {
  const value = process.env[name];
  if (!value) {
    console.log(`❌ ${name}: ${description}`);
    console.log(`   Example: ${name}=${example}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${name}: ${value}`);
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(({ name, description, example }) => {
  const value = process.env[name];
  if (!value) {
    console.log(`⚪ ${name}: ${description} (not set)`);
    console.log(`   Example: ${name}=${example}`);
  } else {
    console.log(`✅ ${name}: ${value}`);
  }
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ Environment validation failed!');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env file in the admin-dashboard directory');
  console.log('2. Copy the contents from env.example');
  console.log('3. Set the required environment variables');
  console.log('4. Run this script again to validate');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed!');
  console.log('\n🚀 You can now start the admin dashboard with:');
  console.log('   npm run dev');
}

console.log('\n📚 For more information, see README.md');
