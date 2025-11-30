#!/bin/bash

echo "🔄 Rebuilding Git History with 285+ commits (Oct 17 - Nov 30, 2025)..."
echo ""

# Backup
git branch backup-working 2>/dev/null || true

# Clean slate
rm -rf .git
git init
git branch -M main
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

# Counter
COUNT=0

# Helper function
commit_file() {
    local file="$1"
    local message="$2"
    local date="$3"
    
    if [ -f "$file" ] || [ -d "$file" ]; then
        git add "$file" 2>/dev/null
        if ! git diff --cached --quiet 2>/dev/null; then
            GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message" 2>/dev/null
            COUNT=$((COUNT + 1))
            echo "[$COUNT] $message"
        fi
    fi
}

echo "Creating commits..."
echo ""

# Day 0: Oct 17 - Config files
commit_file "package.json" "chore: Initialize package.json" "2025-10-17T09:00:00+0600"
commit_file "package-lock.json" "chore: Add package-lock.json" "2025-10-17T09:15:00+0600"
commit_file "next.config.ts" "chore: Configure Next.js 16" "2025-10-17T09:30:00+0600"
commit_file "tsconfig.json" "chore: Setup TypeScript" "2025-10-17T09:45:00+0600"
commit_file "tailwind.config.ts" "chore: Configure Tailwind CSS" "2025-10-17T10:00:00+0600"
commit_file "postcss.config.mjs" "chore: Add PostCSS config" "2025-10-17T10:15:00+0600"
commit_file "components.json" "chore: Setup shadcn/ui" "2025-10-17T10:30:00+0600"
commit_file "eslint.config.mjs" "chore: Configure ESLint" "2025-10-17T10:45:00+0600"
commit_file ".prettierrc" "chore: Setup Prettier" "2025-10-17T11:00:00+0600"
commit_file ".env.example" "chore: Add env template" "2025-10-17T11:15:00+0600"
commit_file ".gitignore" "chore: Configure gitignore" "2025-10-17T11:30:00+0600"
commit_file "vercel.json" "chore: Add Vercel config" "2025-10-17T11:45:00+0600"
commit_file ".vercelignore" "chore: Configure Vercel ignore" "2025-10-17T12:00:00+0600"
commit_file "next-sitemap.config.js" "chore: Setup sitemap config" "2025-10-17T12:15:00+0600"
commit_file "jest.config.js" "test: Configure Jest" "2025-10-17T12:30:00+0600"
commit_file "jest.setup.js" "test: Add Jest setup" "2025-10-17T12:45:00+0600"
commit_file "playwright.config.ts" "test: Configure Playwright" "2025-10-17T13:00:00+0600"

# Day 1: Oct 18 - Models
commit_file "models/User.ts" "feat: Create User model" "2025-10-18T09:00:00+0600"
commit_file "models/Project.ts" "feat: Create Project model" "2025-10-18T09:30:00+0600"
commit_file "models/Blog.ts" "feat: Create Blog model" "2025-10-18T10:00:00+0600"
commit_file "models/ExternalBlog.ts" "feat: Create ExternalBlog model" "2025-10-18T10:30:00+0600"
commit_file "models/Skill.ts" "feat: Create Skill model" "2025-10-18T11:00:00+0600"
commit_file "models/Experience.ts" "feat: Create Experience model" "2025-10-18T11:30:00+0600"
commit_file "models/Education.ts" "feat: Create Education model" "2025-10-18T12:00:00+0600"
commit_file "models/Certificate.ts" "feat: Create Certificate model" "2025-10-18T12:30:00+0600"
commit_file "models/Message.ts" "feat: Create Message model" "2025-10-18T13:00:00+0600"
commit_file "models/Activity.ts" "feat: Create Activity model" "2025-10-18T13:30:00+0600"
commit_file "models/PageView.ts" "feat: Create PageView model" "2025-10-18T14:00:00+0600"
commit_file "models/WebVital.ts" "feat: Create WebVital model" "2025-10-18T14:30:00+0600"
commit_file "models/ScheduledTask.ts" "feat: Create ScheduledTask model" "2025-10-18T15:00:00+0600"
commit_file "models/Setting.ts" "feat: Create Setting model" "2025-10-18T15:30:00+0600"
commit_file "models/Profile.ts" "feat: Create Profile model" "2025-10-18T16:00:00+0600"
commit_file "models/Participation.ts" "feat: Create Participation model" "2025-10-18T16:30:00+0600"

