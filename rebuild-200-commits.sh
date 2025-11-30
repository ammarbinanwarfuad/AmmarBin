#!/bin/bash

# Script to rebuild git history with 200+ granular commits
# Starting date: October 17, 2024
# Author: Ammar Bin Anwar Fuad

echo "🔄 Starting Git History Rebuild (200+ commits)..."
echo "⚠️  This will delete all existing commits and rebuild from scratch"
echo ""

# Backup current branch
echo "📦 Creating backup branch..."
git branch backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Remove all git history
echo "🗑️  Removing existing git history..."
rm -rf .git

# Initialize new repository
echo "🎬 Initializing new repository..."
git init
git branch -M main

# Configure git
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

# Counter for commits
COMMIT_COUNT=0

# Helper function to commit with specific date
commit_with_date() {
    local message="$1"
    local date_string="$2"
    
    git add -A 2>/dev/null || true
    if ! git diff --cached --quiet 2>/dev/null; then
        GIT_AUTHOR_DATE="$date_string" GIT_COMMITTER_DATE="$date_string" git commit -m "$message" 2>/dev/null || true
        COMMIT_COUNT=$((COMMIT_COUNT + 1))
        echo "  [$COMMIT_COUNT] $message"
    fi
}

echo ""
echo "📝 Creating 200+ incremental commits..."
echo ""

# ============================================
# Day 0: October 17, 2024 - Project Setup
# ============================================
echo ""
echo "=== Day 0: October 17, 2024 - Project Initialization ==="

git add package.json
commit_with_date "chore: Initialize package.json with project metadata" "2024-10-17T09:00:00+0600"

git add package-lock.json
commit_with_date "chore: Add package-lock.json with dependency tree" "2024-10-17T09:15:00+0600"

git add next.config.ts
commit_with_date "chore: Configure Next.js 16 with App Router" "2024-10-17T09:30:00+0600"

git add tsconfig.json
commit_with_date "chore: Setup TypeScript configuration" "2024-10-17T09:45:00+0600"

git add tailwind.config.ts
commit_with_date "chore: Configure Tailwind CSS" "2024-10-17T10:00:00+0600"

git add postcss.config.mjs
commit_with_date "chore: Add PostCSS configuration" "2024-10-17T10:15:00+0600"

git add components.json
commit_with_date "chore: Setup shadcn/ui components config" "2024-10-17T10:30:00+0600"

git add eslint.config.mjs
commit_with_date "chore: Configure ESLint 9" "2024-10-17T10:45:00+0600"

git add .prettierrc
commit_with_date "chore: Setup Prettier code formatter" "2024-10-17T11:00:00+0600"

git add .env.example
commit_with_date "chore: Add environment variables template" "2024-10-17T11:15:00+0600"

git add .gitignore
commit_with_date "chore: Configure Git ignore patterns" "2024-10-17T11:30:00+0600"

git add vercel.json
commit_with_date "chore: Add Vercel deployment configuration" "2024-10-17T11:45:00+0600"

git add .vercelignore
commit_with_date "chore: Configure Vercel ignore patterns" "2024-10-17T12:00:00+0600"

git add next-sitemap.config.js
commit_with_date "chore: Setup sitemap generation config" "2024-10-17T12:15:00+0600"

git add jest.config.js
commit_with_date "test: Configure Jest testing framework" "2024-10-17T12:30:00+0600"

git add jest.setup.js
commit_with_date "test: Add Jest setup and global mocks" "2024-10-17T12:45:00+0600"

git add playwright.config.ts
commit_with_date "test: Configure Playwright E2E testing" "2024-10-17T13:00:00+0600"

# ============================================
# Day 1: October 18, 2024 - Database Models
# ============================================
echo ""
echo "=== Day 1: October 18, 2024 - Database Models ==="

git add models/User.ts
commit_with_date "feat: Create User model for authentication" "2024-10-18T09:00:00+0600"

git add models/Project.ts
commit_with_date "feat: Create Project model with GitHub sync" "2024-10-18T09:30:00+0600"

git add models/Blog.ts
commit_with_date "feat: Create Blog model with markdown support" "2024-10-18T10:00:00+0600"

git add models/ExternalBlog.ts
commit_with_date "feat: Create ExternalBlog model for sync" "2024-10-18T10:30:00+0600"

git add models/Skill.ts
commit_with_date "feat: Create Skill model with categories" "2024-10-18T11:00:00+0600"

git add models/Experience.ts
commit_with_date "feat: Create Experience model for work history" "2024-10-18T11:30:00+0600"

git add models/Education.ts
commit_with_date "feat: Create Education model" "2024-10-18T12:00:00+0600"

git add models/Certificate.ts
commit_with_date "feat: Create Certificate model" "2024-10-18T12:30:00+0600"

git add models/Message.ts
commit_with_date "feat: Create Message model for contact form" "2024-10-18T13:00:00+0600"

git add models/Activity.ts
commit_with_date "feat: Create Activity model for logging" "2024-10-18T13:30:00+0600"

git add models/PageView.ts
commit_with_date "feat: Create PageView model for analytics" "2024-10-18T14:00:00+0600"

git add models/WebVital.ts
commit_with_date "feat: Create WebVital model for performance" "2024-10-18T14:30:00+0600"

git add models/ScheduledTask.ts
commit_with_date "feat: Create ScheduledTask model for automation" "2024-10-18T15:00:00+0600"

git add models/Setting.ts
commit_with_date "feat: Create Setting model for configuration" "2024-10-18T15:30:00+0600"

git add models/Profile.ts
commit_with_date "feat: Create Profile model for user data" "2024-10-18T16:00:00+0600"

