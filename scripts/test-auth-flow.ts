#!/usr/bin/env tsx
/**
 * Authentication Flow Test Script
 * 
 * This script tests the authentication flow by checking:
 * 1. Login endpoint availability
 * 2. Session endpoint availability
 * 3. Admin API route protection
 * 
 * Usage: tsx scripts/test-auth-flow.ts [baseUrl]
 * 
 * Example: tsx scripts/test-auth-flow.ts http://localhost:3000
 */

const baseUrl = process.argv[2] || process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
  details?: string;
}

async function testEndpoint(url: string, expectedStatus: number, requireAuth = false): Promise<TestResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    clearTimeout(timeout);
    
    if (response.status === expectedStatus) {
      return {
        name: url,
        status: '✅',
        message: `Returns ${response.status} as expected`,
      };
    } else if (requireAuth && response.status === 401) {
      return {
        name: url,
        status: '✅',
        message: `Returns 401 (protected - requires authentication)`,
      };
    } else {
      return {
        name: url,
        status: '⚠️',
        message: `Returns ${response.status} (expected ${expectedStatus})`,
        details: await response.text().catch(() => 'Could not read response'),
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        name: url,
        status: '❌',
        message: 'Request timed out after 5 seconds',
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
  console.log('🧪 Testing authentication flow...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  const tests: TestResult[] = [];
  
  // Test 1: Login page accessibility
  console.log('1. Testing login page...');
  const loginTest = await testEndpoint(`${baseUrl}/admin/login`, 200);
  tests.push(loginTest);
  console.log(`   ${loginTest.status} ${loginTest.message}`);
  
  // Test 2: Session endpoint (should work without auth for checking)
  console.log('\n2. Testing session endpoint...');
  const sessionTest = await testEndpoint(`${baseUrl}/api/auth/session`, 200);
  tests.push(sessionTest);
  console.log(`   ${sessionTest.status} ${sessionTest.message}`);
  
  // Test 3: Protected admin routes (should return 401)
  console.log('\n3. Testing protected admin routes...');
  const protectedRoutes = [
    '/api/admin/analytics',
    '/api/admin/recent',
    '/api/admin/web-vitals',
    '/api/admin/seo',
    '/api/admin/link-check',
    '/api/admin/system',
  ];
  
  for (const route of protectedRoutes) {
    const routeTest = await testEndpoint(`${baseUrl}${route}`, 401, true);
    tests.push(routeTest);
    console.log(`   ${routeTest.status} ${route} - ${routeTest.message}`);
  }
  
  // Test 4: Dashboard redirect (should redirect to login when not authenticated)
  console.log('\n4. Testing dashboard access...');
  try {
    const response = await fetch(`${baseUrl}/admin/dashboard`, {
      redirect: 'manual',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (response.status === 307 || response.status === 302 || response.status === 401) {
      tests.push({
        name: '/admin/dashboard',
        status: '✅',
        message: `Protected (returns ${response.status})`,
      });
      console.log(`   ✅ /admin/dashboard - Protected (returns ${response.status})`);
    } else {
      tests.push({
        name: '/admin/dashboard',
        status: '⚠️',
        message: `Returns ${response.status} (may not be properly protected)`,
      });
      console.log(`   ⚠️  /admin/dashboard - Returns ${response.status}`);
    }
  } catch (error) {
    tests.push({
      name: '/admin/dashboard',
      status: '❌',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log(`   ❌ /admin/dashboard - Error`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  
  const passed = tests.filter(t => t.status === '✅').length;
  const warnings = tests.filter(t => t.status === '⚠️').length;
  const failed = tests.filter(t => t.status === '❌').length;
  
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  if (warnings > 0) console.log(`⚠️  Warnings: ${warnings}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the results above.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Some tests have warnings. Review the results above.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