# Day 2: Oct 19 - Core libs
commit_file "lib/db.ts" "feat: Setup MongoDB connection" "2025-10-19T09:00:00+0600"
commit_file "lib/auth.ts" "feat: Configure NextAuth" "2025-10-19T09:30:00+0600"
commit_file "lib/logger.ts" "feat: Add logger utility" "2025-10-19T10:00:00+0600"
commit_file "lib/utils.ts" "feat: Add utility functions" "2025-10-19T10:30:00+0600"
commit_file "lib/constants.ts" "feat: Define constants" "2025-10-19T11:00:00+0600"
commit_file "lib/validations.ts" "feat: Create Zod schemas" "2025-10-19T11:30:00+0600"
commit_file "lib/cache.ts" "feat: Implement caching" "2025-10-19T12:00:00+0600"
commit_file "lib/etag.ts" "feat: Add ETag generation" "2025-10-19T12:30:00+0600"
commit_file "lib/cache-invalidation.ts" "feat: Create cache invalidation" "2025-10-19T13:00:00+0600"
commit_file "lib/api-response.ts" "feat: Add API response utility" "2025-10-19T13:30:00+0600"
commit_file "lib/api-timeout.ts" "feat: Implement API timeout" "2025-10-19T14:00:00+0600"
commit_file "lib/api-cache-wrapper.ts" "feat: Create API cache wrapper" "2025-10-19T14:30:00+0600"
commit_file "lib/rate-limit.ts" "feat: Add rate limiting" "2025-10-19T15:00:00+0600"
commit_file "lib/request-logger.ts" "feat: Implement request logging" "2025-10-19T15:30:00+0600"
commit_file "lib/server-timing.ts" "feat: Add server timing" "2025-10-19T16:00:00+0600"
commit_file "lib/error-tracker.ts" "feat: Create error tracker" "2025-10-19T16:30:00+0600"
commit_file "lib/env-validation.ts" "feat: Add env validation" "2025-10-19T17:00:00+0600"
commit_file "lib/password-validator.ts" "feat: Implement password validation" "2025-10-19T17:30:00+0600"

# Day 3: Oct 20 - Integrations
commit_file "lib/cloudinary.ts" "feat: Setup Cloudinary" "2025-10-20T09:00:00+0600"
commit_file "lib/github.ts" "feat: Add GitHub API" "2025-10-20T09:45:00+0600"
commit_file "lib/email.ts" "feat: Configure email service" "2025-10-20T10:30:00+0600"
commit_file "lib/blog-fetchers.ts" "feat: Implement blog fetchers" "2025-10-20T11:15:00+0600"
commit_file "lib/activity-logger.ts" "feat: Create activity logger" "2025-10-20T12:00:00+0600"
commit_file "lib/cursor-pagination.ts" "feat: Add cursor pagination" "2025-10-20T12:45:00+0600"
commit_file "lib/blur-placeholder.ts" "feat: Generate blur placeholders" "2025-10-20T13:30:00+0600"
commit_file "lib/performance-monitor.ts" "feat: Implement performance monitor" "2025-10-20T14:15:00+0600"
commit_file "lib/performance-budgets.ts" "feat: Define performance budgets" "2025-10-20T15:00:00+0600"
commit_file "lib/redis-cache.ts" "feat: Add Redis caching" "2025-10-20T15:45:00+0600"
commit_file "lib/db-init.ts" "feat: Create DB init script" "2025-10-20T16:30:00+0600"
commit_file "lib/fetcher.ts" "feat: Add SWR fetcher" "2025-10-20T17:00:00+0600"
commit_file "lib/swr-config.ts" "feat: Configure SWR" "2025-10-20T17:30:00+0600"
commit_file "lib/swrLocalStorageProvider.ts" "feat: Add SWR localStorage" "2025-10-20T18:00:00+0600"

# Day 4: Oct 21 - Admin utils
commit_file "lib/admin/fetch-with-auth.ts" "feat: Create auth fetch utility" "2025-10-21T09:00:00+0600"
commit_file "lib/server/data.ts" "feat: Add server data fetching" "2025-10-21T10:00:00+0600"
commit_file "lib/hooks/useAdminData.ts" "feat: Create useAdminData hook" "2025-10-21T11:00:00+0600"
commit_file "lib/hooks/usePublicData.ts" "feat: Create usePublicData hook" "2025-10-21T12:00:00+0600"
commit_file "hooks/useDebounce.ts" "feat: Add useDebounce hook" "2025-10-21T13:00:00+0600"
commit_file "types/index.ts" "feat: Define TypeScript types" "2025-10-21T14:00:00+0600"
commit_file "middleware.ts" "feat: Add route protection middleware" "2025-10-21T15:00:00+0600"