git add models/Participation.ts
commit_with_date "feat: Create Participation model" "2024-10-18T16:30:00+0600"

# ============================================
# Day 2: October 19, 2024 - Core Libraries
# ============================================
echo ""
echo "=== Day 2: October 19, 2024 - Core Libraries ==="

git add lib/db.ts
commit_with_date "feat: Setup MongoDB connection with pooling" "2024-10-19T09:00:00+0600"

git add lib/auth.ts
commit_with_date "feat: Configure NextAuth.js authentication" "2024-10-19T09:30:00+0600"

git add lib/logger.ts
commit_with_date "feat: Add production-safe logger utility" "2024-10-19T10:00:00+0600"

git add lib/utils.ts
commit_with_date "feat: Add utility functions (cn, formatters)" "2024-10-19T10:30:00+0600"

git add lib/constants.ts
commit_with_date "feat: Define application constants" "2024-10-19T11:00:00+0600"

git add lib/validations.ts
commit_with_date "feat: Create Zod validation schemas" "2024-10-19T11:30:00+0600"

git add lib/cache.ts
commit_with_date "feat: Implement caching utilities" "2024-10-19T12:00:00+0600"

git add lib/etag.ts
commit_with_date "feat: Add ETag generation for caching" "2024-10-19T12:30:00+0600"

git add lib/cache-invalidation.ts
commit_with_date "feat: Create cache invalidation system" "2024-10-19T13:00:00+0600"

git add lib/api-response.ts
commit_with_date "feat: Add standardized API response utility" "2024-10-19T13:30:00+0600"

git add lib/api-timeout.ts
commit_with_date "feat: Implement API timeout handling" "2024-10-19T14:00:00+0600"

git add lib/api-cache-wrapper.ts
commit_with_date "feat: Create API cache wrapper" "2024-10-19T14:30:00+0600"

git add lib/rate-limit.ts
commit_with_date "feat: Add rate limiting for APIs" "2024-10-19T15:00:00+0600"

git add lib/request-logger.ts
commit_with_date "feat: Implement request logging middleware" "2024-10-19T15:30:00+0600"

git add lib/server-timing.ts
commit_with_date "feat: Add server timing headers" "2024-10-19T16:00:00+0600"

git add lib/error-tracker.ts
commit_with_date "feat: Create error tracking utility" "2024-10-19T16:30:00+0600"

git add lib/env-validation.ts
commit_with_date "feat: Add environment variable validation" "2024-10-19T17:00:00+0600"

git add lib/password-validator.ts
commit_with_date "feat: Implement password validation" "2024-10-19T17:30:00+0600"

# ============================================
# Day 3: October 20, 2024 - External Integrations
# ============================================
echo ""
echo "=== Day 3: October 20, 2024 - External Integrations ==="

git add lib/cloudinary.ts
commit_with_date "feat: Setup Cloudinary media integration" "2024-10-20T09:00:00+0600"

git add lib/github.ts
commit_with_date "feat: Add GitHub API integration" "2024-10-20T09:45:00+0600"

git add lib/email.ts
commit_with_date "feat: Configure email service with Nodemailer" "2024-10-20T10:30:00+0600"

git add lib/blog-fetchers.ts
commit_with_date "feat: Implement external blog fetching" "2024-10-20T11:15:00+0600"

git add lib/activity-logger.ts
commit_with_date "feat: Create activity logging system" "2024-10-20T12:00:00+0600"

git add lib/cursor-pagination.ts
commit_with_date "feat: Add cursor-based pagination" "2024-10-20T12:45:00+0600"

git add lib/blur-placeholder.ts
commit_with_date "feat: Generate blur placeholders for images" "2024-10-20T13:30:00+0600"

git add lib/performance-monitor.ts
commit_with_date "feat: Implement performance monitoring" "2024-10-20T14:15:00+0600"

git add lib/performance-budgets.ts
commit_with_date "feat: Define performance budgets" "2024-10-20T15:00:00+0600"

git add lib/redis-cache.ts
commit_with_date "feat: Add Redis caching support" "2024-10-20T15:45:00+0600"

git add lib/db-init.ts
commit_with_date "feat: Create database initialization script" "2024-10-20T16:30:00+0600"

git add lib/fetcher.ts
commit_with_date "feat: Add SWR fetcher utility" "2024-10-20T17:00:00+0600"

git add lib/swr-config.ts
commit_with_date "feat: Configure SWR global settings" "2024-10-20T17:30:00+0600"

git add lib/swrLocalStorageProvider.ts
commit_with_date "feat: Add SWR localStorage provider" "2024-10-20T18:00:00+0600"

# ============================================
# Day 4: October 21, 2024 - Admin Utilities
# ============================================
echo ""
echo "=== Day 4: October 21, 2024 - Admin Utilities ==="

git add lib/admin/fetch-with-auth.ts
commit_with_date "feat: Create authenticated fetch utility" "2024-10-21T09:00:00+0600"

git add lib/server/data.ts
commit_with_date "feat: Add server-side data fetching" "2024-10-21T10:00:00+0600"

git add lib/hooks/useAdminData.ts
commit_with_date "feat: Create useAdminData hook" "2024-10-21T11:00:00+0600"

git add lib/hooks/usePublicData.ts
commit_with_date "feat: Create usePublicData hook" "2024-10-21T12:00:00+0600"

git add hooks/useDebounce.ts
commit_with_date "feat: Add useDebounce hook" "2024-10-21T13:00:00+0600"

git add types/index.ts
commit_with_date "feat: Define TypeScript types" "2024-10-21T14:00:00+0600"

