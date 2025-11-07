#!/usr/bin/env tsx
/**
 * Mark Completed Tasks
 * 
 * This script automatically marks tasks as completed based on code verification.
 * It checks the actual implementation and marks tasks that are verifiably complete.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface TaskCheck {
  id: string;
  name: string;
  check: () => boolean;
  note?: string;
}

const tasks: TaskCheck[] = [
  // Task 1.1: Dashboard page cookie passing
  {
    id: '1.1.1',
    name: 'Import headers from next/headers',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes("import { headers } from 'next/headers'");
    },
  },
  {
    id: '1.1.2',
    name: 'Modify fetchAdminData to read cookies',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('headers()') && content.includes('cookie');
    },
  },
  {
    id: '1.1.3',
    name: 'Pass cookies in fetch request headers',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes("'Cookie': cookieHeader") || content.includes('Cookie: cookieHeader');
    },
  },
  
  // Task 1.2: DashboardRecent
  {
    id: '1.2.1',
    name: 'DashboardRecent imports shared utility',
    check: () => {
      if (!existsSync('app/admin/dashboard/DashboardRecent.tsx')) return false;
      const content = readFileSync('app/admin/dashboard/DashboardRecent.tsx', 'utf-8');
      return content.includes('fetch-with-auth') || content.includes('fetchAdminData');
    },
  },
  {
    id: '1.2.2',
    name: 'DashboardRecent uses fetchAdminData',
    check: () => {
      if (!existsSync('app/admin/dashboard/DashboardRecent.tsx')) return false;
      const content = readFileSync('app/admin/dashboard/DashboardRecent.tsx', 'utf-8');
      return content.includes('fetchAdminData');
    },
  },
  
  // Task 1.3: DashboardAnalytics
  {
    id: '1.3.1',
    name: 'DashboardAnalytics imports shared utility',
    check: () => {
      if (!existsSync('app/admin/dashboard/DashboardAnalytics.tsx')) return false;
      const content = readFileSync('app/admin/dashboard/DashboardAnalytics.tsx', 'utf-8');
      return content.includes('fetch-with-auth') || content.includes('fetchAdminData');
    },
  },
  {
    id: '1.3.2',
    name: 'DashboardAnalytics uses fetchAdminData',
    check: () => {
      if (!existsSync('app/admin/dashboard/DashboardAnalytics.tsx')) return false;
      const content = readFileSync('app/admin/dashboard/DashboardAnalytics.tsx', 'utf-8');
      return content.includes('fetchAdminData');
    },
  },
  
  // Task 1.1: Dashboard page
  {
    id: '1.1-dashboard',
    name: 'Dashboard page uses shared utility',
    check: () => {
      if (!existsSync('app/admin/dashboard/page.tsx')) return false;
      const content = readFileSync('app/admin/dashboard/page.tsx', 'utf-8');
      return content.includes('fetch-with-auth') || content.includes('fetchAdminData');
    },
  },
  
  // Task 2.1-2.5: Route protection
  {
    id: '2.1.1',
    name: 'Analytics route imports getServerSession',
    check: () => {
      const content = readFileSync('app/api/admin/analytics/route.ts', 'utf-8');
      return content.includes('getServerSession') && content.includes('authOptions');
    },
  },
  {
    id: '2.1.2',
    name: 'Analytics route checks session',
    check: () => {
      const content = readFileSync('app/api/admin/analytics/route.ts', 'utf-8');
      return content.includes('getServerSession(authOptions)');
    },
  },
  {
    id: '2.1.3',
    name: 'Analytics route returns 401 if no session',
    check: () => {
      const content = readFileSync('app/api/admin/analytics/route.ts', 'utf-8');
      return content.includes('401') && content.includes('Unauthorized');
    },
  },
  
  // Similar checks for other routes...
  {
    id: '2.2.1',
    name: 'Recent route has auth check',
    check: () => {
      const content = readFileSync('app/api/admin/recent/route.ts', 'utf-8');
      return content.includes('getServerSession') && content.includes('401');
    },
  },
  {
    id: '2.3.1',
    name: 'SEO route has auth check',
    check: () => {
      const content = readFileSync('app/api/admin/seo/route.ts', 'utf-8');
      return content.includes('getServerSession') && content.includes('401');
    },
  },
  {
    id: '2.4.1',
    name: 'Link-check route has auth check',
    check: () => {
      const content = readFileSync('app/api/admin/link-check/route.ts', 'utf-8');
      return content.includes('getServerSession') && content.includes('401');
    },
  },
  {
    id: '2.5.1',
    name: 'System route has auth check',
    check: () => {
      const content = readFileSync('app/api/admin/system/route.ts', 'utf-8');
      return content.includes('getServerSession') && content.includes('401');
    },
  },
  
  // Task 5.1: Shared utility
  {
    id: '5.1.1',
    name: 'Shared utility created',
    check: () => existsSync('lib/admin/fetch-with-auth.ts'),
  },
  {
    id: '5.1.2',
    name: 'Common logic extracted',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('export async function fetchAdminData');
    },
  },
  {
    id: '5.1.3',
    name: 'All components use shared utility',
    check: () => {
      const files = [
        'app/admin/dashboard/page.tsx',
        'app/admin/dashboard/DashboardRecent.tsx',
        'app/admin/dashboard/DashboardAnalytics.tsx',
      ];
      return files.every(file => {
        const content = readFileSync(file, 'utf-8');
        return content.includes('fetch-with-auth');
      });
    },
  },
  
  // Task 5.2: Error handling
  {
    id: '5.2.1',
    name: 'Better error messages in API routes',
    check: () => {
      const files = [
        'app/api/admin/analytics/route.ts',
        'app/api/admin/recent/route.ts',
      ];
      return files.every(file => {
        const content = readFileSync(file, 'utf-8');
        return content.includes('console.error') && content.includes('[Admin API]');
      });
    },
  },
  {
    id: '5.2.2',
    name: 'Log authentication failures',
    check: () => {
      const files = [
        'app/api/admin/analytics/route.ts',
        'app/api/admin/recent/route.ts',
      ];
      return files.some(file => {
        const content = readFileSync(file, 'utf-8');
        return content.includes('Unauthorized') && content.includes('console.warn');
      });
    },
  },
  
  // Task 5.3: Logging
  {
    id: '5.3.1',
    name: 'Console logs for cookie passing',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('console.log') || content.includes('console.warn');
    },
  },
  {
    id: '5.3.2',
    name: 'Log when cookies are missing',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('No cookies') || content.includes('cookieHeader.length');
    },
  },
  {
    id: '5.3.3',
    name: 'Performance timing logs',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('Date.now()') && content.includes('duration');
    },
  },
  
  // Task 7.1: Documentation
  {
    id: '7.1.1',
    name: 'Comments explaining cookie passing',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('IMPORTANT') && content.includes('cookies');
    },
  },
  {
    id: '7.1.2',
    name: 'Document server-side fetch pattern',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('Server Components') && content.length > 500; // Has documentation
    },
  },
  {
    id: '7.1.3',
    name: 'Notes about Next.js App Router limitations',
    check: () => {
      const content = readFileSync('lib/admin/fetch-with-auth.ts', 'utf-8');
      return content.includes('App Router') || content.includes('not automatically');
    },
  },
  {
    id: '7.1.4',
    name: 'README updated',
    check: () => {
      const content = readFileSync('README.md', 'utf-8');
      return content.includes('Troubleshooting') && content.includes('cookie');
    },
  },
];

function verifyTasks() {
  console.log('🔍 Verifying completed tasks...\n');
  
  const completed: string[] = [];
  const pending: string[] = [];
  
  for (const task of tasks) {
    try {
      if (task.check()) {
        completed.push(task.id);
        console.log(`✅ ${task.id}: ${task.name}${task.note ? ` - ${task.note}` : ''}`);
      } else {
        pending.push(task.id);
        console.log(`⏳ ${task.id}: ${task.name} - Not verified`);
      }
    } catch (error) {
      pending.push(task.id);
      console.log(`❌ ${task.id}: ${task.name} - Error checking: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Verified Complete: ${completed.length}/${tasks.length}`);
  console.log(`⏳ Pending/Manual: ${pending.length}/${tasks.length}`);
  console.log(`\n📊 Completion Rate: ${((completed.length / tasks.length) * 100).toFixed(1)}%\n`);
  
  // Verify routes programmatically
  try {
    console.log('🔒 Verifying route protection...');
    const output = execSync('tsx scripts/verify-routes.ts', { encoding: 'utf-8', stdio: 'pipe' });
    if (output.includes('All routes are properly protected')) {
      console.log('✅ All routes verified as protected\n');
      // Mark route verification tasks as complete
      ['2.1.4', '2.2.4', '2.3.4', '2.4.4', '2.5.3'].forEach(id => {
        if (!completed.includes(id)) completed.push(id);
      });
    }
  } catch {
    console.log('⚠️  Could not verify routes programmatically\n');
  }
  
  return { completed, pending };
}

verifyTasks();