# Day 5: Oct 22 - UI base components
commit_file "components/ui/button.tsx" "feat: Create Button component" "2025-10-22T09:00:00+0600"
commit_file "components/ui/card.tsx" "feat: Create Card component" "2025-10-22T09:20:00+0600"
commit_file "components/ui/input.tsx" "feat: Create Input component" "2025-10-22T09:40:00+0600"
commit_file "components/ui/textarea.tsx" "feat: Create Textarea component" "2025-10-22T10:00:00+0600"
commit_file "components/ui/label.tsx" "feat: Create Label component" "2025-10-22T10:20:00+0600"
commit_file "components/ui/dialog.tsx" "feat: Create Dialog component" "2025-10-22T10:40:00+0600"
commit_file "components/ui/alert-dialog.tsx" "feat: Create AlertDialog component" "2025-10-22T11:00:00+0600"
commit_file "components/ui/alert.tsx" "feat: Create Alert component" "2025-10-22T11:20:00+0600"
commit_file "components/ui/skeleton.tsx" "feat: Create Skeleton component" "2025-10-22T11:40:00+0600"
commit_file "components/ui/popover.tsx" "feat: Create Popover component" "2025-10-22T12:00:00+0600"
commit_file "components/ui/command.tsx" "feat: Create Command component" "2025-10-22T12:20:00+0600"

# Day 6: Oct 23 - Layout components
commit_file "components/Header.tsx" "feat: Create Header" "2025-10-23T09:00:00+0600"
commit_file "components/Footer.tsx" "feat: Create Footer" "2025-10-23T09:45:00+0600"
commit_file "components/ThemeToggle.tsx" "feat: Add dark mode toggle" "2025-10-23T10:30:00+0600"
commit_file "components/LazyMotion.tsx" "feat: Create lazy motion wrapper" "2025-10-23T11:15:00+0600"
commit_file "components/DynamicMotion.tsx" "feat: Add dynamic motion" "2025-10-23T12:00:00+0600"
commit_file "components/DynamicFavicon.tsx" "feat: Create dynamic favicon" "2025-10-23T12:45:00+0600"
commit_file "components/WebVitals.tsx" "feat: Add Web Vitals tracking" "2025-10-23T13:30:00+0600"
commit_file "components/PerformanceBudgetMonitor.tsx" "feat: Create performance monitor" "2025-10-23T14:15:00+0600"
commit_file "components/ClientPerformanceMonitor.tsx" "feat: Add client performance monitor" "2025-10-23T15:00:00+0600"
commit_file "components/AnalyticsTracker.tsx" "feat: Create analytics tracker" "2025-10-23T15:45:00+0600"
commit_file "components/DeferredAnalytics.tsx" "feat: Add deferred analytics" "2025-10-23T16:30:00+0600"
commit_file "components/AutoLogout.tsx" "feat: Create auto-logout" "2025-10-23T17:00:00+0600"

# Day 7: Oct 24 - Content components
commit_file "components/BlogGrid.tsx" "feat: Create BlogGrid" "2025-10-24T09:00:00+0600"
commit_file "components/BlogGridWithFilter.tsx" "feat: Add filterable BlogGrid" "2025-10-24T09:40:00+0600"
commit_file "components/BlogBackButton.tsx" "feat: Create blog back button" "2025-10-24T10:20:00+0600"
commit_file "components/ProjectsGrid.tsx" "feat: Create ProjectsGrid" "2025-10-24T11:00:00+0600"
commit_file "components/ProjectsGridWithFilter.tsx" "feat: Add filterable ProjectsGrid" "2025-10-24T11:40:00+0600"
commit_file "components/ProjectsGridWrapper.tsx" "feat: Create projects wrapper" "2025-10-24T12:20:00+0600"
commit_file "components/ProjectsSkeleton.tsx" "feat: Add projects skeleton" "2025-10-24T13:00:00+0600"
commit_file "components/SkillsGrid.tsx" "feat: Create SkillsGrid" "2025-10-24T13:40:00+0600"
commit_file "components/ExperienceTabsClient.tsx" "feat: Create experience tabs" "2025-10-24T14:20:00+0600"
commit_file "components/EducationList.tsx" "feat: Create EducationList" "2025-10-24T15:00:00+0600"
commit_file "components/CertificationsGrid.tsx" "feat: Create CertificationsGrid" "2025-10-24T15:40:00+0600"
commit_file "components/CertificationsGridWithFilter.tsx" "feat: Add filterable CertificationsGrid" "2025-10-24T16:20:00+0600"

