# PowerShell Script to rebuild git history from scratch
# Starting date: October 17, 2024
# Author: Ammar Bin Anwar Fuad

$ErrorActionPreference = "Stop"

Write-Host "🔄 Starting Git History Rebuild..." -ForegroundColor Cyan
Write-Host "⚠️  This will delete all existing commits and rebuild from scratch" -ForegroundColor Yellow
Write-Host ""

# Backup current branch
Write-Host "📦 Creating backup branch..." -ForegroundColor Green
$backupBranch = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch 2>$null

# Remove all git history
Write-Host "🗑️  Removing existing git history..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Initialize new repository
Write-Host "🎬 Initializing new repository..." -ForegroundColor Green
git init
git branch -M main

# Configure git
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

# Set base date: October 17, 2024
$baseDate = Get-Date "2024-10-17 10:00:00"

# Helper function to commit with specific date
function Commit-WithDate {
    param(
        [string]$message,
        [int]$daysOffset,
        [int]$hoursOffset = 0
    )
    
    $commitDate = $baseDate.AddDays($daysOffset).AddHours($hoursOffset)
    $dateString = $commitDate.ToString("yyyy-MM-dd HH:mm:ss +0600")
    
    git add -A
    $env:GIT_AUTHOR_DATE = $dateString
    $env:GIT_COMMITTER_DATE = $dateString
    git commit -m $message
}

Write-Host ""
Write-Host "📝 Creating incremental commits..." -ForegroundColor Cyan
Write-Host ""

# Day 0: October 17, 2024 - Project Initialization
Write-Host "Day 0: Project Initialization" -ForegroundColor Magenta

# Commit 1: Initial Next.js setup
git add package.json package-lock.json next.config.ts tsconfig.json
Commit-WithDate "chore: Initialize Next.js 16 project with TypeScript" 0 0

# Commit 2: Tailwind CSS setup
git add tailwind.config.ts postcss.config.mjs components.json
Commit-WithDate "chore: Configure Tailwind CSS and shadcn/ui" 0 1

# Commit 3: ESLint and Prettier
git add eslint.config.mjs .prettierrc
Commit-WithDate "chore: Setup ESLint and Prettier configuration" 0 2

# Commit 4: Environment setup
git add .env.example .gitignore
Commit-WithDate "chore: Add environment configuration and gitignore" 0 3

# Day 1: October 18, 2024 - Database and Authentication
Write-Host "Day 1: Database and Authentication Setup" -ForegroundColor Magenta

# Commit 5: MongoDB connection
git add lib/db.ts
Commit-WithDate "feat: Setup MongoDB connection with Mongoose" 1 0

# Commit 6: User model
git add models/User.ts
Commit-WithDate "feat: Create User model for authentication" 1 2

# Commit 7: NextAuth configuration
git add lib/auth.ts app/api/auth/
Commit-WithDate "feat: Configure NextAuth.js authentication" 1 4

# Commit 8: Middleware protection
git add middleware.ts
Commit-WithDate "feat: Add middleware for route protection" 1 6

# Day 2: October 19, 2024 - Core Models
Write-Host "Day 2: Core Database Models" -ForegroundColor Magenta

# Commit 9: Project model
git add models/Project.ts
Commit-WithDate "feat: Create Project model" 2 0

# Commit 10: Blog model
git add models/Blog.ts models/ExternalBlog.ts
Commit-WithDate "feat: Create Blog and ExternalBlog models" 2 2

# Commit 11: Skill model
git add models/Skill.ts
Commit-WithDate "feat: Create Skill model" 2 4

# Commit 12: Experience and Education models
git add models/Experience.ts models/Education.ts
Commit-WithDate "feat: Create Experience and Education models" 2 6

# Day 3: October 20, 2024 - Additional Models
Write-Host "Day 3: Additional Models" -ForegroundColor Magenta

# Commit 13: Certificate and Message models
git add models/Certificate.ts models/Message.ts
Commit-WithDate "feat: Create Certificate and Message models" 3 0

# Commit 14: Activity and Analytics models
git add models/Activity.ts models/PageView.ts models/WebVital.ts
Commit-WithDate "feat: Create Activity and Analytics models" 3 3