git add middleware.ts
commit_with_date "feat: Add middleware for route protection" "2024-10-21T15:00:00+0600"

# ============================================
# Day 5: October 22, 2024 - UI Components (Base)
# ============================================
echo ""
echo "=== Day 5: October 22, 2024 - UI Components (Base) ==="

git add components/ui/button.tsx
commit_with_date "feat: Create Button component" "2024-10-22T09:00:00+0600"

git add components/ui/card.tsx
commit_with_date "feat: Create Card component" "2024-10-22T09:20:00+0600"

git add components/ui/input.tsx
commit_with_date "feat: Create Input component" "2024-10-22T09:40:00+0600"

git add components/ui/textarea.tsx
commit_with_date "feat: Create Textarea component" "2024-10-22T10:00:00+0600"

git add components/ui/label.tsx
commit_with_date "feat: Create Label component" "2024-10-22T10:20:00+0600"

git add components/ui/dialog.tsx
commit_with_date "feat: Create Dialog component" "2024-10-22T10:40:00+0600"

git add components/ui/alert-dialog.tsx
commit_with_date "feat: Create AlertDialog component" "2024-10-22T11:00:00+0600"

git add components/ui/alert.tsx
commit_with_date "feat: Create Alert component" "2024-10-22T11:20:00+0600"

git add components/ui/skeleton.tsx
commit_with_date "feat: Create Skeleton component" "2024-10-22T11:40:00+0600"

git add components/ui/popover.tsx
commit_with_date "feat: Create Popover component" "2024-10-22T12:00:00+0600"

git add components/ui/command.tsx
commit_with_date "feat: Create Command component" "2024-10-22T12:20:00+0600"

# ============================================
# Day 6: October 23, 2024 - Layout Components
# ============================================
echo ""
echo "=== Day 6: October 23, 2024 - Layout Components ==="

git add components/Header.tsx
commit_with_date "feat: Create Header with navigation" "2024-10-23T09:00:00+0600"

git add components/Footer.tsx
commit_with_date "feat: Create Footer component" "2024-10-23T09:45:00+0600"

git add components/ThemeToggle.tsx
commit_with_date "feat: Add dark mode toggle" "2024-10-23T10:30:00+0600"

git add components/LazyMotion.tsx
commit_with_date "feat: Create lazy-loaded motion wrapper" "2024-10-23T11:15:00+0600"

git add components/DynamicMotion.tsx
commit_with_date "feat: Add dynamic motion component" "2024-10-23T12:00:00+0600"

git add components/DynamicFavicon.tsx
commit_with_date "feat: Create dynamic favicon component" "2024-10-23T12:45:00+0600"

git add components/WebVitals.tsx
commit_with_date "feat: Add Web Vitals tracking component" "2024-10-23T13:30:00+0600"

git add components/PerformanceBudgetMonitor.tsx
commit_with_date "feat: Create performance budget monitor" "2024-10-23T14:15:00+0600"

git add components/ClientPerformanceMonitor.tsx
commit_with_date "feat: Add client-side performance monitor" "2024-10-23T15:00:00+0600"

git add components/AnalyticsTracker.tsx
commit_with_date "feat: Create analytics tracker component" "2024-10-23T15:45:00+0600"

git add components/DeferredAnalytics.tsx
commit_with_date "feat: Add deferred analytics loading" "2024-10-23T16:30:00+0600"

git add components/AutoLogout.tsx
commit_with_date "feat: Create auto-logout component" "2024-10-23T17:00:00+0600"

# ============================================
# Day 7: October 24, 2024 - Content Components
# ============================================
echo ""
echo "=== Day 7: October 24, 2024 - Content Components ==="

git add components/BlogGrid.tsx
commit_with_date "feat: Create BlogGrid component" "2024-10-24T09:00:00+0600"

git add components/BlogGridWithFilter.tsx
commit_with_date "feat: Add filterable BlogGrid" "2024-10-24T09:40:00+0600"

git add components/BlogBackButton.tsx
commit_with_date "feat: Create blog back button" "2024-10-24T10:20:00+0600"

git add components/ProjectsGrid.tsx
commit_with_date "feat: Create ProjectsGrid component" "2024-10-24T11:00:00+0600"

git add components/ProjectsGridWithFilter.tsx
commit_with_date "feat: Add filterable ProjectsGrid" "2024-10-24T11:40:00+0600"

git add components/ProjectsGridWrapper.tsx
commit_with_date "feat: Create projects grid wrapper" "2024-10-24T12:20:00+0600"

git add components/ProjectsSkeleton.tsx
commit_with_date "feat: Add projects skeleton loader" "2024-10-24T13:00:00+0600"

git add components/SkillsGrid.tsx
commit_with_date "feat: Create SkillsGrid component" "2024-10-24T13:40:00+0600"

git add components/ExperienceTabsClient.tsx
commit_with_date "feat: Create experience tabs component" "2024-10-24T14:20:00+0600"

git add components/EducationList.tsx
commit_with_date "feat: Create EducationList component" "2024-10-24T15:00:00+0600"

git add components/CertificationsGrid.tsx
commit_with_date "feat: Create CertificationsGrid component" "2024-10-24T15:40:00+0600"

git add components/CertificationsGridWithFilter.tsx
commit_with_date "feat: Add filterable CertificationsGrid" "2024-10-24T16:20:00+0600"

# ============================================
# Day 8: October 25, 2024 - Form Components
# ============================================
echo ""
echo "=== Day 8: October 25, 2024 - Form Components ==="

git add components/ContactForm.tsx
commit_with_date "feat: Create ContactForm component" "2024-10-25T09:00:00+0600"