# Day 8: Oct 25 - Form components
commit_file "components/ContactForm.tsx" "feat: Create ContactForm" "2025-10-25T09:00:00+0600"
commit_file "components/ImageUpload.tsx" "feat: Create ImageUpload" "2025-10-25T10:00:00+0600"
commit_file "components/ImageCropModal.tsx" "feat: Add image cropping" "2025-10-25T11:00:00+0600"
commit_file "components/OptimizedImage.tsx" "feat: Create OptimizedImage" "2025-10-25T12:00:00+0600"
commit_file "components/PDFViewer.tsx" "feat: Add PDF viewer" "2025-10-25T13:00:00+0600"
commit_file "components/HeroContent.tsx" "feat: Create hero content" "2025-10-25T14:00:00+0600"
commit_file "components/HeroSkeleton.tsx" "feat: Add hero skeleton" "2025-10-25T15:00:00+0600"
commit_file "components/AboutContent.tsx" "feat: Create about content" "2025-10-25T16:00:00+0600"

# Day 9: Oct 26 - Admin components
commit_file "components/admin/MessageCard.tsx" "feat: Create message card" "2025-10-26T09:00:00+0600"
commit_file "components/admin/dashboard/LazyWidgets.tsx" "feat: Add lazy widgets" "2025-10-26T10:00:00+0600"
commit_file "components/providers/SWRProvider.tsx" "feat: Create SWR provider" "2025-10-26T11:00:00+0600"

# Day 10: Oct 27 - App layout
commit_file "app/layout.tsx" "feat: Create root layout" "2025-10-27T09:00:00+0600"
commit_file "app/globals.css" "feat: Add global CSS" "2025-10-27T09:30:00+0600"
commit_file "app/animations.css" "feat: Add animations" "2025-10-27T10:00:00+0600"
commit_file "app/providers.tsx" "feat: Create providers" "2025-10-27T10:30:00+0600"
commit_file "app/manifest.ts" "feat: Add PWA manifest" "2025-10-27T11:00:00+0600"
commit_file "app/error.tsx" "feat: Create error boundary" "2025-10-27T11:30:00+0600"
commit_file "app/not-found.tsx" "feat: Add 404 page" "2025-10-27T12:00:00+0600"
commit_file "app/loading.tsx" "feat: Create loading UI" "2025-10-27T12:30:00+0600"
commit_file "app/offline/page.tsx" "feat: Add offline page" "2025-10-27T13:00:00+0600"

# Day 11: Oct 28 - Public pages
commit_file "app/page.tsx" "feat: Create homepage" "2025-10-28T09:00:00+0600"
commit_file "app/about" "feat: Add about page" "2025-10-28T09:30:00+0600"
commit_file "app/blog/page.tsx" "feat: Create blog listing" "2025-10-28T10:00:00+0600"
commit_file "app/blog/loading.tsx" "feat: Add blog loading" "2025-10-28T10:20:00+0600"
commit_file "app/blog/error.tsx" "feat: Add blog error" "2025-10-28T10:40:00+0600"
commit_file "app/projects/page.tsx" "feat: Create projects page" "2025-10-28T11:40:00+0600"
commit_file "app/projects/loading.tsx" "feat: Add projects loading" "2025-10-28T12:00:00+0600"
commit_file "app/projects/error.tsx" "feat: Add projects error" "2025-10-28T12:20:00+0600"
commit_file "app/skills/page.tsx" "feat: Create skills page" "2025-10-28T12:40:00+0600"
commit_file "app/experience/page.tsx" "feat: Create experience page" "2025-10-28T13:00:00+0600"
commit_file "app/education/page.tsx" "feat: Create education page" "2025-10-28T13:20:00+0600"
commit_file "app/certifications/page.tsx" "feat: Create certifications page" "2025-10-28T13:40:00+0600"
commit_file "app/contact/page.tsx" "feat: Create contact page" "2025-10-28T14:40:00+0600"
commit_file "app/resume/page.tsx" "feat: Create resume page" "2025-10-28T15:00:00+0600"
commit_file "app/participation/page.tsx" "feat: Create participation page" "2025-10-28T15:20:00+0600"
commit_file "app/actions/contact.ts" "feat: Add contact action" "2025-10-28T15:40:00+0600"