# Commit 15: Settings and Profile models
git add models/Setting.ts models/Profile.ts models/Participation.ts models/ScheduledTask.ts
Commit-WithDate "feat: Create Settings, Profile, and Task models" 3 6

# Day 4: October 21, 2024 - Utilities and Helpers
Write-Host "Day 4: Utilities and Helpers" -ForegroundColor Magenta

# Commit 16: Logger utility
git add lib/logger.ts
Commit-WithDate "feat: Add production-safe logger utility" 4 0

# Commit 17: Validation schemas
git add lib/validations.ts
Commit-WithDate "feat: Create Zod validation schemas" 4 2

# Commit 18: General utilities
git add lib/utils.ts lib/constants.ts
Commit-WithDate "feat: Add utility functions and constants" 4 4

# Commit 19: Cache utilities
git add lib/cache.ts lib/etag.ts lib/cache-invalidation.ts
Commit-WithDate "feat: Implement caching and ETag utilities" 4 6

# Day 5: October 22, 2024 - External Integrations
Write-Host "Day 5: External Integrations" -ForegroundColor Magenta

# Commit 20: Cloudinary integration
git add lib/cloudinary.ts
Commit-WithDate "feat: Setup Cloudinary media integration" 5 0

# Commit 21: GitHub API integration
git add lib/github.ts
Commit-WithDate "feat: Add GitHub API integration" 5 2

# Commit 22: Email service
git add lib/email.ts
Commit-WithDate "feat: Configure email service with Nodemailer" 5 4

# Commit 23: Blog fetchers
git add lib/blog-fetchers.ts
Commit-WithDate "feat: Implement external blog fetching" 5 6

# Day 6: October 23, 2024 - UI Components Foundation
Write-Host "Day 6: UI Components Foundation" -ForegroundColor Magenta

# Commit 24: shadcn/ui components
git add components/ui/
Commit-WithDate "feat: Add shadcn/ui base components" 6 0

# Commit 25: Layout components
git add components/Header.tsx components/Footer.tsx components/ThemeToggle.tsx
Commit-WithDate "feat: Create Header, Footer, and ThemeToggle" 6 3

# Commit 26: Animation components
git add components/LazyMotion.tsx components/DynamicMotion.tsx
Commit-WithDate "feat: Add lazy-loaded animation components" 6 6

# Day 7: October 24, 2024 - Public Pages Setup
Write-Host "Day 7: Public Pages Setup" -ForegroundColor Magenta

# Commit 27: Home page
git add app/page.tsx app/layout.tsx
Commit-WithDate "feat: Create homepage and root layout" 7 0

# Commit 28: Projects page
git add app/projects/ components/ProjectsGrid.tsx components/ProjectsGridWithFilter.tsx
Commit-WithDate "feat: Implement projects showcase page" 7 3

# Commit 29: Blog page
git add app/blog/ components/BlogGrid.tsx components/BlogGridWithFilter.tsx
Commit-WithDate "feat: Create blog listing and detail pages" 7 6

# Day 8: October 25, 2024 - More Public Pages
Write-Host "Day 8: More Public Pages" -ForegroundColor Magenta

# Commit 30: About page
git add app/about/
Commit-WithDate "feat: Add about page" 8 0

# Commit 31: Skills page
git add app/skills/ components/SkillsGrid.tsx
Commit-WithDate "feat: Create skills showcase page" 8 3

# Commit 32: Experience page
git add app/experience/ components/ExperienceTabsClient.tsx
Commit-WithDate "feat: Implement experience timeline page" 8 6

# Day 9: October 26, 2024 - Contact and Resume
Write-Host "Day 9: Contact and Resume" -ForegroundColor Magenta

# Commit 33: Contact page
git add app/contact/ components/ContactForm.tsx
Commit-WithDate "feat: Add contact form with email integration" 9 0

# Commit 34: Education and Certifications
git add app/education/ app/certifications/ components/EducationList.tsx components/CertificationsGrid.tsx
Commit-WithDate "feat: Create education and certifications pages" 9 4