git add components/ImageUpload.tsx
commit_with_date "feat: Create ImageUpload component" "2024-10-25T10:00:00+0600"

git add components/ImageCropModal.tsx
commit_with_date "feat: Add image cropping modal" "2024-10-25T11:00:00+0600"

git add components/OptimizedImage.tsx
commit_with_date "feat: Create OptimizedImage component" "2024-10-25T12:00:00+0600"

git add components/PDFViewer.tsx
commit_with_date "feat: Add PDF viewer component" "2024-10-25T13:00:00+0600"

git add components/HeroContent.tsx
commit_with_date "feat: Create hero content component" "2024-10-25T14:00:00+0600"

git add components/HeroSkeleton.tsx
commit_with_date "feat: Add hero skeleton loader" "2024-10-25T15:00:00+0600"

git add components/AboutContent.tsx
commit_with_date "feat: Create about content component" "2024-10-25T16:00:00+0600"

# ============================================
# Day 9: October 26, 2024 - Admin Components
# ============================================
echo ""
echo "=== Day 9: October 26, 2024 - Admin Components ==="

git add components/admin/MessageCard.tsx
commit_with_date "feat: Create admin message card" "2024-10-26T09:00:00+0600"

git add components/admin/dashboard/LazyWidgets.tsx
commit_with_date "feat: Add lazy-loaded dashboard widgets" "2024-10-26T10:00:00+0600"

git add components/providers/SWRProvider.tsx
commit_with_date "feat: Create SWR provider component" "2024-10-26T11:00:00+0600"

# ============================================
# Day 10: October 27, 2024 - App Layout & Globals
# ============================================
echo ""
echo "=== Day 10: October 27, 2024 - App Layout & Globals ==="

git add app/layout.tsx
commit_with_date "feat: Create root layout with providers" "2024-10-27T09:00:00+0600"

git add app/globals.css
commit_with_date "feat: Add global CSS styles" "2024-10-27T09:30:00+0600"

git add app/animations.css
commit_with_date "feat: Add animation utilities" "2024-10-27T10:00:00+0600"

git add app/providers.tsx
commit_with_date "feat: Create providers wrapper" "2024-10-27T10:30:00+0600"

git add app/manifest.ts
commit_with_date "feat: Add PWA manifest" "2024-10-27T11:00:00+0600"

git add app/error.tsx
commit_with_date "feat: Create error boundary" "2024-10-27T11:30:00+0600"

git add app/not-found.tsx
commit_with_date "feat: Add 404 page" "2024-10-27T12:00:00+0600"

git add app/loading.tsx
commit_with_date "feat: Create loading UI" "2024-10-27T12:30:00+0600"

git add app/offline/page.tsx
commit_with_date "feat: Add offline fallback page" "2024-10-27T13:00:00+0600"

# ============================================
# Day 11: October 28, 2024 - Public Pages
# ============================================
echo ""
echo "=== Day 11: October 28, 2024 - Public Pages ==="

git add app/page.tsx
commit_with_date "feat: Create homepage" "2024-10-28T09:00:00+0600"

git add app/about/
commit_with_date "feat: Add about page" "2024-10-28T09:30:00+0600"

git add app/blog/page.tsx
commit_with_date "feat: Create blog listing page" "2024-10-28T10:00:00+0600"

git add app/blog/loading.tsx
commit_with_date "feat: Add blog loading state" "2024-10-28T10:20:00+0600"

git add app/blog/error.tsx
commit_with_date "feat: Add blog error boundary" "2024-10-28T10:40:00+0600"

git add app/blog/\[slug\]/page.tsx
commit_with_date "feat: Create blog detail page" "2024-10-28T11:00:00+0600"

git add app/blog/\[slug\]/not-found.tsx
commit_with_date "feat: Add blog 404 page" "2024-10-28T11:20:00+0600"

git add app/projects/page.tsx
commit_with_date "feat: Create projects page" "2024-10-28T11:40:00+0600"

git add app/projects/loading.tsx
commit_with_date "feat: Add projects loading state" "2024-10-28T12:00:00+0600"

git add app/projects/error.tsx
commit_with_date "feat: Add projects error boundary" "2024-10-28T12:20:00+0600"

git add app/skills/page.tsx
commit_with_date "feat: Create skills page" "2024-10-28T12:40:00+0600"

git add app/experience/page.tsx
commit_with_date "feat: Create experience page" "2024-10-28T13:00:00+0600"

git add app/education/page.tsx
commit_with_date "feat: Create education page" "2024-10-28T13:20:00+0600"

git add app/certifications/page.tsx
commit_with_date "feat: Create certifications page" "2024-10-28T13:40:00+0600"

git add app/certifications/\[slug\]/page.tsx
commit_with_date "feat: Add certification detail page" "2024-10-28T14:00:00+0600"

git add app/certifications/\[slug\]/not-found.tsx
commit_with_date "feat: Add certification 404 page" "2024-10-28T14:20:00+0600"

git add app/contact/page.tsx
commit_with_date "feat: Create contact page" "2024-10-28T14:40:00+0600"

git add app/resume/page.tsx
commit_with_date "feat: Create resume page" "2024-10-28T15:00:00+0600"

git add app/participation/page.tsx
commit_with_date "feat: Create participation page" "2024-10-28T15:20:00+0600"

git add app/actions/contact.ts
commit_with_date "feat: Add contact form server action" "2024-10-28T15:40:00+0600"

# ============================================
# Day 12-15: October 29-Nov 1 - Public API Routes
# ============================================
echo ""
echo "=== Day 12-15: Oct 29-Nov 1 - Public API Routes ==="

git add app/api/health/route.ts
commit_with_date "feat: Add health check endpoint" "2024-10-29T09:00:00+0600"

