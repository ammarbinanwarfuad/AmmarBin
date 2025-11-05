# Portfolio Website - Modern Full-Stack Portfolio Application

A comprehensive, high-performance portfolio website built with Next.js 16, React 19, TypeScript, and MongoDB. Features a complete admin dashboard for content management, blog integration, GitHub project synchronization, and real-time analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Component Architecture](#component-architecture)
- [Data Models](#data-models)
- [Admin Dashboard](#admin-dashboard)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is a modern, full-featured portfolio website that showcases projects, skills, education, experience, certifications, and blog posts. It includes a comprehensive admin dashboard for managing all content, with features like:

- **Content Management System (CMS)**: Full CRUD operations for all portfolio content
- **Blog Integration**: Sync with Hashnode and RSS feeds (GUCC blog)
- **GitHub Integration**: Automatically sync projects from GitHub repositories
- **Analytics Dashboard**: Track page views, user interactions, and performance metrics
- **Media Management**: Upload and optimize images using Cloudinary
- **Authentication**: Secure admin login with NextAuth.js
- **Performance Monitoring**: Real-time Core Web Vitals tracking
- **SEO Optimization**: Dynamic sitemaps, metadata, and OpenGraph tags

## ✨ Features

### Public Features

- **Portfolio Showcase**: Display projects, skills, education, experience, certifications, and participation
- **Blog System**: Integrated blog with support for internal posts and external sources (Hashnode, RSS)
- **Contact Form**: Email notifications for contact form submissions
- **Resume Download**: PDF resume download functionality
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first responsive design
- **Performance Optimized**: Lazy loading, image optimization, code splitting

### Admin Features

- **Dashboard**: Overview of all content with statistics and recent activities
- **Content Management**: 
  - Projects (with GitHub sync)
  - Blog posts (with external source sync)
  - Skills
  - Experience
  - Education
  - Certifications
  - Participation/Programs
  - Profile information
- **Message Management**: View and manage contact form submissions
- **Analytics**: 
  - Page view analytics
  - Visitor statistics
  - Performance metrics (Core Web Vitals)
- **Backup & Restore**: Database backup and restore functionality
- **Import/Export**: JSON import/export for content migration
- **Media Library**: Upload and manage images
- **Activity Log**: Track all admin actions
- **Scheduled Tasks**: Manage background jobs and scheduled tasks
- **SEO Tools**: SEO analysis and optimization
- **System Information**: View system stats and health
- **Link Checker**: Verify external links
- **Password Management**: Change admin password with validation

### Performance Features

- **Image Optimization**: Cloudinary integration with automatic format conversion (AVIF, WebP)
- **Code Splitting**: Dynamic imports and route-based code splitting
- **SWR Caching**: Client-side data fetching with caching and revalidation
- **Server-Side Rendering (SSR)**: Optimized SSR for better SEO and performance
- **Bundle Optimization**: Webpack bundle analysis and optimization
- **Lazy Loading**: Components and images loaded on demand
- **Database Indexing**: Optimized MongoDB queries with proper indexes
- **CDN Integration**: Cloudinary CDN for asset delivery

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.548.0
- **Forms**: React Hook Form 7.65.0 + Zod 4.1.12
- **State Management**: SWR 2.3.6
- **Notifications**: React Hot Toast 2.6.0
- **Markdown**: React Markdown 10.1.0
- **Theme**: next-themes 0.4.6

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose 8.19.2
- **Authentication**: NextAuth.js 4.24.7
- **File Upload**: Cloudinary 2.8.0
- **Email**: Nodemailer 7.0.10
- **Validation**: Zod 4.1.12
- **Password Hashing**: bcryptjs 3.0.2

### DevOps & Tools

- **Analytics**: Vercel Analytics, Google Analytics, Google Tag Manager
- **Performance**: Web Vitals, Vercel Speed Insights
- **SEO**: next-sitemap 4.2.3
- **Image Processing**: Sharp 0.34.4
- **RSS Parsing**: rss-parser 3.13.0
- **HTTP Client**: Axios 1.13.0
- **Bundle Analysis**: @next/bundle-analyzer

## 📁 Project Structure

```
portfolio/
├── app/                          # Next.js App Router pages
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard pages
│   │   ├── activity/             # Activity log
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── backup/               # Backup management
│   │   ├── blog/                 # Blog management
│   │   ├── calendar/             # Calendar view
│   │   ├── certifications/       # Certifications management
│   │   ├── change-password/      # Password change
│   │   ├── dashboard/            # Main dashboard
│   │   ├── education/            # Education management
│   │   ├── experience/           # Experience management
│   │   ├── export/               # Data export
│   │   ├── login/                # Admin login
│   │   ├── media/                # Media library
│   │   ├── messages/             # Contact messages
│   │   ├── projects/             # Projects management
│   │   ├── scheduled-tasks/      # Task scheduling
│   │   ├── settings/             # Settings
│   │   ├── skills/               # Skills management
│   │   ├── error.tsx             # Error boundary
│   │   ├── loading.tsx           # Loading state
│   │   └── layout.tsx            # Admin layout
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── blog/                 # Blog API
│   │   ├── certifications/       # Certifications API
│   │   ├── contact/              # Contact form API
│   │   ├── education/            # Education API
│   │   ├── experience/           # Experience API
│   │   ├── participation/        # Participation API
│   │   ├── profile/              # Profile API
│   │   ├── projects/             # Projects API
│   │   ├── resume/               # Resume API
│   │   ├── rum/                  # Real User Monitoring
│   │   ├── skills/               # Skills API
│   │   └── upload/               # File upload API
│   ├── blog/                     # Blog pages
│   ├── certifications/           # Certifications page
│   ├── contact/                  # Contact page
│   ├── education/                # Education page
│   ├── experience/               # Experience page
│   ├── participation/            # Participation page
│   ├── projects/                 # Projects page
│   ├── resume/                   # Resume page
│   ├── skills/                   # Skills page
│   ├── animations.css            # Animation styles
│   ├── error.tsx                 # Global error boundary
│   ├── favicon.ico               # Favicon
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Global loading state
│   ├── not-found.tsx             # 404 page
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # Context providers
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── skeleton.tsx
│   │   └── textarea.tsx
│   ├── AboutContent.tsx          # About section
│   ├── AnalyticsTracker.tsx      # Analytics tracking
│   ├── AutoLogout.tsx            # Session management
│   ├── BlogGrid.tsx              # Blog grid display
│   ├── CertificationsGrid.tsx    # Certifications grid
│   ├── ClientPerformanceMonitor.tsx # Performance monitoring
│   ├── DeferredAnalytics.tsx     # Deferred analytics load
│   ├── EducationList.tsx         # Education list
│   ├── ExperienceTabs.tsx        # Experience tabs
│   ├── Footer.tsx                # Footer component
│   ├── GoogleAnalytics.tsx       # Google Analytics
│   ├── GoogleTagManager.tsx      # GTM integration
│   ├── Header.tsx                # Navigation header
│   ├── HeroContent.tsx           # Hero section
│   ├── HeroSkeleton.tsx          # Hero loading skeleton
│   ├── ImageCropModal.tsx        # Image cropping modal
│   ├── ImageUpload.tsx           # Image upload component
│   ├── LazyMotion.tsx            # Framer Motion lazy load
│   ├── LCPImagePreload.tsx       # LCP image preloading
│   ├── PDFViewer.tsx             # PDF viewer
│   ├── ProjectsGrid.tsx          # Projects grid
│   ├── ProjectsSkeleton.tsx      # Projects loading skeleton
│   ├── SkillsGrid.tsx            # Skills grid
│   ├── ThemeToggle.tsx           # Theme switcher
│   └── WebVitals.tsx             # Web Vitals component
├── lib/                          # Utility libraries
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAdminData.ts       # Admin data hooks
│   │   └── usePublicData.ts      # Public data hooks
│   ├── server/                   # Server-side utilities
│   │   └── data.ts               # Server data fetching
│   ├── activity-logger.ts        # Activity logging
│   ├── auth.ts                   # NextAuth configuration
│   ├── blog-fetchers.ts          # Blog fetching utilities
│   ├── blur-placeholder.ts       # Image blur placeholders
│   ├── cloudinary.ts             # Cloudinary integration
│   ├── constants.ts              # App constants
│   ├── db-init.ts                # Database initialization
│   ├── db.ts                     # Database connection
│   ├── email.ts                  # Email utilities
│   ├── error-tracker.ts          # Error tracking
│   ├── fetcher.ts                # SWR fetcher
│   ├── github.ts                 # GitHub API integration
│   ├── password-validator.ts     # Password validation
│   ├── performance-monitor.ts    # Performance monitoring
│   ├── rate-limit.ts             # Rate limiting
│   ├── server-timing.ts          # Server timing headers
│   ├── swrLocalStorageProvider.ts # SWR localStorage provider
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod schemas
├── models/                       # MongoDB models
│   ├── Activity.ts               # Activity log model
│   ├── Blog.ts                   # Blog post model
│   ├── Certificate.ts            # Certificate model
│   ├── Education.ts              # Education model
│   ├── Experience.ts             # Experience model
│   ├── ExternalBlog.ts           # External blog model
│   ├── Message.ts                # Contact message model
│   ├── PageView.ts               # Page view analytics model
│   ├── Participation.ts          # Participation model
│   ├── Profile.ts                # Profile model
│   ├── Project.ts                # Project model
│   ├── ScheduledTask.ts          # Scheduled task model
│   ├── Setting.ts                # Settings model
│   ├── Skill.ts                  # Skill model
│   ├── User.ts                   # User model
│   └── WebVital.ts               # Web Vitals model
├── public/                       # Static assets
│   ├── robots.txt                # Robots.txt
│   ├── sitemap.xml               # Sitemap
│   └── *.svg                     # SVG icons
├── scripts/                      # Utility scripts
│   └── seed.ts                   # Database seeding script
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── .env.example                  # Environment variables example
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui config
├── eslint.config.mjs             # ESLint configuration
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── next-sitemap.config.js        # Sitemap configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- GitHub Personal Access Token (optional, for GitHub sync)
- Email service credentials (optional, for contact form)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up the database**
   - Create a MongoDB database (local or Atlas)
   - Update `MONGODB_URI` in `.env.local`

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/portfolio
# or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Optional

```env
# Email Configuration (for contact form)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@example.com

# GitHub Integration (for project sync)
GITHUB_PAT=your-github-personal-access-token
GITHUB_USERNAME=your-github-username

# Blog Integration
HASHNODE_BLOG_URL=your-blog.hashnode.dev
GUCC_BLOG_URL=https://gucc.green.edu.bd/blog

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Site Configuration
SITE_URL=https://yourdomain.com
```

## 🗄 Database Setup

### MongoDB Connection

The application uses Mongoose for MongoDB connection management. The database connection is configured in `lib/db.ts` with connection pooling and optimization.

### Database Models

The application includes the following models:

1. **User**: Admin user authentication
2. **Profile**: Portfolio owner information
3. **Project**: Portfolio projects
4. **Skill**: Technical skills
5. **Experience**: Work experience
6. **Education**: Educational qualifications
7. **Certificate**: Certifications
8. **Participation**: Programs and activities
9. **Blog**: Internal blog posts
10. **ExternalBlog**: External blog posts (Hashnode, RSS)
11. **Message**: Contact form submissions
12. **Activity**: Admin activity logs
13. **PageView**: Page view analytics
14. **WebVital**: Performance metrics
15. **ScheduledTask**: Background jobs
16. **Setting**: Application settings

### Database Seeding

Run the seed script to populate initial data:

```bash
npm run seed
```

This creates:
- Default admin user (email: `admin@example.com`, password: `admin123`)
- Sample profile data
- Sample projects, skills, and other content

**⚠️ Important**: Change the default admin password after first login!

## 💻 Development

### Development Server

```bash
npm run dev
```

Runs the app in development mode with Turbopack at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `.next` folder.

### Starting Production Server

```bash
npm start
```

Starts the production server (requires `npm run build` first).

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality.

### Bundle Analysis

```bash
npm run analyze
```

Analyzes the bundle size and identifies optimization opportunities.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Public API Endpoints

- `GET /api/profile` - Get profile information
- `GET /api/projects` - Get all published projects
- `GET /api/projects/[id]` - Get project by ID
- `GET /api/skills` - Get all skills
- `GET /api/blog` - Get all published blog posts
- `GET /api/blog?slug=[slug]` - Get blog post by slug
- `GET /api/experience` - Get all experience entries
- `GET /api/education` - Get all education entries
- `GET /api/certifications` - Get all published certifications
- `GET /api/participation` - Get all participation entries
- `POST /api/contact` - Submit contact form
- `GET /api/resume/download` - Download resume PDF

### Admin API Endpoints

All admin endpoints require authentication via NextAuth.

#### Projects
- `GET /api/projects` - Get all projects (including unpublished)
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/bulk-delete` - Bulk delete projects
- `POST /api/projects/sync-github` - Sync projects from GitHub
- `POST /api/projects/[id]/publish` - Publish/unpublish project

#### Blog
- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create blog post
- `PUT /api/blog/[id]` - Update blog post
- `DELETE /api/blog/[id]` - Delete blog post
- `POST /api/blog/bulk-delete` - Bulk delete posts
- `POST /api/blog/sync` - Sync from external sources
- `POST /api/blog/auto-publish` - Auto-publish blog posts

#### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/[id]` - Update skill
- `DELETE /api/skills/[id]` - Delete skill
- `POST /api/skills/bulk-delete` - Bulk delete skills

#### Experience, Education, Certifications, Participation
Similar CRUD endpoints as above.

#### Admin Features
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/activity` - Activity logs
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/analytics/visitors` - Visitor statistics
- `POST /api/admin/backup` - Create database backup
- `POST /api/admin/restore` - Restore from backup
- `POST /api/admin/export` - Export data as JSON
- `POST /api/admin/import` - Import data from JSON
- `POST /api/admin/change-password` - Change admin password
- `GET /api/admin/media` - Get media library
- `POST /api/admin/media` - Upload media
- `DELETE /api/admin/media` - Delete media
- `GET /api/admin/web-vitals` - Web Vitals metrics
- `GET /api/admin/system` - System information
- `POST /api/admin/link-check` - Check external links
- `GET /api/admin/scheduled-tasks` - Get scheduled tasks
- `POST /api/admin/scheduled-tasks` - Create scheduled task

### File Upload

- `POST /api/upload` - Upload file to Cloudinary

### Analytics

- `POST /api/analytics/track` - Track page view
- `POST /api/rum` - Submit Real User Monitoring data

## 🧩 Component Architecture

### UI Components (`components/ui/`)

Built with shadcn/ui and Radix UI:
- `alert-dialog.tsx` - Alert dialog component
- `alert.tsx` - Alert component
- `button.tsx` - Button component
- `card.tsx` - Card component
- `command.tsx` - Command palette
- `dialog.tsx` - Dialog/modal component
- `input.tsx` - Input field
- `label.tsx` - Form label
- `popover.tsx` - Popover component
- `skeleton.tsx` - Loading skeleton
- `textarea.tsx` - Textarea component

### Feature Components

- `Header.tsx` - Navigation header with theme toggle
- `Footer.tsx` - Footer component
- `HeroContent.tsx` - Hero section with profile
- `ProjectsGrid.tsx` - Grid display for projects
- `SkillsGrid.tsx` - Skills display grid
- `BlogGrid.tsx` - Blog posts grid
- `CertificationsGrid.tsx` - Certifications grid
- `ExperienceTabs.tsx` - Experience timeline
- `EducationList.tsx` - Education list
- `ImageUpload.tsx` - Image upload with preview
- `ImageCropModal.tsx` - Image cropping interface
- `PDFViewer.tsx` - PDF viewer component
- `ThemeToggle.tsx` - Dark/light theme switcher

### Performance Components

- `LazyMotion.tsx` - Lazy-loaded Framer Motion
- `LCPImagePreload.tsx` - Largest Contentful Paint optimization
- `DeferredAnalytics.tsx` - Deferred analytics loading
- `ClientPerformanceMonitor.tsx` - Client-side performance monitoring
- `WebVitals.tsx` - Web Vitals tracking

### Analytics Components

- `AnalyticsTracker.tsx` - Page view tracking
- `GoogleAnalytics.tsx` - Google Analytics integration
- `GoogleTagManager.tsx` - GTM integration

## 📊 Data Models

### Profile Model

```typescript
{
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  resumePDF: string;
  email: string;
  phone?: string;
  location?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    hashnode?: string;
    portfolio?: string;
  };
  heroContent: {
    heading: string;
    subheading: string;
    description: string;
  };
  aboutContent: string;
  languages: string[];
  hobbies: string[];
}
```

### Project Model

```typescript
{
  title: string;
  slug: string;
  description: string;
  image: string;
  techStack: string[];
  topics?: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  featured: boolean;
  published: boolean;
  source: "manual" | "github";
  dateCreated: Date;
}
```

### Blog Model

```typescript
{
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedDate: Date;
  readTime: number;
  views: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}
```

See `types/index.ts` for complete type definitions.

## 🎛 Admin Dashboard

### Access

Navigate to `/admin/login` and use your admin credentials.

### Features

1. **Dashboard** (`/admin/dashboard`)
   - Overview statistics
   - Recent activities
   - Quick actions
   - Performance metrics

2. **Content Management**
   - Projects: Create, edit, delete, publish projects. Sync from GitHub.
   - Blog: Manage blog posts, sync from Hashnode/RSS
   - Skills: Manage technical skills
   - Experience: Manage work experience
   - Education: Manage educational qualifications
   - Certifications: Manage certifications with expiry dates
   - Participation: Manage programs and activities

3. **Messages** (`/admin/messages`)
   - View contact form submissions
   - Mark as read/replied
   - Bulk actions

4. **Analytics** (`/admin/analytics`)
   - Page view statistics
   - Visitor analytics
   - Performance metrics
   - Web Vitals data

5. **Media Library** (`/admin/media`)
   - Upload images
   - Manage uploaded files
   - Delete unused assets

6. **Backup & Restore** (`/admin/backup`)
   - Create database backups
   - Restore from backup
   - Export/import data

7. **Settings** (`/admin/settings`)
   - Application settings
   - System information
   - SEO configuration

8. **Activity Log** (`/admin/activity`)
   - View all admin actions
   - Filter by action type
   - Search activities

9. **Scheduled Tasks** (`/admin/scheduled-tasks`)
   - Manage background jobs
   - Schedule blog syncs
   - Automated tasks

## ⚡ Performance Optimizations

### Image Optimization

- **Cloudinary Integration**: Automatic format conversion (AVIF, WebP)
- **Responsive Images**: Multiple sizes for different devices
- **Lazy Loading**: Images loaded on demand
- **Blur Placeholders**: Show blur placeholders while loading
- **LCP Optimization**: Preload Largest Contentful Paint images

### Code Optimization

- **Code Splitting**: Route-based and dynamic imports
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Monitor bundle sizes
- **Module Optimization**: Optimize package imports (lucide-react, framer-motion)
- **Webpack Configuration**: Custom chunk splitting

### Database Optimization

- **Connection Pooling**: MongoDB connection pooling
- **Indexes**: Strategic database indexes for fast queries
- **Lean Queries**: Use `.lean()` for faster queries
- **Query Timeouts**: Set maxTimeMS for query performance
- **Selective Fields**: Only fetch needed fields

### Caching Strategy

- **SWR Caching**: Client-side data caching with revalidation
- **LocalStorage Provider**: Persist cache across reloads
- **Server-Side Caching**: Strategic use of Next.js caching

### Performance Monitoring

- **Core Web Vitals**: Track LCP, FID, CLS, TTFB, INP
- **Real User Monitoring (RUM)**: Collect performance data from users
- **Server Timing Headers**: Track server-side performance
- **Bundle Analysis**: Regular bundle size monitoring

### SEO Optimizations

- **Dynamic Sitemaps**: Auto-generated sitemaps
- **Metadata**: Dynamic metadata for each page
- **OpenGraph Tags**: Social media sharing optimization
- **Structured Data**: JSON-LD structured data
- **Robots.txt**: Proper robots.txt configuration

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Vercel automatically detects Next.js and optimizes the deployment.

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Configure build command and publish directory
- **Railway**: Connect GitHub repository
- **DigitalOcean App Platform**: Use Node.js buildpack
- **AWS Amplify**: Configure Next.js build settings
- **Self-hosted**: Use `npm run build` and `npm start`

### Environment Variables

Make sure to set all required environment variables in your deployment platform.

### Database

- Use MongoDB Atlas for production
- Set up connection string with proper authentication
- Enable IP whitelist for security

### Build Configuration

```bash
# Build command
npm run build

# Start command
npm start

# Output directory
.next
```

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size
- `npm run seed` - Seed database with sample data

## 🔒 Security Features

- **NextAuth.js**: Secure authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Brute force protection on login
- **Account Lockout**: Lock accounts after failed attempts
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Protection**: Content Security Policy headers
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Mongoose parameterized queries
- **Environment Variables**: Secure secret management

## 🧪 Testing

While not included in this version, recommended testing setup:

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Next.js API route testing
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: TypeScript compiler

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👤 Author

**Ammar Bin Anwar Fuad**

- Email: ammarbinanwarfuad@gmail.com
- GitHub: [@ammarbinanwarfuad](https://github.com/ammarbinanwarfuad)
- LinkedIn: [ammarbinanwarfuad](https://linkedin.com/in/ammarbinanwarfuad)
- Hashnode: [ammarbin](https://ammarbin.hashnode.dev)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and analytics
- shadcn/ui for the component library
- All open-source contributors whose packages make this possible

---

**Note**: This is a production-ready portfolio application. Make sure to:
- Change default admin credentials
- Configure all environment variables
- Set up proper database backups
- Enable monitoring and analytics
- Regular security updates

For issues or questions, please open an issue on GitHub or contact the author.

