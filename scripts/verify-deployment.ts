#!/usr/bin/env tsx

/**
 * Vercel Deployment Verification Script
 * Run this before deploying to Vercel to catch common issues
 */

import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string, isWarning = false) {
  results.push({
    name,
    status: condition ? 'pass' : (isWarning ? 'warn' : 'fail'),
    message: condition ? passMsg : failMsg,
  });
}

console.log('🔍 Verifying Vercel Deployment Configuration...\n');

// Check 1: next.config.ts doesn't have standalone output
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
const hasStandaloneOutput = nextConfig.includes("output: 'standalone'") && !nextConfig.includes("// output: 'standalone'");
check(
  'Next.js Output Mode',
  !hasStandaloneOutput,
  '✓ Output mode is compatible with Vercel',
  '✗ Found "output: \'standalone\'" in next.config.ts - this breaks Vercel deployment'
);

// Check 2: vercel.json exists
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
const hasVercelJson = fs.existsSync(vercelJsonPath);
check(
  'Vercel Configuration',
  hasVercelJson,
  '✓ vercel.json exists',
  '✗ vercel.json not found'
);

// Check 3: .env.example exists (for reference)
const envExamplePath = path.join(process.cwd(), '.env.example');
const hasEnvExample = fs.existsSync(envExamplePath);
check(
  'Environment Variables Reference',
  hasEnvExample,
  '✓ .env.example exists for reference',
  '⚠ .env.example not found - create one for documentation',
  true
);

// Check 4: .env.local is gitignored
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  const hasEnvLocalIgnored = gitignore.includes('.env.local') || gitignore.includes('.env*.local');
  check(
    'Environment Security',
    hasEnvLocalIgnored,
    '✓ .env.local is gitignored',
    '✗ .env.local is NOT gitignored - this is a security risk!'
  );
}

// Check 5: Required dependencies
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const requiredDeps = ['next', 'react', 'react-dom', 'mongoose'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
check(
  'Required Dependencies',
  missingDeps.length === 0,
  '✓ All required dependencies are installed',
  `✗ Missing dependencies: ${missingDeps.join(', ')}`
);

// Check 6: Build script exists
const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
check(
  'Build Script',
  !!hasBuildScript,
  '✓ Build script exists',
  '✗ No build script found in package.json'
);

// Check 7: MongoDB connection file exists
const dbPath = path.join(process.cwd(), 'lib', 'db.ts');
const hasDbFile = fs.existsSync(dbPath);
check(
  'Database Configuration',
  hasDbFile,
  '✓ Database connection file exists',
  '✗ lib/db.ts not found'
);

// Check 8: Middleware configuration
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middleware = fs.readFileSync(middlewarePath, 'utf-8');
  const hasConfig = middleware.includes('export const config');
  check(
    'Middleware Configuration',
    hasConfig,
    '✓ Middleware has proper config export',
    '⚠ Middleware missing config export',
    true
  );
}

// Check 9: API routes exist
const apiPath = path.join(process.cwd(), 'app', 'api');
const hasApiRoutes = fs.existsSync(apiPath);
check(
  'API Routes',
  hasApiRoutes,
  '✓ API routes directory exists',
  '⚠ No API routes found',
  true
);

// Check 10: Public directory
const publicPath = path.join(process.cwd(), 'public');
const hasPublic = fs.existsSync(publicPath);
check(
  'Public Assets',
  hasPublic,
  '✓ Public directory exists',
  '⚠ No public directory found',
  true
);

// Print results
console.log('━'.repeat(60));
console.log('VERIFICATION RESULTS');
console.log('━'.repeat(60));

let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach(result => {
  const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌';
  console.log(`${icon} ${result.name}`);
  console.log(`   ${result.message}\n`);
  
  if (result.status === 'pass') passCount++;
  else if (result.status === 'fail') failCount++;
  else warnCount++;
});

console.log('━'.repeat(60));
console.log(`Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
console.log('━'.repeat(60));

if (failCount > 0) {
  console.log('\n❌ DEPLOYMENT BLOCKED - Fix the issues above before deploying\n');
  process.exit(1);
} else if (warnCount > 0) {
  console.log('\n⚠️  WARNINGS DETECTED - Review before deploying\n');
  console.log('📋 Next Steps:');
  console.log('1. Configure environment variables in Vercel dashboard');
  console.log('2. Review VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions');
  console.log('3. Test build locally: npm run build');
  console.log('4. Deploy: git push or vercel --prod\n');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED - Ready to deploy!\n');
  console.log('📋 Next Steps:');
  console.log('1. Configure environment variables in Vercel dashboard');
  console.log('2. Review VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions');
  console.log('3. Test build locally: npm run build');
  console.log('4. Deploy: git push or vercel --prod\n');
  process.exit(0);
}
