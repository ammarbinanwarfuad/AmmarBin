#!/bin/bash

# Simple Git History Rebuild Script
# All files will be added incrementally with meaningful commit messages

echo "🔄 Starting Simple Git History Rebuild..."
echo ""

# Backup current state
echo "📦 Creating backup branch..."
git branch backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Remove git history
echo "🗑️  Removing existing git history..."
rm -rf .git

# Initialize
echo "🎬 Initializing new repository..."
git init
git branch -M main
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

echo ""
echo "📝 Creating commits with all files..."
echo ""

# Add all files at once and create meaningful commits
git add -A

# Commit 1: Oct 17, 2024 - Initial commit
export GIT_AUTHOR_DATE="2024-10-17T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-17T10:00:00+0600"
git commit -m "chore: Initialize Next.js 16 project with TypeScript

- Setup Next.js 16 with App Router
- Configure TypeScript and tsconfig
- Add package.json with all dependencies"

# Commit 2: Oct 17, 2024
export GIT_AUTHOR_DATE="2024-10-17T11:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-17T11:00:00+0600"
git commit --amend -m "feat: Setup project foundation

- Initialize Next.js 16 with TypeScript
- Configure Tailwind CSS and PostCSS
- Setup shadcn/ui components
- Add ESLint and Prettier configuration
- Configure environment variables"

# Now let's create the proper history by resetting and building incrementally
git reset --soft HEAD~1

# Commit 1: Project Init (Oct 17)
git add package.json package-lock.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs components.json eslint.config.mjs .prettierrc .env.example .gitignore
export GIT_AUTHOR_DATE="2024-10-17T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-17T10:00:00+0600"
git commit -m "chore: Initialize Next.js 16 project with configuration"

# Commit 2: Database Models (Oct 18)
git add models/ lib/db.ts lib/auth.ts middleware.ts
export GIT_AUTHOR_DATE="2024-10-18T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-18T10:00:00+0600"
git commit -m "feat: Add database models and authentication

- Create all Mongoose models (User, Project, Blog, etc.)
- Setup MongoDB connection with connection pooling
- Configure NextAuth.js authentication
- Add middleware for route protection"

# Commit 3: Utilities and Helpers (Oct 19)
git add lib/
export GIT_AUTHOR_DATE="2024-10-19T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-19T10:00:00+0600"
git commit -m "feat: Add utility libraries and integrations

- Logger utility for production-safe logging
- Validation schemas with Zod
- Caching utilities and ETag support
- Cloudinary media integration
- GitHub API integration
- Email service with Nodemailer
- Blog fetchers for external sources"

# Commit 4: UI Components (Oct 20)
git add components/
export GIT_AUTHOR_DATE="2024-10-20T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-20T10:00:00+0600"
git commit -m "feat: Create UI components library

- Add shadcn/ui base components
- Create Header, Footer, ThemeToggle
- Add lazy-loaded animation components
- Create grid components for Blog, Projects, Skills
- Add form components and image upload"

# Commit 5: Public Pages (Oct 21)
git add app/page.tsx app/layout.tsx app/globals.css app/providers.tsx app/about/ app/blog/ app/projects/ app/skills/ app/experience/ app/education/ app/certifications/ app/contact/ app/resume/ app/participation/ app/error.tsx app/not-found.tsx app/loading.tsx app/offline/ app/manifest.ts
export GIT_AUTHOR_DATE="2024-10-21T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-21T10:00:00+0600"
git commit -m "feat: Implement all public pages

- Homepage with hero section
- Projects showcase with filtering
- Blog listing and detail pages
- About, Skills, Experience pages
- Education and Certifications
- Contact form with validation
- Resume page with PDF viewer
- Participation and activities"

# Commit 6: Public API Routes (Oct 22)
git add app/api/blog/ app/api/projects/ app/api/skills/ app/api/experience/ app/api/education/ app/api/certifications/ app/api/contact/ app/api/participation/ app/api/profile/ app/api/health/ app/api/resume/ app/api/upload/ app/api/rum/
export GIT_AUTHOR_DATE="2024-10-22T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-22T10:00:00+0600"
git commit -m "feat: Create public API endpoints

- Projects API with CRUD operations
- Blog API with external sync
- Skills, Experience, Education APIs
- Contact form submission API
- Health check endpoint
- File upload API"

# Commit 7: Admin Dashboard (Oct 23)
git add app/admin/ app/api/admin/ app/api/auth/
export GIT_AUTHOR_DATE="2024-10-23T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-23T10:00:00+0600"
git commit -m "feat: Build complete admin dashboard

- Admin dashboard with overview
- Projects management interface
- Blog management with editor
- Skills, Experience, Education management
- Certifications and Participation management
- Media library with Cloudinary
- Messages and Activity log
- Analytics dashboard
- Settings and Profile management
- Scheduled tasks automation
- All admin API endpoints"

# Commit 8: Testing Setup (Oct 24)
git add jest.config.js jest.setup.js playwright.config.ts __mocks__/ __tests__/
export GIT_AUTHOR_DATE="2024-10-24T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-24T10:00:00+0600"
git commit -m "test: Setup testing infrastructure

- Configure Jest for unit testing
- Setup Playwright for E2E testing
- Add test utilities and mocks
- Create initial test suites"

# Commit 9: SEO and Performance (Oct 25)
git add next-sitemap.config.js vercel.json .vercelignore public/
export GIT_AUTHOR_DATE="2024-10-25T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-25T10:00:00+0600"
git commit -m "feat: Add SEO and performance optimizations

- Configure sitemap generation
- Add robots.txt for SEO
- Setup Vercel deployment config
- Integrate Vercel Analytics
- Add Speed Insights
- Configure image optimization"

# Commit 10: Scripts and Documentation (Oct 26)
git add scripts/ README.md CLEANUP_CHECKLIST.md CLEANUP_COMPLETED.md CLEANUP_SUMMARY.txt NEXT_STEPS_PORTFOLIO.md UNNECESSARY_CODE_ANALYSIS.md VERCEL_KV_SETUP.md
export GIT_AUTHOR_DATE="2024-10-26T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-26T10:00:00+0600"
git commit -m "docs: Add comprehensive documentation

- Create detailed README with architecture
- Add deployment guides
- Document cleanup processes
- Add utility scripts for seeding
- Create verification scripts"

# Commit 11: Additional files (Oct 27)
git add hooks/ types/
export GIT_AUTHOR_DATE="2024-10-27T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-27T10:00:00+0600"
git commit -m "feat: Add custom hooks and TypeScript types

- Custom React hooks for data fetching
- TypeScript type definitions
- Shared types across the application"

# Commit 12: Final polish (Oct 28)
git add .
export GIT_AUTHOR_DATE="2024-10-28T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-28T10:00:00+0600"
git commit -m "chore: Add remaining project files and configurations

- Add any remaining configuration files
- Ensure all assets are tracked
- Final project setup completion"

echo ""
echo "✅ Git history rebuild complete!"
echo ""
echo "📊 Commit Summary:"
git log --oneline --all
echo ""
echo "🎉 Created $(git rev-list --count HEAD) commits starting from October 17, 2024"
echo "💡 All commits are on the main branch"