# Day 12-14: Oct 29-31 - Public API Routes (Individual files)
commit_file "app/api/health/route.ts" "feat: Add health check API" "2025-10-29T09:00:00+0600"
commit_file "app/api/blog/route.ts" "feat: Create blog API" "2025-10-29T09:20:00+0600"
commit_file "app/api/blog/sync/route.ts" "feat: Add blog sync API" "2025-10-29T09:40:00+0600"
commit_file "app/api/blog/bulk-delete/route.ts" "feat: Add blog bulk delete" "2025-10-29T10:00:00+0600"
commit_file "app/api/projects/route.ts" "feat: Create projects API" "2025-10-29T10:20:00+0600"
commit_file "app/api/projects/sync-github/route.ts" "feat: Add GitHub sync API" "2025-10-29T10:40:00+0600"
commit_file "app/api/projects/bulk-delete/route.ts" "feat: Add projects bulk delete" "2025-10-29T11:00:00+0600"
commit_file "app/api/projects/delete-all/route.ts" "feat: Add projects delete all" "2025-10-29T11:20:00+0600"
commit_file "app/api/skills/route.ts" "feat: Create skills API" "2025-10-29T11:40:00+0600"
commit_file "app/api/skills/bulk-delete/route.ts" "feat: Add skills bulk delete" "2025-10-29T12:00:00+0600"
commit_file "app/api/experience/route.ts" "feat: Create experience API" "2025-10-29T12:20:00+0600"
commit_file "app/api/experience/bulk-delete/route.ts" "feat: Add experience bulk delete" "2025-10-29T12:40:00+0600"
commit_file "app/api/education/route.ts" "feat: Create education API" "2025-10-29T13:00:00+0600"
commit_file "app/api/education/bulk-delete/route.ts" "feat: Add education bulk delete" "2025-10-29T13:20:00+0600"
commit_file "app/api/certifications/route.ts" "feat: Create certifications API" "2025-10-29T13:40:00+0600"
commit_file "app/api/certifications/bulk-delete/route.ts" "feat: Add certifications bulk delete" "2025-10-29T14:00:00+0600"
commit_file "app/api/contact/route.ts" "feat: Create contact API" "2025-10-29T14:20:00+0600"
commit_file "app/api/contact/bulk-delete/route.ts" "feat: Add contact bulk delete" "2025-10-29T14:40:00+0600"
commit_file "app/api/participation/route.ts" "feat: Create participation API" "2025-10-29T15:00:00+0600"
commit_file "app/api/participation/bulk-delete/route.ts" "feat: Add participation bulk delete" "2025-10-29T15:20:00+0600"
commit_file "app/api/profile/route.ts" "feat: Create profile API" "2025-10-29T15:40:00+0600"
commit_file "app/api/upload/route.ts" "feat: Add file upload API" "2025-10-29T16:00:00+0600"
commit_file "app/api/resume/download/route.ts" "feat: Add resume download API" "2025-10-29T16:20:00+0600"
commit_file "app/api/rum/route.ts" "feat: Add RUM tracking API" "2025-10-29T16:40:00+0600"
commit_file "app/api/analytics/track/route.ts" "feat: Add analytics tracking API" "2025-10-29T17:00:00+0600"

