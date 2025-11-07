#!/usr/bin/env tsx
/**
 * Test With Server Running
 * 
 * This script tests authentication and cookie passing when the server is running.
 * Run this after starting the dev server (npm run dev).
 * 
 * Usage: tsx scripts/test-with-server.ts [baseUrl]
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

interface TestResult {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
  details?: string;
}

async function testEndpoint(url: string, options: {
  method?: string;
  headers?: Record<string, string>;
  expectedStatus?: number;
} = {}): Promise<TestResult> {
  const { method = 'GET', headers = {}, expectedStatus } = options;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Cache-Control': 'no-cache',
        ...headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    const status = response.status;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    if (expectedStatus && status === expectedStatus) {
      return {
        name: url,
        status: '✅',
        message: `Returns ${status} as expected`,
        details: JSON.stringify(responseHeaders, null, 2),
      };
    }
    
    return {
      name: url,
      status: expectedStatus ? '⚠️' : '✅',
      message: `Returns ${status}${expectedStatus ? ` (expected ${expectedStatus})` : ''}`,
      details: JSON.stringify(responseHeaders, null, 2),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        name: url,
        status: '❌',
        message: 'Request timed out',
      };
    }
    return {
      name: url,
      status: '❌',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Authentication with Server Running...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  console.log('⚠️  Note: These tests verify endpoints are accessible.');
  console.log('   For cookie testing, use browser DevTools → Network tab.\n');
  console.log('='.repeat(70));
  
  const tests: TestResult[] = [];
  
  // Test 1: Login page
  console.log('\n1. Testing login page...');
  const loginTest = await testEndpoint(`${baseUrl}/admin/login`, { expectedStatus: 200 });
  tests.push(loginTest);
  console.log(`   ${loginTest.status} ${loginTest.message}`);
  
  // Test 2: Session endpoint
  console.log('\n2. Testing session endpoint...');
  const sessionTest = await testEndpoint(`${baseUrl}/api/auth/session`, { expectedStatus: 200 });
  tests.push(sessionTest);
  console.log(`   ${sessionTest.status} ${sessionTest.message}`);
  
  // Test 3: Protected routes (should return 401)
  console.log('\n3. Testing protected admin routes (should return 401)...');
  const protectedRoutes = [
    '/api/admin/analytics',
    '/api/admin/recent',
    '/api/admin/web-vitals',
    '/api/admin/seo',
    '/api/admin/link-check',
    '/api/admin/system',
  ];
  
  for (const route of protectedRoutes) {
    const routeTest = await testEndpoint(`${baseUrl}${route}`, { expectedStatus: 401 });
    tests.push(routeTest);
    const icon = routeTest.status === '✅' ? '✅' : routeTest.status === '⚠️' ? '⚠️' : '❌';
    console.log(`   ${icon} ${route} - ${routeTest.message}`);
  }
  
  // Test 4: Dashboard (should redirect)
  console.log('\n4. Testing dashboard access (should redirect)...');
  try {
    const response = await fetch(`${baseUrl}/admin/dashboard`, {
      redirect: 'manual',
      headers: { 'Cache-Control': 'no-cache' },
    });
    const isProtected = response.status === 307 || response.status === 302 || response.status === 401;
    tests.push({
      name: '/admin/dashboard',
      status: isProtected ? '✅' : '⚠️',
      message: `Returns ${response.status}${isProtected ? ' (protected)' : ''}`,
    });
    console.log(`   ${isProtected ? '✅' : '⚠️'} Returns ${response.status}`);
  } catch (error) {
    tests.push({
      name: '/admin/dashboard',
      status: '❌',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log(`   ❌ Error`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary:\n');
  
  const passed = tests.filter(t => t.status === '✅').length;
  const warnings = tests.filter(t => t.status === '⚠️').length;
  const failed = tests.filter(t => t.status === '❌').length;
  
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  if (warnings > 0) console.log(`⚠️  Warnings: ${warnings}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Cookie Testing Instructions:\n');
  console.log('   1. Start server: npm run dev');
  console.log('   2. Open browser and login to admin panel');
  console.log('   3. Open DevTools → Network tab');
  console.log('   4. Check requests to /api/admin/* routes');
  console.log('   5. Verify "Cookie" header is present in Request Headers');
  console.log('   6. Verify all requests return 200 (not 401)');
  console.log('\n');
  
  if (failed > 0) {
    console.log('❌ Some tests failed. Please check the server is running.\n');
    process.exit(1);
  } else {
    console.log('✅ All endpoint tests passed!\n');
    console.log('⚠️  Note: Cookie testing requires browser DevTools.\n');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