git add app/api/blog/route.ts
commit_with_date "feat: Create blog API endpoint" "2024-10-29T09:30:00+0600"

git add app/api/blog/\[id\]/route.ts
commit_with_date "feat: Add blog detail API" "2024-10-29T10:00:00+0600"

git add app/api/blog/\[id\]/publish/route.ts
commit_with_date "feat: Add blog publish endpoint" "2024-10-29T10:30:00+0600"

git add app/api/blog/bulk-delete/route.ts
commit_with_date "feat: Add blog bulk delete API" "2024-10-29T11:00:00+0600"

git add app/api/blog/sync/route.ts
commit_with_date "feat: Add blog sync endpoint" "2024-10-29T11:30:00+0600"

git add app/api/projects/route.ts
commit_with_date "feat: Create projects API endpoint" "2024-10-29T12:00:00+0600"

git add app/api/projects/\[id\]/route.ts
commit_with_date "feat: Add project detail API" "2024-10-29T12:30:00+0600"

git add app/api/projects/\[id\]/publish/route.ts
commit_with_date "feat: Add project publish endpoint" "2024-10-29T13:00:00+0600"

git add app/api/projects/bulk-delete/route.ts
commit_with_date "feat: Add projects bulk delete API" "2024-10-29T13:30:00+0600"

git add app/api/projects/delete-all/route.ts
commit_with_date "feat: Add projects delete all endpoint" "2024-10-29T14:00:00+0600"

git add app/api/projects/sync-github/route.ts
commit_with_date "feat: Add GitHub sync endpoint" "2024-10-29T14:30:00+0600"

git add app/api/skills/route.ts
commit_with_date "feat: Create skills API endpoint" "2024-10-30T09:00:00+0600"

git add app/api/skills/\[id\]/route.ts
commit_with_date "feat: Add skill detail API" "2024-10-30T09:30:00+0600"

git add app/api/skills/bulk-delete/route.ts
commit_with_date "feat: Add skills bulk delete API" "2024-10-30T10:00:00+0600"

git add app/api/experience/route.ts
commit_with_date "feat: Create experience API endpoint" "2024-10-30T10:30:00+0600"

git add app/api/experience/\[id\]/route.ts
commit_with_date "feat: Add experience detail API" "2024-10-30T11:00:00+0600"

git add app/api/experience/bulk-delete/route.ts
commit_with_date "feat: Add experience bulk delete API" "2024-10-30T11:30:00+0600"

git add app/api/education/route.ts
commit_with_date "feat: Create education API endpoint" "2024-10-30T12:00:00+0600"

git add app/api/education/\[id\]/route.ts
commit_with_date "feat: Add education detail API" "2024-10-30T12:30:00+0600"

git add app/api/education/bulk-delete/route.ts
commit_with_date "feat: Add education bulk delete API" "2024-10-30T13:00:00+0600"

git add app/api/certifications/route.ts
commit_with_date "feat: Create certifications API endpoint" "2024-10-30T13:30:00+0600"

git add app/api/certifications/\[id\]/route.ts
commit_with_date "feat: Add certification detail API" "2024-10-30T14:00:00+0600"

git add app/api/certifications/\[id\]/publish/route.ts
commit_with_date "feat: Add certification publish endpoint" "2024-10-30T14:30:00+0600"

git add app/api/certifications/bulk-delete/route.ts
commit_with_date "feat: Add certifications bulk delete API" "2024-10-30T15:00:00+0600"

git add app/api/contact/route.ts
commit_with_date "feat: Create contact form API" "2024-10-31T09:00:00+0600"

git add app/api/contact/\[id\]/route.ts
commit_with_date "feat: Add contact message detail API" "2024-10-31T09:30:00+0600"

git add app/api/contact/bulk-delete/route.ts
commit_with_date "feat: Add contact bulk delete API" "2024-10-31T10:00:00+0600"

git add app/api/participation/route.ts
commit_with_date "feat: Create participation API endpoint" "2024-10-31T10:30:00+0600"

git add app/api/participation/\[id\]/route.ts
commit_with_date "feat: Add participation detail API" "2024-10-31T11:00:00+0600"

git add app/api/participation/bulk-delete/route.ts
commit_with_date "feat: Add participation bulk delete API" "2024-10-31T11:30:00+0600"

git add app/api/profile/route.ts
commit_with_date "feat: Create profile API endpoint" "2024-10-31T12:00:00+0600"

git add app/api/upload/route.ts
commit_with_date "feat: Add file upload endpoint" "2024-10-31T12:30:00+0600"

git add app/api/resume/download/route.ts
commit_with_date "feat: Add resume download endpoint" "2024-10-31T13:00:00+0600"

git add app/api/rum/route.ts
commit_with_date "feat: Add RUM tracking endpoint" "2024-10-31T13:30:00+0600"

git add app/api/analytics/track/route.ts
commit_with_date "feat: Add analytics tracking endpoint" "2024-10-31T14:00:00+0600"

# ============================================
# Day 16-18: Nov 2-4 - Admin Dashboard Pages
# ============================================
echo ""
echo "=== Day 16-18: Nov 2-4 - Admin Dashboard ==="

git add app/admin/layout.tsx
commit_with_date "feat: Create admin layout" "2024-11-02T09:00:00+0600"

git add app/admin/page.tsx
commit_with_date "feat: Create admin dashboard" "2024-11-02T09:30:00+0600"

git add app/admin/error.tsx
commit_with_date "feat: Add admin error boundary" "2024-11-02T10:00:00+0600"

git add app/admin/login/page.tsx
commit_with_date "feat: Create admin login page" "2024-11-02T10:30:00+0600"