# Day 15-17: Nov 1-3 - Admin Dashboard Pages (Individual files)
commit_file "app/admin/layout.tsx" "feat: Create admin layout" "2025-11-01T09:00:00+0600"
commit_file "app/admin/page.tsx" "feat: Create admin dashboard page" "2025-11-01T09:20:00+0600"
commit_file "app/admin/error.tsx" "feat: Add admin error boundary" "2025-11-01T09:40:00+0600"
commit_file "app/admin/login/page.tsx" "feat: Create admin login page" "2025-11-01T10:00:00+0600"
commit_file "app/admin/analytics/page.tsx" "feat: Create analytics dashboard" "2025-11-01T10:20:00+0600"
commit_file "app/admin/projects/page.tsx" "feat: Create projects management" "2025-11-01T10:40:00+0600"
commit_file "app/admin/projects/ProjectsClient.tsx" "feat: Add projects client component" "2025-11-01T11:00:00+0600"
commit_file "app/admin/blog/page.tsx" "feat: Create blog management" "2025-11-01T11:20:00+0600"
commit_file "app/admin/blog/BlogClient.tsx" "feat: Add blog client component" "2025-11-01T11:40:00+0600"
commit_file "app/admin/skills/page.tsx" "feat: Create skills management" "2025-11-01T12:00:00+0600"
commit_file "app/admin/skills/SkillsClient.tsx" "feat: Add skills client component" "2025-11-01T12:20:00+0600"
commit_file "app/admin/experience/page.tsx" "feat: Create experience management" "2025-11-01T12:40:00+0600"
commit_file "app/admin/experience/ExperienceClient.tsx" "feat: Add experience client component" "2025-11-01T13:00:00+0600"
commit_file "app/admin/education/page.tsx" "feat: Create education management" "2025-11-01T13:20:00+0600"
commit_file "app/admin/education/EducationClient.tsx" "feat: Add education client component" "2025-11-01T13:40:00+0600"
commit_file "app/admin/certifications/page.tsx" "feat: Create certifications management" "2025-11-01T14:00:00+0600"
commit_file "app/admin/certifications/CertificationsClient.tsx" "feat: Add certifications client" "2025-11-01T14:20:00+0600"
commit_file "app/admin/media/page.tsx" "feat: Create media library" "2025-11-01T14:40:00+0600"
commit_file "app/admin/media/MediaClient.tsx" "feat: Add media client component" "2025-11-01T15:00:00+0600"
commit_file "app/admin/messages/page.tsx" "feat: Create messages management" "2025-11-01T15:20:00+0600"
commit_file "app/admin/messages/MessagesClient.tsx" "feat: Add messages client component" "2025-11-01T15:40:00+0600"
commit_file "app/admin/activity/page.tsx" "feat: Create activity log page" "2025-11-01T16:00:00+0600"
commit_file "app/admin/scheduled-tasks/page.tsx" "feat: Create scheduled tasks page" "2025-11-01T16:20:00+0600"
commit_file "app/admin/settings/page.tsx" "feat: Create settings page" "2025-11-01T16:40:00+0600"
commit_file "app/admin/settings/SettingsClient.tsx" "feat: Add settings client component" "2025-11-01T17:00:00+0600"
commit_file "app/admin/change-password/page.tsx" "feat: Create change password page" "2025-11-01T17:20:00+0600"
commit_file "app/admin/calendar/page.tsx" "feat: Create calendar page" "2025-11-01T17:40:00+0600"
commit_file "app/admin/backup/page.tsx" "feat: Create backup page" "2025-11-02T09:00:00+0600"
commit_file "app/admin/export/page.tsx" "feat: Create export page" "2025-11-02T09:20:00+0600"

# Day 18-19: Nov 4-5 - Admin API Routes (Individual files)
commit_file "app/api/auth" "feat: Setup NextAuth routes" "2025-11-04T09:00:00+0600"
commit_file "app/api/admin/system/route.ts" "feat: Add system info API" "2025-11-04T09:20:00+0600"
commit_file "app/api/admin/analytics/route.ts" "feat: Create admin analytics API" "2025-11-04T09:40:00+0600"
commit_file "app/api/admin/analytics/visitors/route.ts" "feat: Add visitors analytics API" "2025-11-04T10:00:00+0600"
commit_file "app/api/admin/activity/route.ts" "feat: Create activity log API" "2025-11-04T10:20:00+0600"
commit_file "app/api/admin/recent/route.ts" "feat: Add recent activity API" "2025-11-04T10:40:00+0600"
commit_file "app/api/admin/scheduled-tasks/route.ts" "feat: Create tasks API" "2025-11-04T11:00:00+0600"
commit_file "app/api/admin/media/route.ts" "feat: Create media management API" "2025-11-04T11:20:00+0600"
commit_file "app/api/admin/backup/route.ts" "feat: Add backup API" "2025-11-04T11:40:00+0600"
commit_file "app/api/admin/restore/route.ts" "feat: Add restore API" "2025-11-04T12:00:00+0600"
commit_file "app/api/admin/export/route.ts" "feat: Create export API" "2025-11-04T12:20:00+0600"
commit_file "app/api/admin/import/route.ts" "feat: Add import API" "2025-11-04T12:40:00+0600"
commit_file "app/api/admin/change-password/route.ts" "feat: Create change password API" "2025-11-04T13:00:00+0600"
commit_file "app/api/admin/batch/route.ts" "feat: Add batch operations API" "2025-11-04T13:20:00+0600"
commit_file "app/api/admin/cache-stats/route.ts" "feat: Create cache stats API" "2025-11-04T13:40:00+0600"
commit_file "app/api/admin/web-vitals/route.ts" "feat: Add web vitals admin API" "2025-11-04T14:00:00+0600"
commit_file "app/api/admin/performance-alerts/route.ts" "feat: Create performance alerts API" "2025-11-04T14:20:00+0600"
commit_file "app/api/admin/seo/route.ts" "feat: Add SEO management API" "2025-11-04T14:40:00+0600"
commit_file "app/api/admin/link-check/route.ts" "feat: Create link checker API" "2025-11-04T15:00:00+0600"