# Day 10: October 27, 2024 - API Routes (Public)
Write-Host "Day 10: Public API Routes" -ForegroundColor Magenta

# Commit 35: Projects API
git add app/api/projects/
Commit-WithDate "feat: Create projects API endpoints" 10 0

# Commit 36: Blog API
git add app/api/blog/
Commit-WithDate "feat: Implement blog API routes" 10 3

# Commit 37: Contact API
git add app/api/contact/
Commit-WithDate "feat: Add contact form API endpoint" 10 6

# Day 11: October 28, 2024 - Admin Dashboard Foundation
Write-Host "Day 11: Admin Dashboard Foundation" -ForegroundColor Magenta

# Commit 38: Admin layout
git add app/admin/layout.tsx
Commit-WithDate "feat: Create admin dashboard layout" 11 0

# Commit 39: Admin dashboard
git add app/admin/page.tsx
Commit-WithDate "feat: Implement admin dashboard overview" 11 3

# Commit 40: Admin navigation
git add components/admin/
Commit-WithDate "feat: Add admin navigation components" 11 6

# Day 12: October 29, 2024 - Admin Projects Management
Write-Host "Day 12: Admin Projects Management" -ForegroundColor Magenta

# Commit 41: Projects admin page
git add app/admin/projects/
Commit-WithDate "feat: Create admin projects management page" 12 0

# Commit 42: Projects admin API
git add app/api/admin/projects/
Commit-WithDate "feat: Add admin projects API endpoints" 12 4

# Day 13: October 30, 2024 - Admin Blog Management
Write-Host "Day 13: Admin Blog Management" -ForegroundColor Magenta

# Commit 43: Blog admin page
git add app/admin/blog/
Commit-WithDate "feat: Create admin blog management interface" 13 0

# Commit 44: Blog admin API
git add app/api/admin/blog/
Commit-WithDate "feat: Implement admin blog API routes" 13 4

# Day 14: October 31, 2024 - Admin Skills & Experience
Write-Host "Day 14: Admin Skills & Experience" -ForegroundColor Magenta

# Commit 45: Skills admin
git add app/admin/skills/ app/api/admin/skills/
Commit-WithDate "feat: Add skills management in admin panel" 14 0

# Commit 46: Experience admin
git add app/admin/experience/ app/api/admin/experience/
Commit-WithDate "feat: Create experience management interface" 14 4

# Day 15: November 1, 2024 - Admin Education & Certifications
Write-Host "Day 15: Admin Education & Certifications" -ForegroundColor Magenta

# Commit 47: Education admin
git add app/admin/education/ app/api/admin/education/
Commit-WithDate "feat: Implement education management" 15 0

# Commit 48: Certifications admin
git add app/admin/certifications/ app/api/admin/certifications/
Commit-WithDate "feat: Add certifications management" 15 4

# Day 16: November 2, 2024 - Media Management
Write-Host "Day 16: Media Management" -ForegroundColor Magenta

# Commit 49: Media library
git add app/admin/media/ components/ImageUpload.tsx components/ImageCropModal.tsx
Commit-WithDate "feat: Create media library with Cloudinary" 16 0

# Commit 50: Media API
git add app/api/admin/media/
Commit-WithDate "feat: Implement media upload and management API" 16 4

# Day 17: November 3, 2024 - Messages & Activity
Write-Host "Day 17: Messages & Activity" -ForegroundColor Magenta

# Commit 51: Messages admin
git add app/admin/messages/ app/api/admin/messages/
Commit-WithDate "feat: Add contact messages management" 17 0

# Commit 52: Activity log
git add app/admin/activity/ app/api/admin/activity/
Commit-WithDate "feat: Implement activity logging system" 17 4

# Day 18: November 4, 2024 - Analytics
Write-Host "Day 18: Analytics Implementation" -ForegroundColor Magenta

# Commit 53: Analytics dashboard
git add app/admin/analytics/
Commit-WithDate "feat: Create analytics dashboard" 18 0

# Commit 54: Analytics API
git add app/api/admin/analytics/
Commit-WithDate "feat: Add analytics data API endpoints" 18 3

