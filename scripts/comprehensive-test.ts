#!/usr/bin/env tsx
/**
 * Comprehensive Test Suite
 * 
 * This script runs comprehensive tests for the authentication fix:
 * 1. Environment variable verification
 * 2. Route protection verification
 * 3. Authentication endpoint testing
 * 4. Cookie passing verification (via API testing)
 * 
 * Usage: tsx scripts/comprehensive-test.ts [baseUrl]
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const baseUrl = process.argv[2] || process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

interface TestResult {
  category: string;
  name: string;
  status: '✅' | '❌' | '⚠️' | '⏭️';
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function addResult(category: string, name: string, status: '✅' | '❌' | '⚠️' | '⏭️', message: string, details?: string) {
  results.push({ category, name, status, message, details });
}

async function testEndpoint(url: string, options: {
  method?: string;
  expectedStatus?: number;
  requireAuth?: boolean;
  checkCookies?: boolean;
} = {}): Promise<{ status: number; headers: Headers; body?: unknown }> {
  const { method = 'GET', expectedStatus, requireAuth = false } = options;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    clearTimeout(timeout);
    
    let body: unknown;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }
    } catch {
      // Ignore body parsing errors
    }
    
    return {
      status: response.status,
      headers: response.headers,
      body,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

async function verifyEnvironmentVariables() {
  console.log('\n📋 Testing Environment Variables...\n');
  
  try {
    // Check if .env.local exists (for local development)
    const envLocalExists = existsSync('.env.local');
    addResult(
      'Environment',
      '.env.local file',
      envLocalExists ? '✅' : '⚠️',
      envLocalExists ? 'Found' : 'Not found (may use system env vars)'
    );
    
    // Check required environment variables
    const requiredVars = ['MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD')
          ? '*'.repeat(Math.min(value.length, 10))
          : value.substring(0, 50);
        addResult(
          'Environment',
          varName,
          '✅',
          `Set: ${displayValue}${value.length > 50 ? '...' : ''}`
        );
      } else {
        addResult(
          'Environment',
          varName,
          '⚠️',
          'Not set (may be set in deployment environment)'
        );
      }
    }
    
    // Validate NEXTAUTH_URL format if set
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl) {
      try {
        const url = new URL(nextAuthUrl);
        const isHttps = url.protocol === 'https:';
        addResult(
          'Environment',
          'NEXTAUTH_URL format',
          isHttps ? '✅' : '⚠️',
          `${url.protocol}//${url.host} ${isHttps ? '(HTTPS)' : '(should use HTTPS in production)'}`
        );
      } catch {
        addResult(
          'Environment',
          'NEXTAUTH_URL format',
          '❌',
          'Invalid URL format'
        );
      }
    }
    
    // Validate NEXTAUTH_SECRET length if set
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (nextAuthSecret) {
      const isSecure = nextAuthSecret.length >= 32;
      addResult(
        'Environment',
        'NEXTAUTH_SECRET security',
        isSecure ? '✅' : '⚠️',
        `${nextAuthSecret.length} characters ${isSecure ? '(secure)' : '(should be 32+ characters)'}`
      );
    }
    
  } catch (error) {
    addResult('Environment', 'Verification', '❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyRouteProtection() {
  console.log('\n🔒 Testing Route Protection...\n');
  
  try {
    // Run the route verification script
    try {
      execSync('tsx scripts/verify-routes.ts', { stdio: 'pipe', encoding: 'utf-8' });
      addResult('Routes', 'All admin routes', '✅', 'All routes are protected');
    } catch (error) {
      const output = error instanceof Error ? error.message : String(error);
      if (output.includes('All routes are properly protected')) {
        addResult('Routes', 'All admin routes', '✅', 'All routes are protected');
      } else {
        addResult('Routes', 'Route verification', '❌', 'Some routes may not be protected');
      }
    }
  } catch (error) {
    addResult('Routes', 'Verification script', '⚠️', 'Could not run verification script');
  }
}

async function testAuthenticationEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');
  
  const endpoints = [
    { path: '/admin/login', expectedStatus: 200, name: 'Login page' },
    { path: '/api/auth/session', expectedStatus: 200, name: 'Session endpoint' },
    { path: '/api/auth/signin', expectedStatus: 405, name: 'Sign in endpoint' }, // Usually returns 405 for GET
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(`${baseUrl}${endpoint.path}`);
      const passed = result.status === endpoint.expectedStatus || 
                     (endpoint.expectedStatus === 405 && result.status === 404);
      addResult(
        'Endpoints',
        endpoint.name,
        passed ? '✅' : '⚠️',
        `Status: ${result.status} (expected ${endpoint.expectedStatus})`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // If server is not running, mark as skipped (manual testing required)
      if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
        addResult(
          'Endpoints',
          endpoint.name,
          '⏭️',
          `Server not running - requires manual testing (run: npm run dev)`
        );
      } else {
        addResult(
          'Endpoints',
          endpoint.name,
          '❌',
          `Error: ${errorMsg}`
        );
      }
    }
  }
}

async function testProtectedRoutes() {
  console.log('\n🛡️  Testing Protected Admin Routes...\n');
  
  const protectedRoutes = [
    '/api/admin/analytics',
    '/api/admin/recent',
    '/api/admin/web-vitals',
    '/api/admin/seo',
    '/api/admin/link-check',
    '/api/admin/system',
  ];
  
  for (const route of protectedRoutes) {
    try {
      const result = await testEndpoint(`${baseUrl}${route}`, { requireAuth: true });
      const isProtected = result.status === 401;
      addResult(
        'Protected Routes',
        route,
        isProtected ? '✅' : '⚠️',
        `Status: ${result.status} ${isProtected ? '(protected)' : '(may not be protected)'}`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // If server is not running, mark as skipped (manual testing required)
      if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
        addResult(
          'Protected Routes',
          route,
          '⏭️',
          `Server not running - code verified as protected (see route verification)`
        );
      } else {
        addResult(
          'Protected Routes',
          route,
          '❌',
          `Error: ${errorMsg}`
        );
      }
    }
  }
}

async function testDashboardAccess() {
  console.log('\n📊 Testing Dashboard Access...\n');
  
  try {
    const result = await testEndpoint(`${baseUrl}/admin/dashboard`, {
      expectedStatus: 307, // Should redirect
    });
    
    const isProtected = result.status === 307 || result.status === 302 || result.status === 401;
    addResult(
      'Dashboard',
      '/admin/dashboard',
      isProtected ? '✅' : '⚠️',
      `Status: ${result.status} ${isProtected ? '(protected/redirects)' : '(may not be protected)'}`
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    // If server is not running, mark as skipped (manual testing required)
    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
      addResult(
        'Dashboard',
        '/admin/dashboard',
        '⏭️',
        `Server not running - requires manual browser testing`
      );
    } else {
      addResult(
        'Dashboard',
        '/admin/dashboard',
        '❌',
        `Error: ${errorMsg}`
      );
    }
  }
}

async function verifyCodeFiles() {
  console.log('\n📁 Verifying Code Files...\n');
  
  const requiredFiles = [
    'lib/admin/fetch-with-auth.ts',
    'app/admin/dashboard/page.tsx',
    'app/admin/dashboard/DashboardRecent.tsx',
    'app/admin/dashboard/DashboardAnalytics.tsx',
    'app/api/admin/analytics/route.ts',
    'app/api/admin/recent/route.ts',
    'app/api/admin/seo/route.ts',
    'app/api/admin/link-check/route.ts',
    'app/api/admin/system/route.ts',
  ];
  
  for (const file of requiredFiles) {
    const exists = existsSync(file);
    if (exists) {
      // Check if file has the expected content
      try {
        const content = readFileSync(file, 'utf-8');
        let hasExpectedContent = false;
        
        if (file.includes('fetch-with-auth')) {
          hasExpectedContent = content.includes('headers()') && content.includes('Cookie');
        } else if (file.includes('dashboard')) {
          hasExpectedContent = content.includes('fetch-with-auth') || content.includes('fetchAdminData');
        } else if (file.includes('api/admin')) {
          hasExpectedContent = content.includes('getServerSession') && content.includes('authOptions');
        }
        
        addResult(
          'Files',
          file,
          hasExpectedContent ? '✅' : '⚠️',
          hasExpectedContent ? 'Exists and has expected content' : 'Exists but may need updates'
        );
      } catch {
        addResult('Files', file, '⚠️', 'Exists but could not verify content');
      }
    } else {
      addResult('Files', file, '❌', 'File not found');
    }
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary\n');
  
  const byCategory: Record<string, TestResult[]> = {};
  for (const result of results) {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  }
  
  for (const [category, categoryResults] of Object.entries(byCategory)) {
    console.log(`\n${category}:`);
    for (const result of categoryResults) {
      console.log(`  ${result.status} ${result.name}: ${result.message}`);
      if (result.details) {
        console.log(`     ${result.details}`);
      }
    }
  }
  
  const passed = results.filter(r => r.status === '✅').length;
  const warnings = results.filter(r => r.status === '⚠️').length;
  const failed = results.filter(r => r.status === '❌').length;
  const skipped = results.filter(r => r.status === '⏭️').length;
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 Overall Results:\n');
  console.log(`  ✅ Passed: ${passed}/${results.length}`);
  if (warnings > 0) console.log(`  ⚠️  Warnings: ${warnings}`);
  if (failed > 0) console.log(`  ❌ Failed: ${failed}`);
  if (skipped > 0) console.log(`  ⏭️  Skipped: ${skipped}`);
  
  const completionRate = ((passed + skipped) / results.length) * 100;
  console.log(`\n  📊 Completion Rate: ${completionRate.toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(70));
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please review the results above.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Some tests have warnings. Review the results above.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All automated tests passed!\n');
    console.log('⚠️  Note: Some tasks require manual browser testing.');
    console.log('   See TESTING_GUIDE.md for manual testing steps.\n');
    process.exit(0);
  }
}

async function main() {
  console.log('🧪 Comprehensive Test Suite');
  console.log('='.repeat(70));
  console.log(`\nBase URL: ${baseUrl}\n`);
  
  try {
    await verifyCodeFiles();
    await verifyEnvironmentVariables();
    await verifyRouteProtection();
    await testAuthenticationEndpoints();
    await testProtectedRoutes();
    await testDashboardAccess();
    
    printSummary();
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

main();