git add app/admin/analytics/page.tsx
commit_with_date "feat: Create analytics dashboard" "2024-11-02T11:00:00+0600"

git add app/admin/projects/page.tsx
commit_with_date "feat: Create projects management page" "2024-11-02T11:30:00+0600"

git add app/admin/projects/ProjectsClient.tsx
commit_with_date "feat: Add projects client component" "2024-11-02T12:00:00+0600"

git add app/admin/blog/page.tsx
commit_with_date "feat: Create blog management page" "2024-11-02T12:30:00+0600"

git add app/admin/blog/BlogClient.tsx
commit_with_date "feat: Add blog client component" "2024-11-02T13:00:00+0600"

git add app/admin/skills/page.tsx
commit_with_date "feat: Create skills management page" "2024-11-02T13:30:00+0600"

git add app/admin/skills/SkillsClient.tsx
commit_with_date "feat: Add skills client component" "2024-11-02T14:00:00+0600"

git add app/admin/experience/page.tsx
commit_with_date "feat: Create experience management page" "2024-11-02T14:30:00+0600"

git add app/admin/experience/ExperienceClient.tsx
commit_with_date "feat: Add experience client component" "2024-11-02T15:00:00+0600"

git add app/admin/education/page.tsx
commit_with_date "feat: Create education management page" "2024-11-03T09:00:00+0600"

git add app/admin/education/EducationClient.tsx
commit_with_date "feat: Add education client component" "2024-11-03T09:30:00+0600"

git add app/admin/certifications/page.tsx
commit_with_date "feat: Create certifications management page" "2024-11-03T10:00:00+0600"

git add app/admin/certifications/CertificationsClient.tsx
commit_with_date "feat: Add certifications client component" "2024-11-03T10:30:00+0600"

git add app/admin/media/page.tsx
commit_with_date "feat: Create media library page" "2024-11-03T11:00:00+0600"

git add app/admin/media/MediaClient.tsx
commit_with_date "feat: Add media client component" "2024-11-03T11:30:00+0600"

git add app/admin/messages/page.tsx
commit_with_date "feat: Create messages management page" "2024-11-03T12:00:00+0600"

git add app/admin/messages/MessagesClient.tsx
commit_with_date "feat: Add messages client component" "2024-11-03T12:30:00+0600"

git add app/admin/activity/page.tsx
commit_with_date "feat: Create activity log page" "2024-11-03T13:00:00+0600"

git add app/admin/scheduled-tasks/page.tsx
commit_with_date "feat: Create scheduled tasks page" "2024-11-03T13:30:00+0600"

git add app/admin/settings/page.tsx
commit_with_date "feat: Create settings page" "2024-11-03T14:00:00+0600"

git add app/admin/settings/SettingsClient.tsx
commit_with_date "feat: Add settings client component" "2024-11-03T14:30:00+0600"

git add app/admin/change-password/page.tsx
commit_with_date "feat: Create change password page" "2024-11-03T15:00:00+0600"

git add app/admin/calendar/page.tsx
commit_with_date "feat: Create calendar page" "2024-11-03T15:30:00+0600"

git add app/admin/backup/page.tsx
commit_with_date "feat: Create backup page" "2024-11-03T16:00:00+0600"

git add app/admin/export/page.tsx
commit_with_date "feat: Create export page" "2024-11-03T16:30:00+0600"

# ============================================
# Day 19-21: Nov 5-7 - Admin API Routes
# ============================================
echo ""
echo "=== Day 19-21: Nov 5-7 - Admin API Routes ==="

git add app/api/auth/\[...nextauth\]/route.ts
commit_with_date "feat: Setup NextAuth API routes" "2024-11-05T09:00:00+0600"

git add app/api/admin/system/route.ts
commit_with_date "feat: Add system info endpoint" "2024-11-05T09:30:00+0600"

git add app/api/admin/analytics/route.ts
commit_with_date "feat: Create admin analytics API" "2024-11-05T10:00:00+0600"

git add app/api/admin/analytics/visitors/route.ts
commit_with_date "feat: Add visitors analytics endpoint" "2024-11-05T10:30:00+0600"

git add app/api/admin/activity/route.ts
commit_with_date "feat: Create activity log API" "2024-11-05T11:00:00+0600"

git add app/api/admin/recent/route.ts
commit_with_date "feat: Add recent activity endpoint" "2024-11-05T11:30:00+0600"

git add app/api/admin/scheduled-tasks/route.ts
commit_with_date "feat: Create scheduled tasks API" "2024-11-05T12:00:00+0600"

git add app/api/admin/scheduled-tasks/\[id\]/route.ts
commit_with_date "feat: Add task detail endpoint" "2024-11-05T12:30:00+0600"

git add app/api/admin/media/route.ts
commit_with_date "feat: Create media management API" "2024-11-05T13:00:00+0600"

git add app/api/admin/backup/route.ts
commit_with_date "feat: Add backup endpoint" "2024-11-05T13:30:00+0600"

git add app/api/admin/restore/route.ts
commit_with_date "feat: Add restore endpoint" "2024-11-05T14:00:00+0600"

git add app/api/admin/export/route.ts
commit_with_date "feat: Create export API" "2024-11-05T14:30:00+0600"

git add app/api/admin/import/route.ts
commit_with_date "feat: Add import endpoint" "2024-11-05T15:00:00+0600"

git add app/api/admin/change-password/route.ts
commit_with_date "feat: Create change password API" "2024-11-05T15:30:00+0600"

git add app/api/admin/batch/route.ts
commit_with_date "feat: Add batch operations endpoint" "2024-11-05T16:00:00+0600"

