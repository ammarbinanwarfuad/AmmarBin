#!/usr/bin/env tsx
/**
 * Generate Test Report
 * 
 * This script generates a comprehensive test report based on:
 * 1. Code verification results
 * 2. Route protection status
 * 3. File existence checks
 * 
 * Usage: tsx scripts/generate-test-report.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface TaskStatus {
  id: string;
  status: 'completed' | 'pending' | 'verified' | 'manual';
  note?: string;
}

const taskStatuses: TaskStatus[] = [];

function checkTask(id: string, condition: () => boolean, note?: string): void {
  const status = condition() ? 'completed' : 'pending';
  taskStatuses.push({ id, status, note });
}

// Task 1.1-1.3: Cookie passing implementation
function verifyCookiePassing() {
  console.log('Verifying cookie passing implementation...');
  
  const files = [
    'lib/admin/fetch-with-auth.ts',
    'app/admin/dashboard/page.tsx',
    'app/admin/dashboard/DashboardRecent.tsx',
    'app/admin/dashboard/DashboardAnalytics.tsx',
  ];
  
  for (const file of files) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      const hasCookiePassing = content.includes('headers()') && 
                               (content.includes('Cookie') || content.includes('fetch-with-auth'));
      checkTask(`cookie-passing-${file}`, () => hasCookiePassing);
    }
  }
}

// Task 2.1-2.5: Route protection
function verifyRouteProtection() {
  console.log('Verifying route protection...');
  
  try {
    const output = execSync('tsx scripts/verify-routes.ts', { encoding: 'utf-8', stdio: 'pipe' });
    const allProtected = output.includes('All routes are properly protected');
    checkTask('route-protection-all', () => allProtected, 'Verified via npm run verify:routes');
  } catch {
    checkTask('route-protection-all', () => false, 'Could not verify');
  }
}

// Task 5.1-5.3: Code quality
function verifyCodeQuality() {
  console.log('Verifying code quality...');
  
  // Check if shared utility exists
  checkTask('shared-utility', () => existsSync('lib/admin/fetch-with-auth.ts'));
  
  // Check if error handling is improved
  const apiRoutes = [
    'app/api/admin/analytics/route.ts',
    'app/api/admin/recent/route.ts',
    'app/api/admin/seo/route.ts',
  ];
  
  for (const file of apiRoutes) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      const hasErrorHandling = content.includes('console.error') && content.includes('[Admin API]');
      checkTask(`error-handling-${file}`, () => hasErrorHandling);
    }
  }
}

// Task 7.1: Documentation
function verifyDocumentation() {
  console.log('Verifying documentation...');
  
  const docs = [
    'README.md',
    'TESTING_GUIDE.md',
    'DEPLOYMENT_CHECKLIST.md',
    'lib/admin/fetch-with-auth.ts', // Has code comments
  ];
  
  for (const doc of docs) {
    checkTask(`doc-${doc}`, () => existsSync(doc));
  }
}

function generateReport() {
  console.log('\n📊 Generating Test Report...\n');
  
  verifyCookiePassing();
  verifyRouteProtection();
  verifyCodeQuality();
  verifyDocumentation();
  
  const completed = taskStatuses.filter(t => t.status === 'completed' || t.status === 'verified').length;
  const total = taskStatuses.length;
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Completed Tasks:');
  for (const task of taskStatuses.filter(t => t.status === 'completed' || t.status === 'verified')) {
    console.log(`  ✅ ${task.id}${task.note ? ` - ${task.note}` : ''}`);
  }
  
  console.log('\n⏳ Pending Tasks:');
  const pending = taskStatuses.filter(t => t.status === 'pending');
  if (pending.length === 0) {
    console.log('  (None - all automated tasks complete!)');
  } else {
    for (const task of pending) {
      console.log(`  ⏳ ${task.id}${task.note ? ` - ${task.note}` : ''}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📈 Progress: ${completed}/${total} (${((completed/total)*100).toFixed(1)}%)`);
  console.log('\n💡 Note: Remaining tasks require manual testing or deployment.');
  console.log('   See TESTING_GUIDE.md and DEPLOYMENT_CHECKLIST.md for details.\n');
}

generateReport();

