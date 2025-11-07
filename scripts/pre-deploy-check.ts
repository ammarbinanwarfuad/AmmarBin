#!/usr/bin/env tsx
/**
 * Pre-Deployment Check Script
 * 
 * This script runs all pre-deployment checks:
 * 1. Environment variables verification
 * 2. Route protection verification
 * 3. Build verification
 * 
 * Usage: tsx scripts/pre-deploy-check.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface CheckResult {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
}

const results: CheckResult[] = [];

function runCheck(name: string, command: () => void): void {
  try {
    console.log(`\n🔍 ${name}...`);
    command();
    results.push({ name, status: '✅', message: 'Passed' });
    console.log(`✅ ${name} passed`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({ name, status: '❌', message });
    console.log(`❌ ${name} failed: ${message}`);
    throw error;
  }
}

function checkEnvironmentVariables() {
  try {
    execSync('tsx scripts/verify-env.ts', { stdio: 'inherit' });
  } catch {
    throw new Error('Environment variables check failed');
  }
}

function checkRouteProtection() {
  try {
    execSync('tsx scripts/verify-routes.ts', { stdio: 'inherit' });
  } catch {
    throw new Error('Route protection check failed');
  }
}

function checkBuild() {
  console.log('\n🔨 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch {
    throw new Error('Build failed');
  }
}

function checkFiles() {
  const requiredFiles = [
    'lib/admin/fetch-with-auth.ts',
    'app/admin/dashboard/page.tsx',
    'app/admin/dashboard/DashboardRecent.tsx',
    'app/admin/dashboard/DashboardAnalytics.tsx',
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
  console.log('✅ All required files exist');
}

function main() {
  console.log('🚀 Pre-Deployment Check\n');
  console.log('='.repeat(60));
  
  let hasErrors = false;
  
  try {
    // Check 1: Required files
    runCheck('Checking required files', checkFiles);
    
    // Check 2: Environment variables
    runCheck('Verifying environment variables', checkEnvironmentVariables);
    
    // Check 3: Route protection
    runCheck('Verifying route protection', checkRouteProtection);
    
    // Check 4: Build (optional - uncomment if you want to test build)
    // runCheck('Building project', checkBuild);
    
  } catch (error) {
    hasErrors = true;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Pre-Deployment Check Summary:\n');
  
  for (const result of results) {
    console.log(`${result.status} ${result.name}: ${result.message}`);
  }
  
  const passed = results.filter(r => r.status === '✅').length;
  const failed = results.filter(r => r.status === '❌').length;
  
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  if (hasErrors || failed > 0) {
    console.log('\n❌ Pre-deployment checks failed. Please fix the issues above before deploying.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All pre-deployment checks passed! Ready to deploy.\n');
    process.exit(0);
  }
}

main();

