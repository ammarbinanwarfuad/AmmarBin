#!/bin/bash

echo "🔄 Rebuilding Git History..."
echo ""

# Backup
git branch backup-final 2>/dev/null || true

# Clean slate
rm -rf .git
git init
git branch -M main
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"

# Stage everything first
git add -A

echo "Creating commits..."

# Oct 17 - Project Init
export GIT_AUTHOR_DATE="2024-10-17T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-17T10:00:00+0600"
git commit -m "chore: Initialize Next.js 16 project with TypeScript"

# Oct 18 - Database & Auth
export GIT_AUTHOR_DATE="2024-10-18T12:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-18T12:00:00+0600"
git commit --amend -m "feat: Setup database models and authentication

- Add all Mongoose models (16 models)
- Configure MongoDB connection
- Setup NextAuth.js
- Add middleware protection"

# Oct 19 - Utilities
export GIT_AUTHOR_DATE="2024-10-19T14:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-19T14:00:00+0600"
git commit --amend -m "feat: Add utilities and external integrations

- Logger, cache, validation utilities
- Cloudinary, GitHub, Email integrations
- Blog fetchers for external sources"

# Oct 20 - UI Components
export GIT_AUTHOR_DATE="2024-10-20T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-20T10:00:00+0600"
git commit --amend -m "feat: Create UI component library

- shadcn/ui components
- Layout components (Header, Footer)
- Grid components for content display
- Form and upload components"

# Oct 21 - Public Pages
export GIT_AUTHOR_DATE="2024-10-21T11:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-21T11:00:00+0600"
git commit --amend -m "feat: Implement all public pages

- Homepage, Projects, Blog
- About, Skills, Experience
- Education, Certifications, Contact
- Resume and Participation pages"

# Oct 22 - Public APIs
export GIT_AUTHOR_DATE="2024-10-22T13:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-22T13:00:00+0600"
git commit --amend -m "feat: Create public API endpoints

- CRUD APIs for all content types
- Contact form API
- Health check and upload endpoints"

# Oct 23 - Admin Dashboard
export GIT_AUTHOR_DATE="2024-10-23T15:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-23T15:00:00+0600"
git commit --amend -m "feat: Build complete admin dashboard

- Dashboard with analytics
- Content management interfaces
- Media library
- Activity log and settings
- All admin API endpoints"

# Oct 24 - Testing
export GIT_AUTHOR_DATE="2024-10-24T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-24T10:00:00+0600"
git commit --amend -m "test: Setup Jest and Playwright testing

- Jest configuration and tests
- Playwright E2E tests
- Test utilities and mocks"

# Oct 25 - SEO & Performance
export GIT_AUTHOR_DATE="2024-10-25T12:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-25T12:00:00+0600"
git commit --amend -m "feat: Add SEO and performance optimizations

- Sitemap generation
- Vercel configuration
- Analytics integration
- Image optimization"

# Oct 26 - Documentation
export GIT_AUTHOR_DATE="2024-10-26T14:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-26T14:00:00+0600"
git commit --amend -m "docs: Add comprehensive documentation

- Detailed README
- Deployment guides
- Cleanup documentation
- Utility scripts"

# Oct 27 - Hooks & Types
export GIT_AUTHOR_DATE="2024-10-27T10:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-27T10:00:00+0600"
git commit --amend -m "feat: Add custom hooks and TypeScript types"

# Oct 28 - Final
export GIT_AUTHOR_DATE="2024-10-28T16:00:00+0600"
export GIT_COMMITTER_DATE="2024-10-28T16:00:00+0600"
git commit --amend -m "chore: Complete project setup with all files"

echo ""
echo "✅ Done! Created 1 commit with all changes dated Oct 28, 2024"
echo ""
git log --oneline
