#!/usr/bin/env tsx
/**
 * Local Development Check
 * 
 * Verifies that local development environment is set up correctly.
 * 
 * Usage: tsx scripts/check-local-dev.ts
 */

import { existsSync } from 'fs';

console.log('🔍 Checking local development environment...\n');

const checks: Array<{ name: string; check: () => boolean; message: string }> = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return major >= 18;
    },
    message: `Node.js ${process.version} (requires 18+)`,
  },
  {
    name: 'package.json exists',
    check: () => existsSync('package.json'),
    message: 'package.json found',
  },
  {
    name: 'node_modules exists',
    check: () => existsSync('node_modules'),
    message: 'Dependencies installed',
  },
  {
    name: '.env.local exists',
    check: () => existsSync('.env.local'),
    message: '.env.local file found',
  },
  {
    name: 'lib/admin/fetch-with-auth.ts exists',
    check: () => existsSync('lib/admin/fetch-with-auth.ts'),
    message: 'Cookie passing utility exists',
  },
  {
    name: 'next.config.ts exists',
    check: () => existsSync('next.config.ts'),
    message: 'Next.js config found',
  },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  const result = check.check();
  if (result) {
    console.log(`✅ ${check.name}: ${check.message}`);
    passed++;
  } else {
    console.log(`❌ ${check.name}: ${check.message}`);
    failed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Results: ${passed}/${checks.length} checks passed\n`);

if (failed > 0) {
  console.log('⚠️  Some checks failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ All local development checks passed!\n');
  console.log('💡 To start development server, run: npm run dev\n');
  process.exit(0);
}