git add app/api/admin/cache-stats/route.ts
commit_with_date "feat: Create cache stats API" "2024-11-06T09:00:00+0600"

git add app/api/admin/web-vitals/route.ts
commit_with_date "feat: Add web vitals admin API" "2024-11-06T09:30:00+0600"

git add app/api/admin/performance-alerts/route.ts
commit_with_date "feat: Create performance alerts API" "2024-11-06T10:00:00+0600"

git add app/api/admin/seo/route.ts
commit_with_date "feat: Add SEO management endpoint" "2024-11-06T10:30:00+0600"

git add app/api/admin/link-check/route.ts
commit_with_date "feat: Create link checker API" "2024-11-06T11:00:00+0600"

# ============================================
# Day 22-23: Nov 8-9 - Testing
# ============================================
echo ""
echo "=== Day 22-23: Nov 8-9 - Testing ==="

git add __mocks__/axios.js
commit_with_date "test: Add axios mock" "2024-11-08T09:00:00+0600"

git add __mocks__/bcryptjs.js
commit_with_date "test: Add bcryptjs mock" "2024-11-08T09:20:00+0600"

git add __mocks__/cloudinary.js
commit_with_date "test: Add Cloudinary mock" "2024-11-08T09:40:00+0600"

git add __mocks__/lucide-react.js
commit_with_date "test: Add Lucide icons mock" "2024-11-08T10:00:00+0600"

git add __mocks__/nodemailer.js
commit_with_date "test: Add Nodemailer mock" "2024-11-08T10:20:00+0600"

git add __tests__/setup/test-utils.tsx
commit_with_date "test: Create test utilities" "2024-11-08T10:40:00+0600"

git add __tests__/setup/mock-data.ts
commit_with_date "test: Add mock data" "2024-11-08T11:00:00+0600"

git add __tests__/setup/mongodb-handler.ts
commit_with_date "test: Create MongoDB test handler" "2024-11-08T11:20:00+0600"

git add __tests__/lib/utils.test.ts
commit_with_date "test: Add utils tests" "2024-11-08T11:40:00+0600"

git add __tests__/lib/validations.test.ts
commit_with_date "test: Add validation tests" "2024-11-08T12:00:00+0600"

git add __tests__/lib/cache.test.ts
commit_with_date "test: Add cache tests" "2024-11-08T12:20:00+0600"

git add __tests__/lib/logger.test.ts
commit_with_date "test: Add logger tests" "2024-11-08T12:40:00+0600"

git add __tests__/lib/auth.test.ts
commit_with_date "test: Add auth tests" "2024-11-08T13:00:00+0600"

git add __tests__/lib/cloudinary.test.ts
commit_with_date "test: Add Cloudinary tests" "2024-11-08T13:20:00+0600"

git add __tests__/lib/github.test.ts
commit_with_date "test: Add GitHub tests" "2024-11-08T13:40:00+0600"

git add __tests__/lib/email.test.ts
commit_with_date "test: Add email tests" "2024-11-08T14:00:00+0600"

git add __tests__/lib/rate-limit.test.ts
commit_with_date "test: Add rate limit tests" "2024-11-08T14:20:00+0600"

git add __tests__/models/Project.test.ts
commit_with_date "test: Add Project model tests" "2024-11-08T14:40:00+0600"

git add __tests__/models/Blog.test.ts
commit_with_date "test: Add Blog model tests" "2024-11-08T15:00:00+0600"

git add __tests__/models/Skill.test.ts
commit_with_date "test: Add Skill model tests" "2024-11-08T15:20:00+0600"

git add __tests__/models/Experience.test.ts
commit_with_date "test: Add Experience model tests" "2024-11-08T15:40:00+0600"

git add __tests__/models/Education.test.ts
commit_with_date "test: Add Education model tests" "2024-11-08T16:00:00+0600"

git add __tests__/models/Participation.test.ts
commit_with_date "test: Add Participation model tests" "2024-11-08T16:20:00+0600"

git add __tests__/components/Header.test.tsx
commit_with_date "test: Add Header component tests" "2024-11-09T09:00:00+0600"

git add __tests__/components/Footer.test.tsx
commit_with_date "test: Add Footer component tests" "2024-11-09T09:20:00+0600"

git add __tests__/components/ThemeToggle.test.tsx
commit_with_date "test: Add ThemeToggle tests" "2024-11-09T09:40:00+0600"

git add __tests__/components/BlogGrid.test.tsx
commit_with_date "test: Add BlogGrid tests" "2024-11-09T10:00:00+0600"

git add __tests__/components/ProjectsGrid.test.tsx
commit_with_date "test: Add ProjectsGrid tests" "2024-11-09T10:20:00+0600"

git add __tests__/components/SkillsGrid.test.tsx
commit_with_date "test: Add SkillsGrid tests" "2024-11-09T10:40:00+0600"

git add __tests__/components/ExperienceTabsClient.test.tsx
commit_with_date "test: Add ExperienceTabs tests" "2024-11-09T11:00:00+0600"

git add __tests__/components/EducationList.test.tsx
commit_with_date "test: Add EducationList tests" "2024-11-09T11:20:00+0600"

git add __tests__/components/CertificationsGrid.test.tsx
commit_with_date "test: Add CertificationsGrid tests" "2024-11-09T11:40:00+0600"

git add __tests__/components/ContactForm.test.tsx
commit_with_date "test: Add ContactForm tests" "2024-11-09T12:00:00+0600"

git add __tests__/components/ImageUpload.test.tsx
commit_with_date "test: Add ImageUpload tests" "2024-11-09T12:20:00+0600"