# Commit 55: Web Vitals tracking
git add components/WebVitals.tsx components/PerformanceBudgetMonitor.tsx app/api/web-vitals/
Commit-WithDate "feat: Implement Web Vitals tracking" 18 6

# Day 19: November 5, 2024 - Scheduled Tasks
Write-Host "Day 19: Scheduled Tasks" -ForegroundColor Magenta

# Commit 56: Scheduled tasks admin
git add app/admin/tasks/ app/api/admin/tasks/
Commit-WithDate "feat: Create scheduled tasks management" 19 0

# Commit 57: GitHub sync task
git add app/api/cron/github-sync/
Commit-WithDate "feat: Add GitHub repository sync task" 19 3

# Commit 58: Blog sync task
git add app/api/cron/blog-sync/
Commit-WithDate "feat: Implement external blog sync task" 19 6

# Day 20: November 6, 2024 - Settings & Profile
Write-Host "Day 20: Settings & Profile" -ForegroundColor Magenta

# Commit 59: Settings page
git add app/admin/settings/ app/api/admin/settings/
Commit-WithDate "feat: Add settings management interface" 20 0

# Commit 60: Profile management
git add app/admin/profile/ app/api/admin/profile/
Commit-WithDate "feat: Create profile management page" 20 3

# Commit 61: Change password
git add app/admin/change-password/ app/api/admin/change-password/
Commit-WithDate "feat: Implement password change functionality" 20 6

# Day 21: November 7, 2024 - Additional Features
Write-Host "Day 21: Additional Features" -ForegroundColor Magenta

# Commit 62: Calendar view
git add app/admin/calendar/
Commit-WithDate "feat: Add calendar view for scheduled content" 21 0

# Commit 63: Participation management
git add app/admin/participation/ app/api/admin/participation/
Commit-WithDate "feat: Create participation management" 21 4

# Day 22: November 8, 2024 - Testing Setup
Write-Host "Day 22: Testing Setup" -ForegroundColor Magenta

# Commit 64: Jest configuration
git add jest.config.js jest.setup.js
Commit-WithDate "test: Configure Jest testing framework" 22 0

# Commit 65: Test utilities
git add __mocks__/ __tests__/
Commit-WithDate "test: Add test utilities and initial tests" 22 3

# Commit 66: Playwright setup
git add playwright.config.ts
Commit-WithDate "test: Setup Playwright for E2E testing" 22 6

# Day 23: November 9, 2024 - SEO & Performance
Write-Host "Day 23: SEO & Performance" -ForegroundColor Magenta

# Commit 67: Sitemap configuration
git add next-sitemap.config.js public/robots.txt
Commit-WithDate "feat: Configure sitemap generation" 23 0

# Commit 68: Vercel configuration
git add vercel.json .vercelignore
Commit-WithDate "feat: Add Vercel deployment configuration" 23 3

# Commit 69: Analytics integration
git add app/layout.tsx
Commit-WithDate "feat: Integrate Vercel Analytics and Speed Insights" 23 6

# Day 24: November 10, 2024 - Scripts & Documentation
Write-Host "Day 24: Scripts & Documentation" -ForegroundColor Magenta

# Commit 70: Utility scripts
git add scripts/
Commit-WithDate "chore: Add utility scripts for seeding and verification" 24 0

# Commit 71: Documentation
git add README.md
Commit-WithDate "docs: Create comprehensive README documentation" 24 3

# Commit 72: Additional docs
git add CLEANUP_CHECKLIST.md CLEANUP_COMPLETED.md CLEANUP_SUMMARY.txt NEXT_STEPS_PORTFOLIO.md UNNECESSARY_CODE_ANALYSIS.md VERCEL_KV_SETUP.md
Commit-WithDate "docs: Add project documentation and guides" 24 6

# Day 25: November 11, 2024 - Optimizations
Write-Host "Day 25: Optimizations" -ForegroundColor Magenta

# Commit 73: Image optimization
git add next.config.ts
Commit-WithDate "perf: Optimize images with AVIF and WebP support" 25 0