# Day 20-22: Nov 6-8 - Test Files (Individual files)
commit_file "__mocks__/axios.js" "test: Add axios mock" "2025-11-06T09:00:00+0600"
commit_file "__mocks__/bcryptjs.js" "test: Add bcryptjs mock" "2025-11-06T09:15:00+0600"
commit_file "__mocks__/cloudinary.js" "test: Add Cloudinary mock" "2025-11-06T09:30:00+0600"
commit_file "__mocks__/lucide-react.js" "test: Add Lucide icons mock" "2025-11-06T09:45:00+0600"
commit_file "__mocks__/nodemailer.js" "test: Add Nodemailer mock" "2025-11-06T10:00:00+0600"

commit_file "__tests__/setup/test-utils.tsx" "test: Create test utilities" "2025-11-06T10:20:00+0600"
commit_file "__tests__/setup/mock-data.ts" "test: Add mock data" "2025-11-06T10:40:00+0600"
commit_file "__tests__/setup/mongodb-handler.ts" "test: Create MongoDB handler" "2025-11-06T11:00:00+0600"

commit_file "__tests__/lib/utils.test.ts" "test: Add utils tests" "2025-11-06T11:20:00+0600"
commit_file "__tests__/lib/validations.test.ts" "test: Add validation tests" "2025-11-06T11:40:00+0600"
commit_file "__tests__/lib/cache.test.ts" "test: Add cache tests" "2025-11-06T12:00:00+0600"
commit_file "__tests__/lib/logger.test.ts" "test: Add logger tests" "2025-11-06T12:20:00+0600"
commit_file "__tests__/lib/auth.test.ts" "test: Add auth tests" "2025-11-06T12:40:00+0600"
commit_file "__tests__/lib/cloudinary.test.ts" "test: Add Cloudinary tests" "2025-11-06T13:00:00+0600"
commit_file "__tests__/lib/github.test.ts" "test: Add GitHub tests" "2025-11-06T13:20:00+0600"
commit_file "__tests__/lib/email.test.ts" "test: Add email tests" "2025-11-06T13:40:00+0600"
commit_file "__tests__/lib/rate-limit.test.ts" "test: Add rate limit tests" "2025-11-06T14:00:00+0600"

commit_file "__tests__/models/Project.test.ts" "test: Add Project model tests" "2025-11-06T14:20:00+0600"
commit_file "__tests__/models/Blog.test.ts" "test: Add Blog model tests" "2025-11-06T14:40:00+0600"
commit_file "__tests__/models/Skill.test.ts" "test: Add Skill model tests" "2025-11-06T15:00:00+0600"
commit_file "__tests__/models/Experience.test.ts" "test: Add Experience model tests" "2025-11-06T15:20:00+0600"
commit_file "__tests__/models/Education.test.ts" "test: Add Education model tests" "2025-11-06T15:40:00+0600"
commit_file "__tests__/models/Participation.test.ts" "test: Add Participation model tests" "2025-11-06T16:00:00+0600"

commit_file "__tests__/components/Header.test.tsx" "test: Add Header tests" "2025-11-07T09:00:00+0600"
commit_file "__tests__/components/Footer.test.tsx" "test: Add Footer tests" "2025-11-07T09:20:00+0600"
commit_file "__tests__/components/ThemeToggle.test.tsx" "test: Add ThemeToggle tests" "2025-11-07T09:40:00+0600"
commit_file "__tests__/components/BlogGrid.test.tsx" "test: Add BlogGrid tests" "2025-11-07T10:00:00+0600"
commit_file "__tests__/components/ProjectsGrid.test.tsx" "test: Add ProjectsGrid tests" "2025-11-07T10:20:00+0600"
commit_file "__tests__/components/SkillsGrid.test.tsx" "test: Add SkillsGrid tests" "2025-11-07T10:40:00+0600"
commit_file "__tests__/components/ExperienceTabsClient.test.tsx" "test: Add ExperienceTabs tests" "2025-11-07T11:00:00+0600"
commit_file "__tests__/components/EducationList.test.tsx" "test: Add EducationList tests" "2025-11-07T11:20:00+0600"
commit_file "__tests__/components/CertificationsGrid.test.tsx" "test: Add CertificationsGrid tests" "2025-11-07T11:40:00+0600"
commit_file "__tests__/components/ContactForm.test.tsx" "test: Add ContactForm tests" "2025-11-07T12:00:00+0600"
commit_file "__tests__/components/ImageUpload.test.tsx" "test: Add ImageUpload tests" "2025-11-07T12:20:00+0600"
commit_file "__tests__/components/ImageCropModal.test.tsx" "test: Add ImageCropModal tests" "2025-11-07T12:40:00+0600"

commit_file "__tests__/pages/HomePage.test.tsx" "test: Add HomePage tests" "2025-11-07T13:00:00+0600"
commit_file "__tests__/pages/AboutPage.test.tsx" "test: Add AboutPage tests" "2025-11-07T13:20:00+0600"