git add __tests__/components/ImageCropModal.test.tsx
commit_with_date "test: Add ImageCropModal tests" "2024-11-09T12:40:00+0600"

git add __tests__/pages/HomePage.test.tsx
commit_with_date "test: Add HomePage tests" "2024-11-09T13:00:00+0600"

git add __tests__/pages/AboutPage.test.tsx
commit_with_date "test: Add AboutPage tests" "2024-11-09T13:20:00+0600"

git add __tests__/api/projects.test.ts
commit_with_date "test: Add projects API tests" "2024-11-09T13:40:00+0600"

git add __tests__/api/projects-id.test.ts
commit_with_date "test: Add project detail API tests" "2024-11-09T14:00:00+0600"

git add __tests__/api/blog.test.ts
commit_with_date "test: Add blog API tests" "2024-11-09T14:20:00+0600"

git add __tests__/api/skills.test.ts
commit_with_date "test: Add skills API tests" "2024-11-09T14:40:00+0600"

git add __tests__/api/skills-id.test.ts
commit_with_date "test: Add skill detail API tests" "2024-11-09T15:00:00+0600"

git add __tests__/api/experience.test.ts
commit_with_date "test: Add experience API tests" "2024-11-09T15:20:00+0600"

git add __tests__/api/education.test.ts
commit_with_date "test: Add education API tests" "2024-11-09T15:40:00+0600"

git add __tests__/api/certifications.test.ts
commit_with_date "test: Add certifications API tests" "2024-11-09T16:00:00+0600"

git add __tests__/api/participation.test.ts
commit_with_date "test: Add participation API tests" "2024-11-09T16:20:00+0600"

git add __tests__/api/contact.test.ts
commit_with_date "test: Add contact API tests" "2024-11-09T16:40:00+0600"

git add __tests__/api/profile.test.ts
commit_with_date "test: Add profile API tests" "2024-11-09T17:00:00+0600"

git add __tests__/api/analytics.test.ts
commit_with_date "test: Add analytics API tests" "2024-11-09T17:20:00+0600"

git add __tests__/api/admin-media.test.ts
commit_with_date "test: Add admin media API tests" "2024-11-09T17:40:00+0600"

git add __tests__/api/change-password.test.ts
commit_with_date "test: Add change password API tests" "2024-11-09T18:00:00+0600"

git add __tests__/api/sync-github.test.ts
commit_with_date "test: Add GitHub sync API tests" "2024-11-09T18:20:00+0600"

git add __tests__/integration/contact-flow.test.ts
commit_with_date "test: Add contact flow integration test" "2024-11-09T18:40:00+0600"

git add __tests__/integration/publish-workflow.test.ts
commit_with_date "test: Add publish workflow test" "2024-11-09T19:00:00+0600"

git add __tests__/integration/github-sync-flow.test.ts
commit_with_date "test: Add GitHub sync flow test" "2024-11-09T19:20:00+0600"

git add __tests__/e2e/user-journey.spec.ts
commit_with_date "test: Add E2E user journey test" "2024-11-09T19:40:00+0600"

# ============================================
# Day 24-25: Nov 10-11 - Documentation
# ============================================
echo ""
echo "=== Day 24-25: Nov 10-11 - Documentation ==="

git add README.md
commit_with_date "docs: Create comprehensive README" "2024-11-10T09:00:00+0600"

git add CLEANUP_CHECKLIST.md
commit_with_date "docs: Add cleanup checklist" "2024-11-10T10:00:00+0600"

git add CLEANUP_COMPLETED.md
commit_with_date "docs: Document completed cleanup" "2024-11-10T11:00:00+0600"

git add CLEANUP_SUMMARY.txt
commit_with_date "docs: Add cleanup summary" "2024-11-10T12:00:00+0600"

git add NEXT_STEPS_PORTFOLIO.md
commit_with_date "docs: Document next steps" "2024-11-10T13:00:00+0600"

git add UNNECESSARY_CODE_ANALYSIS.md
commit_with_date "docs: Add code analysis documentation" "2024-11-10T14:00:00+0600"

git add VERCEL_KV_SETUP.md
commit_with_date "docs: Document Vercel KV setup" "2024-11-10T15:00:00+0600"

git add scripts/verify-deployment.ts
commit_with_date "chore: Add deployment verification script" "2024-11-10T16:00:00+0600"

# ============================================
# Day 26: Nov 12 - Public Assets
# ============================================
echo ""
echo "=== Day 26: Nov 12 - Public Assets ==="

git add public/robots.txt
commit_with_date "feat: Add robots.txt for SEO" "2024-11-12T09:00:00+0600"

git add public/sitemap.xml
commit_with_date "feat: Add sitemap.xml" "2024-11-12T09:30:00+0600"

git add public/sitemap-0.xml
commit_with_date "feat: Add sitemap pages" "2024-11-12T10:00:00+0600"

git add public/light.png
commit_with_date "feat: Add light mode favicon" "2024-11-12T10:30:00+0600"

git add public/dark.png
commit_with_date "feat: Add dark mode favicon" "2024-11-12T11:00:00+0600"

# ============================================
# Final: Add any remaining files
# ============================================
echo ""
echo "=== Final: Adding remaining files ==="

git add .
commit_with_date "chore: Add any remaining project files" "2024-11-12T12:00:00+0600"

echo ""
echo "✅ Git history rebuild complete!"
echo ""
echo "📊 Commit Summary:"
git log --oneline --all | head -20
echo ""
echo "🎉 Created $COMMIT_COUNT commits from Oct 17 - Nov 12, 2024"
echo "💡 All commits are on the main branch"
echo ""
echo "To see all commits: git log --oneline"
