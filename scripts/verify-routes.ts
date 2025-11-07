#!/usr/bin/env tsx
/**
 * Route Protection Verification Script
 * 
 * This script verifies that all admin API routes have authentication checks.
 * 
 * Usage: tsx scripts/verify-routes.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface RouteCheck {
  file: string;
  hasAuth: boolean;
  hasGetServerSession: boolean;
  hasAuthOptions: boolean;
  has401Check: boolean;
  status: '✅' | '❌' | '⚠️';
}

function findAdminRoutes(dir: string, baseDir: string = dir): RouteCheck[] {
  const results: RouteCheck[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/');
    
    if (entry.isDirectory()) {
      results.push(...findAdminRoutes(fullPath, baseDir));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const content = readFileSync(fullPath, 'utf-8');
      const check = verifyRoute(content, relativePath);
      results.push(check);
    }
  }
  
  return results;
}

function verifyRoute(content: string, filePath: string): RouteCheck {
  const hasGetServerSession = content.includes('getServerSession');
  const hasAuthOptions = content.includes('authOptions');
  const has401Check = content.includes('401') || content.includes('Unauthorized');
  const hasAuthImport = content.includes("from 'next-auth'") || content.includes('from "next-auth"');
  const hasAuthCheck = hasGetServerSession && hasAuthOptions && has401Check;
  
  // Check if it's a GET handler (most admin routes have GET)
  const hasGetHandler = content.includes('export async function GET');
  
  let status: '✅' | '❌' | '⚠️' = '✅';
  if (hasGetHandler && !hasAuthCheck) {
    status = '❌';
  } else if (hasGetHandler && hasAuthImport && !has401Check) {
    status = '⚠️';
  }
  
  return {
    file: filePath,
    hasAuth: hasAuthCheck,
    hasGetServerSession,
    hasAuthOptions,
    has401Check,
    status,
  };
}

function main() {
  console.log('🔍 Verifying admin API route protection...\n');
  
  const adminApiDir = join(process.cwd(), 'app', 'api', 'admin');
  
  if (!statSync(adminApiDir).isDirectory()) {
    console.log('❌ Admin API directory not found:', adminApiDir);
    process.exit(1);
  }
  
  const routes = findAdminRoutes(adminApiDir);
  
  if (routes.length === 0) {
    console.log('⚠️  No routes found in admin API directory');
    process.exit(0);
  }
  
  console.log(`Found ${routes.length} route(s):\n`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  for (const route of routes) {
    console.log(`${route.status} ${route.file}`);
    
    if (route.status === '❌') {
      hasErrors = true;
      console.log('   Missing authentication check!');
      if (!route.hasGetServerSession) console.log('   - Missing getServerSession import');
      if (!route.hasAuthOptions) console.log('   - Missing authOptions import');
      if (!route.has401Check) console.log('   - Missing 401 Unauthorized check');
    } else if (route.status === '⚠️') {
      hasWarnings = true;
      console.log('   Partial authentication (may need 401 check)');
    } else {
      console.log('   ✅ Protected');
    }
    console.log();
  }
  
  console.log('='.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ ERRORS: Some routes are not properly protected.');
    console.log('Please add authentication checks to unprotected routes.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS: Some routes may need authentication improvements.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All routes are properly protected!\n');
    process.exit(0);
  }
}

main();

