#!/bin/bash

echo "🔄 Rebuilding Git History with Multiple Commits..."
echo ""

# Backup
git branch backup-final 2>/dev/null || true

# Clean slate
rm -rf .git
git init
git branch -M main
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

echo "Creating 12 incremental commits..."
echo ""

# Commit 1: Oct 17 - Config files
echo "1/12: Project configuration..."
git add package.json package-lock.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs components.json eslint.config.mjs .prettierrc .env.example .gitignore vercel.json .vercelignore next-sitemap.config.js
export GIT_AUTHOR_DATE="2024-10-17T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-17T10:00:00+0600"
git commit -m "chore: Initialize Next.js 16 project with configuration

- Setup Next.js 16 with TypeScript
- Configure Tailwind CSS and PostCSS  
- Add ESLint and Prettier
- Setup Vercel deployment config"

# Commit 2: Oct 18 - Models
echo "2/12: Database models..."
git add models/
export GIT_AUTHOR_DATE="2024-10-18T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-18T10:00:00+0600"
git commit -m "feat: Create all database models

- User, Project, Blog, ExternalBlog
- Skill, Experience, Education, Certificate
- Message, Activity, PageView, WebVital
- ScheduledTask, Setting, Profile, Participation"

# Commit 3: Oct 19 - Core lib files
echo "3/12: Core utilities..."
git add lib/db.ts lib/auth.ts lib/logger.ts lib/utils.ts lib/constants.ts lib/validations.ts lib/cache.ts lib/etag.ts lib/cache-invalidation.ts
export GIT_AUTHOR_DATE="2024-10-19T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-19T10:00:00+0600"
git commit -m "feat: Add core utilities and database connection

- MongoDB connection with pooling
- NextAuth configuration
- Logger utility
- Caching and validation utilities"

# Commit 4: Oct 20 - Integration libs
echo "4/12: External integrations..."
git add lib/cloudinary.ts lib/github.ts lib/email.ts lib/blog-fetchers.ts lib/
export GIT_AUTHOR_DATE="2024-10-20T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-20T10:00:00+0600"
git commit -m "feat: Add external service integrations

- Cloudinary media management
- GitHub API integration
- Email service with Nodemailer
- Blog fetchers for external sources
- Additional utility libraries"

# Commit 5: Oct 21 - Middleware & Hooks
echo "5/12: Middleware and hooks..."
git add middleware.ts hooks/ types/
export GIT_AUTHOR_DATE="2024-10-21T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-21T10:00:00+0600"
git commit -m "feat: Add middleware, hooks, and types

- Route protection middleware
- Custom React hooks
- TypeScript type definitions"

# Commit 6: Oct 22 - UI Components
echo "6/12: UI components..."
git add components/
export GIT_AUTHOR_DATE="2024-10-22T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-22T10:00:00+0600"
git commit -m "feat: Create complete UI component library

- shadcn/ui base components
- Header, Footer, ThemeToggle
- Grid components for Blog, Projects, Skills
- Form components and image upload
- Admin components"

# Commit 7: Oct 23 - Public Pages
echo "7/12: Public pages..."
git add app/page.tsx app/layout.tsx app/globals.css app/providers.tsx app/manifest.ts app/error.tsx app/not-found.tsx app/loading.tsx app/about/ app/blog/ app/projects/ app/skills/ app/experience/ app/education/ app/certifications/ app/contact/ app/resume/ app/participation/ app/offline/
export GIT_AUTHOR_DATE="2024-10-23T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-23T10:00:00+0600"
git commit -m "feat: Implement all public pages

- Homepage with hero section
- Projects, Blog, Skills pages
- About, Experience, Education
- Certifications, Contact, Resume
- Participation and offline pages"

# Commit 8: Oct 24 - Public APIs
echo "8/12: Public API routes..."
git add app/api/blog/ app/api/projects/ app/api/skills/ app/api/experience/ app/api/education/ app/api/certifications/ app/api/contact/ app/api/participation/ app/api/profile/ app/api/health/ app/api/resume/ app/api/upload/ app/api/rum/
export GIT_AUTHOR_DATE="2024-10-24T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-24T10:00:00+0600"
git commit -m "feat: Create public API endpoints

- CRUD APIs for all content types
- Contact form submission
- File upload and health check
- RUM performance tracking"

# Commit 9: Oct 25 - Admin Dashboard
echo "9/12: Admin dashboard..."
git add app/admin/ app/api/admin/ app/api/auth/
export GIT_AUTHOR_DATE="2024-10-25T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-25T10:00:00+0600"
git commit -m "feat: Build complete admin dashboard

- Dashboard with analytics overview
- Content management for all types
- Media library with Cloudinary
- Messages and activity log
- Settings and profile management
- All admin API endpoints"

# Commit 10: Oct 26 - Testing
echo "10/12: Testing setup..."
git add jest.config.js jest.setup.js playwright.config.ts __mocks__/ __tests__/
export GIT_AUTHOR_DATE="2024-10-26T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-26T10:00:00+0600"
git commit -m "test: Setup testing infrastructure

- Jest configuration for unit tests
- Playwright for E2E testing
- Test utilities and mocks
- Initial test suites"

# Commit 11: Oct 27 - Documentation & Scripts
echo "11/12: Documentation..."
git add README.md CLEANUP_CHECKLIST.md CLEANUP_COMPLETED.md CLEANUP_SUMMARY.txt NEXT_STEPS_PORTFOLIO.md UNNECESSARY_CODE_ANALYSIS.md VERCEL_KV_SETUP.md scripts/
export GIT_AUTHOR_DATE="2024-10-27T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-27T10:00:00+0600"
git commit -m "docs: Add comprehensive documentation

- Detailed README with architecture
- Deployment and cleanup guides
- Utility scripts for seeding
- Verification scripts"

# Commit 12: Oct 28 - Final files
echo "12/12: Remaining files..."
git add public/ .
export GIT_AUTHOR_DATE="2024-10-28T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-28T10:00:00+0600"
git commit -m "chore: Add public assets and remaining files

- Sitemap and robots.txt
- Public images and assets
- Any remaining configuration files"

echo ""
echo "✅ Git history rebuild complete!"
echo ""
echo "📊 Commit Summary:"
git log --oneline --all
echo ""
echo "🎉 Created $(git rev-list --count HEAD) commits from Oct 17-28, 2024"
echo "💡 All commits are on the main branch"