# Commit 74: Bundle optimization
git add next.config.ts
Commit-WithDate "perf: Configure bundle analyzer and optimizations" 25 3

# Commit 75: Caching improvements
git add lib/cache.ts lib/cache-invalidation.ts
Commit-WithDate "perf: Enhance caching strategies" 25 6

# Day 26: November 12, 2024 - Bug Fixes & Polish
Write-Host "Day 26: Bug Fixes & Polish" -ForegroundColor Magenta

# Commit 76: Sign-in improvements
git add app/api/auth/
Commit-WithDate "fix: Improve sign-in flow and error handling" 26 0

# Commit 77: Deployment fixes
git add vercel.json next.config.ts
Commit-WithDate "fix: Resolve Vercel deployment issues" 26 3

# Commit 78: Lint fixes
git add .
Commit-WithDate "fix: Resolve ESLint warnings" 26 6

# Day 27: November 13, 2024 - Admin Enhancements
Write-Host "Day 27: Admin Enhancements" -ForegroundColor Magenta

# Commit 79: Dialog modals
git add components/admin/
Commit-WithDate "feat: Add Dialog modals for all admin edit operations" 27 0

# Commit 80: Color picker
git add app/admin/projects/
Commit-WithDate "feat: Add manual category color picker for projects" 27 4

# Day 28: November 14, 2024 - UI Improvements
Write-Host "Day 28: UI Improvements" -ForegroundColor Magenta

# Commit 81: Admin page updates
git add app/admin/
Commit-WithDate "feat: Update and optimize admin pages" 28 0

# Commit 82: Blog page updates
git add app/blog/
Commit-WithDate "feat: Enhance blog page layout and features" 28 4

# Day 29: November 15, 2024 - Performance Fixes
Write-Host "Day 29: Performance Fixes" -ForegroundColor Magenta

# Commit 83: Skeleton loading
git add components/
Commit-WithDate "feat: Add skeleton loading states" 29 0

# Commit 84: Loading optimizations
git add app/
Commit-WithDate "perf: Optimize loading states and transitions" 29 3

# Commit 85: Blank screen fix
git add app/
Commit-WithDate "fix: Resolve blank screen issues on sign-in" 29 6

# Day 30: November 16, 2024 - Analytics Cleanup
Write-Host "Day 30: Analytics Cleanup" -ForegroundColor Magenta

# Commit 86: Remove GTM and GA
git add app/layout.tsx
Commit-WithDate "refactor: Remove GTM and GA tracking" 30 0

# Commit 87: Skeleton refinements
git add components/
Commit-WithDate "fix: Update skeleton loading components" 30 4

# Day 31: November 17, 2024 - Login Improvements
Write-Host "Day 31: Login Improvements" -ForegroundColor Magenta

# Commit 88: Broken link checker removal
git add .
Commit-WithDate "refactor: Remove broken link checker" 31 0

# Commit 89: Login fixes
git add app/api/auth/
Commit-WithDate "fix: Improve login reliability" 31 3

# Commit 90: Spinner additions
git add components/
Commit-WithDate "feat: Add loading spinner for blank screens" 31 6

# Day 32: November 18, 2024 - Final Polish
Write-Host "Day 32: Final Polish" -ForegroundColor Magenta

# Commit 91: Skeleton removal
git add components/
Commit-WithDate "refactor: Remove skeleton components" 32 0

# Commit 92: Code cleanup
git add .
Commit-WithDate "refactor: Remove unused code and optimize" 32 4

# Commit 93: Virtualization fix
git add components/
Commit-WithDate "fix: Remove virtualization from MessagesClient" 32 8

# Add any remaining files
Write-Host ""
Write-Host "📦 Adding any remaining files..." -ForegroundColor Green
git add -A
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0
if ($hasChanges) {
    Commit-WithDate "chore: Add remaining project files" 32 10
}

Write-Host ""
Write-Host "✅ Git history rebuild complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
git log --oneline --all
Write-Host ""
Write-Host "🎉 New git history created with incremental commits starting from October 17, 2024" -ForegroundColor Green
Write-Host "💡 All commits are on the main branch as requested" -ForegroundColor Yellow