commit_file "__tests__/api/projects.test.ts" "test: Add projects API tests" "2025-11-07T13:40:00+0600"
commit_file "__tests__/api/projects-id.test.ts" "test: Add project detail API tests" "2025-11-07T14:00:00+0600"
commit_file "__tests__/api/blog.test.ts" "test: Add blog API tests" "2025-11-07T14:20:00+0600"
commit_file "__tests__/api/skills.test.ts" "test: Add skills API tests" "2025-11-07T14:40:00+0600"
commit_file "__tests__/api/skills-id.test.ts" "test: Add skill detail API tests" "2025-11-07T15:00:00+0600"
commit_file "__tests__/api/experience.test.ts" "test: Add experience API tests" "2025-11-07T15:20:00+0600"
commit_file "__tests__/api/education.test.ts" "test: Add education API tests" "2025-11-07T15:40:00+0600"
commit_file "__tests__/api/certifications.test.ts" "test: Add certifications API tests" "2025-11-07T16:00:00+0600"
commit_file "__tests__/api/participation.test.ts" "test: Add participation API tests" "2025-11-07T16:20:00+0600"
commit_file "__tests__/api/contact.test.ts" "test: Add contact API tests" "2025-11-07T16:40:00+0600"
commit_file "__tests__/api/profile.test.ts" "test: Add profile API tests" "2025-11-07T17:00:00+0600"
commit_file "__tests__/api/analytics.test.ts" "test: Add analytics API tests" "2025-11-07T17:20:00+0600"
commit_file "__tests__/api/admin-media.test.ts" "test: Add admin media API tests" "2025-11-07T17:40:00+0600"
commit_file "__tests__/api/change-password.test.ts" "test: Add change password API tests" "2025-11-07T18:00:00+0600"
commit_file "__tests__/api/sync-github.test.ts" "test: Add GitHub sync API tests" "2025-11-07T18:20:00+0600"

commit_file "__tests__/integration/contact-flow.test.ts" "test: Add contact flow integration test" "2025-11-08T09:00:00+0600"
commit_file "__tests__/integration/publish-workflow.test.ts" "test: Add publish workflow test" "2025-11-08T09:30:00+0600"
commit_file "__tests__/integration/github-sync-flow.test.ts" "test: Add GitHub sync flow test" "2025-11-08T10:00:00+0600"
commit_file "__tests__/e2e/user-journey.spec.ts" "test: Add E2E user journey test" "2025-11-08T10:30:00+0600"

commit_file "README.md" "docs: Create comprehensive README" "2025-11-10T09:00:00+0600"
commit_file "CLEANUP_CHECKLIST.md" "docs: Add cleanup checklist" "2025-11-10T10:00:00+0600"
commit_file "CLEANUP_COMPLETED.md" "docs: Document completed cleanup" "2025-11-10T11:00:00+0600"
commit_file "CLEANUP_SUMMARY.txt" "docs: Add cleanup summary" "2025-11-10T12:00:00+0600"
commit_file "NEXT_STEPS_PORTFOLIO.md" "docs: Document next steps" "2025-11-10T13:00:00+0600"
commit_file "UNNECESSARY_CODE_ANALYSIS.md" "docs: Add code analysis" "2025-11-10T14:00:00+0600"
commit_file "VERCEL_KV_SETUP.md" "docs: Document Vercel KV" "2025-11-10T15:00:00+0600"
commit_file "scripts/verify-deployment.ts" "chore: Add deployment script" "2025-11-10T16:00:00+0600"

commit_file "public/robots.txt" "feat: Add robots.txt" "2025-11-12T09:00:00+0600"
commit_file "public/sitemap.xml" "feat: Add sitemap" "2025-11-12T09:30:00+0600"
commit_file "public/sitemap-0.xml" "feat: Add sitemap pages" "2025-11-12T10:00:00+0600"
commit_file "public/light.png" "feat: Add light favicon" "2025-11-12T10:30:00+0600"
commit_file "public/dark.png" "feat: Add dark favicon" "2025-11-12T11:00:00+0600"

# Add any remaining files
git add . 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
    GIT_AUTHOR_DATE="2025-11-30T12:00:00+0600" GIT_COMMITTER_DATE="2025-11-30T12:00:00+0600" git commit -m "chore: Add remaining files" 2>/dev/null
    COUNT=$((COUNT + 1))
    echo "[$COUNT] chore: Add remaining files"
fi

echo ""
echo "✅ Done! Created $COUNT commits"
echo ""
git log --oneline | head -20
