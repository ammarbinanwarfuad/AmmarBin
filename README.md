# AmmarBin - Modern Full-Stack Portfolio Website

A high-performance, production-ready portfolio website built with **Next.js 16** and **React 19**, featuring a comprehensive admin dashboard, blog system, project showcase, and enterprise-grade performance optimizations.

**Author:** Ammar Bin Anwar Fuad  
**Repository:** AmmarBin  
**Live Site:** <https://ammarbin.vercel.app>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Documentation Suite](#-documentation-suite)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Performance Optimizations](#-performance-optimizations)
- [Admin Dashboard](#-admin-dashboard)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Cache Invalidation](#-cache-invalidation)
- [Troubleshooting](#-troubleshooting)
- [Testing & Verification](#-testing--verification)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

This is a modern, production-ready portfolio website that showcases projects, skills, experience, education, certifications, and blog posts. It includes a powerful admin dashboard for content management, analytics tracking, and automated tasks. The application is optimized for performance, SEO, and user experience.

### Key Highlights

- ⚡ **High Performance**: Optimized for Core Web Vitals with Turbopack dev server
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support (next-themes)
- 🔐 **Secure Admin Panel**: NextAuth.js authentication with middleware protection
- 📊 **Analytics**: Built-in analytics with Vercel Analytics and Speed Insights
- 📝 **Blog System**: Full-featured blog with external source integration (Hashnode, Dev.to)
- 🤖 **Automation**: Scheduled tasks for GitHub sync and blog updates
- 🌐 **SEO Optimized**: Comprehensive SEO with auto-generated sitemaps
- 🖼️ **Media Management**: Cloudinary integration with image optimization (AVIF, WebP)
- 🎯 **Type-Safe**: Full TypeScript coverage with Zod validation

## ✨ Features

### Public Features

- **Homepage**: Hero section with featured projects and skills
- **Projects**: Showcase portfolio projects with filtering and search
- **Blog**: Blog posts with markdown support and external source integration (Hashnode, GUCC)
- **About**: Personal information and bio
- **Experience**: Work experience timeline
- **Education**: Educational background
- **Skills**: Technical skills with proficiency levels
- **Certifications**: Professional certifications
- **Contact**: Contact form with email notifications
- **Resume**: PDF resume download
- **Participation**: Community participation and contributions

### Admin Features

- **Dashboard**: Overview with analytics, system info, and quick actions
- **Analytics**: Visitor analytics, page views, and performance metrics
- **Projects Management**: CRUD operations for projects with GitHub sync
- **Blog Management**: Create, edit, publish blog posts with auto-sync from external sources
- **Media Library**: Cloudinary integration for image/video management
- **Skills Management**: Add and manage technical skills
- **Experience Management**: Manage work experience entries
- **Education Management**: Manage educational background
- **Certifications Management**: Manage professional certifications
- **Messages**: View and manage contact form submissions
- **Activity Log**: Track all admin actions and changes
- **Scheduled Tasks**: Automate recurring tasks (GitHub sync, blog sync)
- **Backup & Restore**: Database backup and restore functionality
- **Export & Import**: Data export/import capabilities
- **Settings**: Profile and system settings management
- **Calendar**: Calendar view for scheduled content and tasks
- **Change Password**: Secure password change functionality
- **Performance Monitoring**: Web Vitals tracking and performance budgets

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router and Turbopack
- **React 19.2.0** - UI library (latest)
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library (Radix UI primitives)
- **Framer Motion** - Animation library (lazy loaded)
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod 4** - Schema validation
- **SWR** - Data fetching and caching
- **React Hot Toast** - Toast notifications
- **date-fns** - Date utility library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js 4.24** - Authentication system
- **Mongoose 8.19** - MongoDB ODM with connection pooling
- **MongoDB** - NoSQL database
- **Cloudinary** - Image/video hosting and optimization
- **Nodemailer 7** - Email sending (contact form)
- **Bcryptjs** - Password hashing
- **Cheerio** - HTML parsing (blog scraping)
- **RSS Parser** - RSS feed parsing
- **Marked** - Markdown parsing

### Performance & Monitoring

- **Vercel Analytics** - Web analytics and visitor tracking
- **Vercel Speed Insights** - Real User Monitoring (RUM)
- **Web Vitals** - Core Web Vitals tracking (custom implementation)
- **Custom Logger** - Production-safe logging utility (`lib/logger.ts`)
- **Performance Budgets** - Automated performance monitoring
- **Server Timing Headers** - API response time tracking

### Development Tools

- **Turbopack** - Next.js 16 dev server (faster than Webpack)
- **ESLint 9** - Code linting
- **Prettier** - Code formatting with Tailwind plugin
- **TypeScript 5** - Static type checking
- **Bundle Analyzer** - Bundle size analysis (`npm run analyze`)
- **Next Sitemap** - Automatic sitemap generation
- **tsx** - TypeScript execution for scripts
- **dotenv** - Environment variable management

---

## 🏗️ Architecture Deep Dive

### Key Metrics
- **Framework**: Next.js 16 with App Router + Turbopack
- **React Version**: 19.2.0 (Latest)
- **TypeScript**: Full coverage with strict mode
- **Database Models**: 16 Mongoose models
- **API Endpoints**: 55+ serverless functions
- **Components**: 45+ React components
- **Admin Features**: 22+ admin dashboard sections

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                │
├─────────────────────────────────────────────────────────┤
│  React 19.2 + TypeScript 5 + Tailwind CSS 3.4         │
├─────────────────────────────────────────────────────────┤
│  shadcn/ui (Radix UI) + Framer Motion + Lucide Icons   │
├─────────────────────────────────────────────────────────┤
│  SWR Data Fetching + React Hook Form + Zod Validation  │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (Serverless)            │
├─────────────────────────────────────────────────────────┤
│  NextAuth.js 4.24 + MongoDB Session Management         │
├─────────────────────────────────────────────────────────┤
│  Mongoose 8.19 ODM + MongoDB Atlas/Local               │
├─────────────────────────────────────────────────────────┤
│  Cloudinary Media + Nodemailer + GitHub API            │
└─────────────────────────────────────────────────────────┘
```

### Performance Stack
```
┌─────────────────────────────────────────────────────────┐
│  Vercel Analytics + Speed Insights + Web Vitals        │
├─────────────────────────────────────────────────────────┤
│  Multi-Layer Caching (CDN + Edge + Next.js + DB)       │
├─────────────────────────────────────────────────────────┤
│  Image Optimization (AVIF/WebP) + Bundle Analysis      │
├─────────────────────────────────────────────────────────┤
│  Turbopack Dev Server + Code Splitting + Lazy Loading  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack Comparison

#### Frontend Technologies
| Technology | Version | Purpose | Performance Impact |
|------------|---------|---------|-------------------|
| **Next.js** | 16.0.0 | React framework with App Router | ⚡ Turbopack = 700x faster builds |
| **React** | 19.2.0 | UI library with latest features | 🔄 Concurrent features, Suspense |
| **TypeScript** | 5.x | Type safety and developer experience | 🛡️ Compile-time error prevention |
| **Tailwind CSS** | 3.4.1 | Utility-first styling | 📦 Tree-shaking, minimal CSS |
| **shadcn/ui** | Latest | Accessible component library | ♿ ARIA compliance, keyboard nav |
| **Framer Motion** | 12.23.24 | Animation library (lazy loaded) | 🎭 Smooth animations, lazy loaded |
| **SWR** | 2.3.6 | Data fetching and caching | 🚀 Stale-while-revalidate strategy |

#### Backend Technologies
| Technology | Version | Purpose | Performance Impact |
|------------|---------|---------|-------------------|
| **MongoDB** | Latest | NoSQL database | 📊 Flexible schema, fast queries |
| **Mongoose** | 8.19.2 | ODM with connection pooling | 🔗 Connection optimization |
| **NextAuth.js** | 4.24.7 | Authentication system | 🔐 Session management, JWT |
| **Cloudinary** | 2.8.0 | Media hosting and optimization | 🖼️ Auto-format, responsive images |
| **Nodemailer** | 7.0.10 | Email service | 📧 Contact form notifications |

#### Development Tools
| Tool | Version | Purpose | Benefit |
|------|---------|---------|---------|
| **Turbopack** | Built-in | Next.js 16 dev server | ⚡ 700x faster than Webpack |
| **ESLint** | 9.x | Code linting | 🔍 Code quality enforcement |
| **Prettier** | 3.6.2 | Code formatting | 🎨 Consistent code style |
| **Bundle Analyzer** | 16.0.1 | Bundle size analysis | 📊 Performance optimization |

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN Cache     │    │   Edge Cache    │    │  Next.js Cache  │
│   (1 year)      │    │   (1 hour)      │    │   (60 seconds)  │
│   Static Assets │    │   API Routes    │    │   Pages & Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Architecture

#### Authentication & Authorization
- **NextAuth.js**: Session-based authentication with JWT
- **Middleware Protection**: All `/admin/*` routes protected
- **Rate Limiting**: Login attempts (5 per 15 minutes)
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: 2-hour expiration, secure cookies

#### Security Headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing prevention
- **Referrer-Policy**: Controlled referrer information

### Database Schema Overview

#### Models (16 total)
| Model | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| **User** | Admin authentication | email, password, role | → Activity |
| **Project** | Portfolio projects | title, description, technologies | → None |
| **Blog** | Blog posts | title, content, slug, published | → None |
| **ExternalBlog** | External blog sync | source, url, lastSync | → None |
| **Skill** | Technical skills | name, proficiency, category | → None |
| **Experience** | Work experience | company, position, duration | → None |
| **Education** | Educational background | institution, degree, year | → None |
| **Certificate** | Certifications | name, issuer, date | → None |
| **Message** | Contact form | name, email, message | → None |
| **Activity** | Admin actions | action, user, timestamp | ← User |
| **PageView** | Analytics | page, timestamp, country | → None |
| **WebVital** | Performance metrics | metric, value, page | → None |
| **ScheduledTask** | Automation | name, schedule, lastRun | → None |
| **Setting** | App configuration | key, value | → None |
| **Profile** | User profile | bio, avatar, social | → None |
| **Participation** | Community activities | title, description, date | → None |

### UI/UX Design System

#### Design Principles
- **Accessibility First**: WCAG 2.1 AA compliance
- **Mobile Responsive**: Mobile-first design approach
- **Dark Mode Support**: System preference detection
- **Performance Focused**: Skeleton loaders, optimistic updates
- **Consistent Spacing**: Tailwind's spacing scale

#### Component Architecture
```
components/
├── ui/                    # Primitive components (shadcn/ui)
│   ├── button.tsx        # Button variants and states
│   ├── card.tsx          # Card layouts
│   ├── dialog.tsx        # Modal dialogs
│   └── ...               # Other primitives
└── (composite)/          # Business logic components
    ├── BlogGrid.tsx      # Blog post grid
    ├── ProjectsGrid.tsx  # Projects showcase
    └── ...               # Other composites
```

### Deployment Architecture

#### Vercel Platform Benefits
- **Edge Network**: Global CDN with 100+ edge locations
- **Serverless Functions**: Auto-scaling API endpoints
- **Image Optimization**: Automatic format conversion
- **Analytics**: Built-in performance monitoring
- **Preview Deployments**: Branch-based deployments

#### Environment Configuration
```
Production:  NEXTAUTH_URL=https://ammarbin.vercel.app
Development: NEXTAUTH_URL=http://localhost:3000
Database:    MongoDB Atlas (production) / Local (development)
Media:       Cloudinary CDN
Email:       SMTP service (Gmail/SendGrid)
```

### Performance Monitoring

#### Metrics Tracked
- **Web Vitals**: LCP, FID, CLS, TTFB, INP
- **User Analytics**: Page views, session duration, bounce rate
- **Performance Budgets**: Bundle size, load times
- **Error Tracking**: Client and server errors
- **API Performance**: Response times, success rates

#### Monitoring Tools
- **Vercel Analytics**: Real-time user metrics
- **Vercel Speed Insights**: Core Web Vitals tracking
- **Custom Web Vitals**: Client-side performance tracking
- **Server Timing**: API response time headers
- **Bundle Analyzer**: Build-time bundle analysis

---

## � Project Structure

```text
AmmarBin/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/            # Admin home
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── blog/                 # Blog management
│   │   ├── projects/             # Projects management
│   │   ├── skills/               # Skills management
│   │   ├── experience/           # Experience management
│   │   ├── education/            # Education management
│   │   ├── certifications/       # Certifications management
│   │   ├── media/                # Media library
│   │   ├── messages/             # Contact messages
│   │   ├── activity/             # Activity log
│   │   ├── scheduled-tasks/      # Task automation
│   │   ├── backup/               # Backup & restore
│   │   ├── export/               # Data export/import
│   │   ├── settings/             # Settings
│   │   ├── calendar/             # Calendar view
│   │   ├── change-password/      # Password management
│   │   └── login/                # Admin login
│   ├── api/                      # API routes (serverless)
│   │   ├── admin/                # Admin API endpoints
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── analytics/            # Analytics API
│   │   ├── blog/                 # Blog API
│   │   ├── projects/             # Projects API
│   │   ├── skills/               # Skills API
│   │   ├── experience/           # Experience API
│   │   ├── education/            # Education API
│   │   ├── certifications/       # Certifications API
│   │   ├── participation/        # Participation API
│   │   ├── contact/              # Contact form API
│   │   └── health/               # Health check endpoint
│   ├── blog/                     # Blog pages
│   │   └── [slug]/               # Dynamic blog post pages
│   ├── projects/                 # Projects showcase
│   ├── skills/                   # Skills page
│   ├── experience/               # Experience & Activities
│   ├── education/                # Education timeline
│   ├── certifications/           # Certifications grid
│   ├── participation/            # Community participation
│   ├── contact/                  # Contact form
│   ├── resume/                   # Resume page with PDF viewer
│   ├── offline/                  # Offline fallback (PWA)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── error.tsx                 # Error boundary
│   ├── not-found.tsx             # 404 page
│   ├── loading.tsx               # Loading UI
│   ├── providers.tsx             # React context providers
│   ├── globals.css               # Global styles
│   └── animations.css            # Animation utilities
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   └── ...                   # Other UI primitives
│   ├── Header.tsx                # Site header with navigation
│   ├── Footer.tsx                # Site footer
│   ├── ThemeToggle.tsx           # Dark mode toggle
│   ├── BlogGrid.tsx              # Blog posts grid
│   ├── BlogGridWithFilter.tsx    # Filterable blog grid
│   ├── ProjectsGrid.tsx          # Projects showcase grid
│   ├── ProjectsGridWithFilter.tsx # Filterable projects
│   ├── SkillsGrid.tsx            # Skills display
│   ├── ExperienceTabsClient.tsx  # Experience tabs (client)
│   ├── EducationList.tsx         # Education timeline
│   ├── CertificationsGrid.tsx    # Certifications display
│   ├── ContactForm.tsx           # Contact form
│   ├── ImageUpload.tsx           # Image upload (Cloudinary)
│   ├── ImageCropModal.tsx        # Image cropping modal
│   ├── PDFViewer.tsx             # PDF viewer component
│   ├── LazyMotion.tsx            # Lazy-loaded animations
│   ├── DynamicMotion.tsx         # Dynamic animation wrapper
│   ├── WebVitals.tsx             # Web Vitals tracking
│   ├── PerformanceBudgetMonitor.tsx # Performance monitoring
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # MongoDB connection
│   ├── logger.ts                 # Production-safe logger
│   ├── cache.ts                  # Caching utilities
│   ├── cache-invalidation.ts     # Cache invalidation system
│   ├── etag.ts                   # ETag generation
│   ├── cloudinary.ts             # Cloudinary config
│   ├── github.ts                 # GitHub API integration
│   ├── blog-fetchers.ts          # External blog fetching
│   ├── email.ts                  # Email utilities
│   ├── utils.ts                  # General utilities (cn, etc.)
│   ├── validations.ts            # Zod schemas
│   ├── constants.ts              # App constants
│   ├── hooks/                    # Custom React hooks
│   │   └── ...                   # Various hooks
│   ├── server/                   # Server-only utilities
│   │   └── data.ts               # Data fetching functions
│   └── admin/                    # Admin utilities
│       └── fetch-with-auth.ts    # Authenticated fetch utility
├── models/                       # Mongoose models (16 models)
│   ├── User.ts
│   ├── Project.ts
│   ├── Blog.ts
│   ├── ExternalBlog.ts
│   ├── Skill.ts
│   ├── Experience.ts
│   ├── Education.ts
│   ├── Certificate.ts
│   ├── Message.ts
│   ├── Activity.ts
│   ├── PageView.ts
│   ├── WebVital.ts
│   ├── ScheduledTask.ts
│   ├── Setting.ts
│   ├── Profile.ts
│   └── Participation.ts
├── public/                       # Static assets
│   ├── sitemap.xml               # Auto-generated sitemap
│   ├── sitemap-0.xml
│   └── robots.txt                # SEO robots file
├── scripts/                      # Utility scripts
│   ├── seed.ts                   # Database seeding
│   ├── verify-env.ts             # Environment validation
│   ├── verify-routes.ts          # Route protection check
│   └── pre-deploy-check.ts       # Pre-deployment validation
├── types/                        # TypeScript definitions
│   └── index.ts                  # Shared types
├── middleware.ts                 # Next.js middleware (auth, caching)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui config
├── next-sitemap.config.js        # Sitemap generation config
├── vercel.json                   # Vercel deployment config
├── package.json                  # Dependencies and scripts
├── README.md                     # This file
├── DEPLOYMENT.md                 # Deployment checklist
└── IMPLEMENTATION_SUMMARY.md     # Implementation details
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud)
- Cloudinary account (for media hosting)
- GitHub account (for project sync, optional)
- Email service (for contact form, optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ammarbinanwarfuad/AmmarBin.git
   cd AmmarBin
   ```

1. **Install dependencies**

   ```bash
   npm install
   ```

1. **Set up environment variables**

   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section)

1. **Set up the database**

   Ensure MongoDB is running and update the connection string in `.env.local`

1. **Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/portfolio
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Cloudinary (for media hosting)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Optional Variables

```env
# GitHub (for project sync)
GITHUB_PAT=your-github-personal-access-token
GITHUB_USERNAME=your-github-username

# Vercel (for enhanced cache purging)
# Get these from: Vercel Dashboard → Project → Settings → General
VERCEL_TOKEN=your-vercel-api-token
VERCEL_PROJECT_ID=your-vercel-project-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Vercel Cache Invalidation (Optional)

For enhanced cache purging when content is updated, add these environment variables:

1. **Get VERCEL_TOKEN**:
   - Go to [Vercel Dashboard](<https://vercel.com/account/tokens>)
   - Create a new token with read/write permissions
   - Copy the token

1. **Get VERCEL_PROJECT_ID**:
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → General
   - Copy the Project ID

1. **Add to Vercel Environment Variables**:
   - Go to Project → Settings → Environment Variables
   - Add `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`
   - Redeploy your project

**Note**: Cache invalidation works without these variables (using Next.js revalidation), but adding them enables additional Vercel CDN cache purging for faster updates.

### Generating NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

## 🗄 Database Setup

### MongoDB Connection

1. **Local MongoDB**: Install MongoDB locally and update `MONGODB_URI`
2. **MongoDB Atlas**: Create a free cluster and use the connection string

### Database Models

The application uses the following Mongoose models (located in `/models/`):

- **User** (`User.ts`) - Admin users and authentication
- **Project** (`Project.ts`) - Portfolio projects
- **Blog** (`Blog.ts`) - Blog posts
- **ExternalBlog** (`ExternalBlog.ts`) - External blog posts (Hashnode, Dev.to)
- **Skill** (`Skill.ts`) - Technical skills
- **Experience** (`Experience.ts`) - Work experience
- **Education** (`Education.ts`) - Educational background
- **Certificate** (`Certificate.ts`) - Professional certifications
- **Message** (`Message.ts`) - Contact form submissions
- **Activity** (`Activity.ts`) - Activity log entries
- **PageView** (`PageView.ts`) - Analytics page views
- **WebVital** (`WebVital.ts`) - Performance metrics (Core Web Vitals)
- **ScheduledTask** (`ScheduledTask.ts`) - Automated tasks
- **Setting** (`Setting.ts`) - Application settings
- **Profile** (`Profile.ts`) - User profile information
- **Participation** (`Participation.ts`) - Community participation and activities

### Database Indexes

The application automatically creates indexes for optimal query performance:

- Projects: `dateCreated`, `createdAt`, `published`, `featured`
- Blogs: `published`, `publishedDate`, `slug`
- Skills: `category`, `proficiency`
- And more...

## 💻 Development

### Available Scripts

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Analyze bundle size
npm run analyze

# Database seeding
npm run seed

# Generate sitemap (runs automatically after build)
npm run postbuild

# Verify environment variables
npm run verify:env

# Verify admin route protection
npm run verify:routes

# Pre-deployment checks (runs all verifications)
npm run predeploy
```

### Development Server

The development server runs on `http://localhost:3000` with:

- Hot module replacement (HMR)
- TypeScript type checking
- ESLint warnings
- Fast refresh

### Code Structure

- **Components**: Reusable React components in `components/`
- **Pages**: Next.js pages in `app/`
- **API Routes**: Serverless API endpoints in `app/api/`
- **Utilities**: Helper functions in `lib/`
- **Models**: Database models in `models/`
- **Types**: TypeScript definitions in `types/`

### Best Practices

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Server Components by default, Client Components when needed
- Implement proper error handling
- Use SWR for data fetching and caching
- Optimize images with Next.js Image component
- Use Tailwind CSS for styling
- Format code with Prettier before committing (`npm run format`)

## ⚡ Performance Optimizations

This application is heavily optimized for performance:

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
  - Image preloading
  - Optimized image formats (AVIF, WebP)
  - Critical CSS inlining

- **FID (First Input Delay)**: < 100ms
  - Code splitting
  - Lazy loading
  - Deferred analytics

- **CLS (Cumulative Layout Shift)**: < 0.1
  - Proper image dimensions
  - Skeleton loaders
  - Font optimization

### Optimization Techniques

1. **Server-Side Rendering (SSR)**: Dynamic pages use SSR for fresh data
1. **Static Site Generation (SSG)**: Static pages pre-rendered at build time
1. **Incremental Static Regeneration (ISR)**: Revalidation strategies per page
1. **Image Optimization**: Next.js Image with Cloudinary (AVIF, WebP)
1. **Code Splitting**: Automatic code splitting with dynamic imports
1. **Lazy Loading**: Components and libraries loaded on demand (LazyMotion)
1. **Multi-Layer Caching**: CDN, edge, Next.js cache, database query cache
1. **Cache Invalidation**: Automatic invalidation on content updates
1. **ETags**: Conditional requests for reduced bandwidth
1. **Bundle Optimization**: Tree shaking, minification, gzip compression
1. **Font Optimization**: Next.js font optimization with preloading
1. **Middleware Optimization**: Edge middleware for geo-location and caching
1. **Stale-While-Revalidate**: CDN caching with background updates

### Performance Monitoring

- Real-time Web Vitals tracking
- Performance budget monitoring
- Bundle size analysis
- Server timing headers
- Analytics integration

## 🎛 Admin Dashboard

### Authentication & Security

The admin dashboard is protected by NextAuth.js authentication. All admin routes (`/admin/*`) and API endpoints (`/api/admin/*`) require a valid session.

**Key Features:**

- Session-based authentication with JWT strategy
- Automatic session expiration (2 hours default)
- Rate limiting on login attempts (5 attempts per 15 minutes)
- Secure password hashing with bcrypt
- Cookie-based session management

**Server-Side Fetch Pattern:**
When Server Components need to fetch data from authenticated API routes, they must manually pass cookies because Next.js App Router doesn't automatically forward them. The `fetchAdminData` utility in `lib/admin/fetch-with-auth.ts` handles this automatically.

**See [Troubleshooting](#-troubleshooting) section for common authentication issues.**

### Access

Navigate to `/admin/login` and log in with your admin credentials.

### Features

#### Dashboard

- System overview and statistics
- Quick actions
- Recent activity
- Performance metrics
- SEO analysis

#### Content Management

- **Projects** (`/admin/projects`): Add, edit, delete projects with GitHub sync
- **Blog** (`/admin/blog`): Create blog posts, sync from external sources
- **Skills** (`/admin/skills`): Manage technical skills with proficiency levels
- **Experience** (`/admin/experience`): Manage work experience entries
- **Education** (`/admin/education`): Manage educational background
- **Certifications** (`/admin/certifications`): Manage professional certifications

#### Media Library

- **Media** (`/admin/media`): Upload images and videos
- Cloudinary integration
- Image cropping and optimization
- Bulk operations

#### Analytics

- **Analytics** (`/admin/analytics`): Visitor analytics
- Page views tracking
- Performance metrics
- Web Vitals dashboard

#### Automation

- **Scheduled Tasks** (`/admin/scheduled-tasks`): Automate recurring tasks
  - GitHub project sync
  - Blog post sync from external sources
  - Data backups

#### System Tools

- **Backup & Restore** (`/admin/backup`): Database backup and restore
- **Export & Import** (`/admin/export`): Data export/import
- **Activity Log** (`/admin/activity`): Track all admin actions
- **Calendar** (`/admin/calendar`): Calendar view for content
- **Settings** (`/admin/settings`): System and profile settings
- **Change Password** (`/admin/change-password`): Update admin password

### Security Details

- **Password Hashing**: bcrypt with salt rounds
- **Session-based Authentication**: NextAuth.js with JWT strategy
- **Route Protection**: Middleware protects all `/admin/*` routes
- **API Security**: All admin API routes verify authentication
- **Cookie Management**: Secure, httpOnly cookies with SameSite policy
- **Session Duration**: 2 hours (configurable)
- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, CSP
- **Production Logger**: Removes console logs in production builds

## 📡 API Documentation

### Public APIs

#### Projects

- `GET /api/projects` - Get all published projects
- `GET /api/projects/[id]` - Get project by ID

#### Blog

- `GET /api/blog` - Get all published blog posts
- `GET /api/blog?slug=[slug]` - Get blog post by slug

#### Skills

- `GET /api/skills` - Get all skills

#### Experience

- `GET /api/experience` - Get all experience entries

#### Education

- `GET /api/education` - Get all education entries

#### Certifications

- `GET /api/certifications` - Get all certifications

#### Contact

- `POST /api/contact` - Submit contact form

### Admin APIs

All admin APIs require authentication and are prefixed with `/api/admin/`:

- `/api/admin/projects` - Project management
- `/api/admin/blog` - Blog management
- `/api/admin/skills` - Skills management
- `/api/admin/analytics` - Analytics data
- `/api/admin/media` - Media management
- `/api/admin/backup` - Backup operations
- And more...

## 🚢 Deployment

### Pre-Deployment Checklist

Before deploying to production, ensure you have completed the following:

#### ✅ Environment Variables

- [ ] `MONGODB_URI` - MongoDB connection string (Atlas recommended for production)
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., `https://ammarbin.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Secure random secret (generate with `openssl rand -base64 32`)
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (optional - for contact form emails)
- [ ] `GITHUB_PAT`, `GITHUB_USERNAME` (optional - for GitHub project sync)
- [ ] `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (optional - for enhanced cache invalidation)

#### ✅ Database Setup

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database connection string tested
- [ ] Network access configured (IP whitelist or 0.0.0.0/0 for Vercel)
- [ ] Database indexes created (automatic on first run)
- [ ] Initial admin user created (use seed script or create manually)

#### ✅ Security

- [ ] All environment variables are set in production
- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] `NEXTAUTH_URL` matches your production domain exactly
- [ ] MongoDB connection string uses strong credentials
- [ ] Cloudinary credentials are secure
- [ ] Admin account has strong password

#### ✅ Testing

- [ ] Test login functionality on production
- [ ] Test logout functionality
- [ ] Test subsequent login after logout (critical - verify cookie passing works)
- [ ] Test contact form submission
- [ ] Test admin dashboard access
- [ ] Test API endpoints (verify no 401 errors)
- [ ] Test health check endpoint (`/api/health`)
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices

#### ✅ Performance

- [ ] Build completes without errors (`npm run build`)
- [ ] No console errors in production
- [ ] Images are optimized
- [ ] Database queries are performing well
- [ ] Check Vercel Function Logs for any errors

### Vercel (Recommended)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

1. **Import the repository in Vercel**

   - Go to [Vercel Dashboard](<https://vercel.com/dashboard>)
   - Click "Add New Project"
   - Import your GitHub repository

1. **Configure Project Settings**

   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

1. **Add Environment Variables**

   - Go to Project → Settings → Environment Variables
   - Add all required variables (see checklist above)
   - Ensure variables are set for "Production" environment
   - **Important**: After adding variables, redeploy the project

1. **Deploy!**

   - Click "Deploy"
   - Wait for build to complete
   - Test your production site

1. **Post-Deployment Verification**

   - [ ] Visit your production URL
   - [ ] Test admin login at `/admin/login`
   - [ ] Check health endpoint: `https://your-domain.vercel.app/api/health`
   - [ ] Verify all pages load correctly
   - [ ] Test contact form
   - [ ] Check Vercel Function Logs for any errors

Vercel automatically:

- Detects Next.js
- Optimizes builds
- Provides CDN
- Enables analytics
- Handles SSL certificates
- Provides edge network

### Other Platforms

The application can be deployed to any platform supporting Next.js:

- **Netlify**: Use Next.js plugin
- **AWS**: Use AWS Amplify or custom setup
- **Docker**: Build and run in containers
- **Self-hosted**: Use Node.js server

### Build Configuration

The application uses:

- Next.js 16 with App Router
- Webpack for bundling
- Automatic sitemap generation (next-sitemap)
- Optimized production builds
- Standalone output mode for reduced bundle size
- Image optimization with AVIF and WebP formats

### Environment Variables

Ensure all environment variables are set in your deployment platform.

## 🤝 Contributing

This is a personal portfolio project. If you'd like to use it as a template or suggest improvements:

1. Fork the repository
1. Create a feature branch (`git checkout -b feature/improvement`)
1. Make your changes with clear, descriptive commits
1. Test thoroughly (`npm run build` and `npm run predeploy`)
1. Push to your branch (`git push origin feature/improvement`)
1. Open a Pull Request with detailed description

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for linting and Prettier for code formatting
- Run `npm run format` before committing code
- Write meaningful commit messages (conventional commits preferred)
- Test all changes locally before pushing
- Update documentation for significant changes
- Ensure all admin routes remain protected
- Run `npm run verify:routes` to check route security

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Ammar Bin Anwar Fuad** - Project creator and developer
- [Next.js](https://nextjs.org/) - The React framework for production
- [Vercel](https://vercel.com/) - Hosting, analytics, and edge network
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible component library
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- All open-source contributors whose packages made this possible

## 🔄 Cache Invalidation

The application includes an advanced cache invalidation system that ensures content updates appear instantly on the live site:

- **Automatic Invalidation**: All admin actions (create, update, delete) automatically invalidate relevant caches
- **Non-Blocking**: Cache invalidation runs asynchronously without impacting API response times
- **Multi-Layer**: Invalidates Next.js cache and CDN cache
- **Optional Vercel Integration**: Enhanced cache purging with VERCEL_TOKEN and VERCEL_PROJECT_ID

See [Environment Variables](#environment-variables) section for Vercel cache setup instructions.

## 🔧 Troubleshooting

### Admin Login Issues

#### Problem: Login works initially but fails after logout and re-login

**Solution:** This was a known issue with Next.js App Router Server Components not automatically forwarding cookies to internal API routes. This has been fixed by:

1. **Cookie Passing Utility**: Created `lib/admin/fetch-with-auth.ts` that manually passes cookies from request headers to internal API calls
2. **Protected Routes**: All admin API routes now properly check authentication
3. **Error Handling**: Enhanced error handling with user-friendly messages

**How it works:**

- Server Components use `headers()` from `next/headers` to get incoming request cookies
- Cookies are manually passed to fetch requests via the `Cookie` header
- API routes verify authentication using `getServerSession(authOptions)`

**Verification:**

- Check browser Network tab - no 401 errors on `/api/admin/*` routes
- Verify cookies are being passed (check in development console logs)
- Test multiple login/logout cycles to ensure consistency

#### Problem: 401 Unauthorized errors on admin dashboard

**Possible causes:**

1. **Missing Environment Variables**: Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set
2. **Cookie Issues**: Check if cookies are enabled in browser
3. **Session Expired**: Session may have expired (default: 2 hours)

**Solution:**

- Verify environment variables in Vercel dashboard
- Clear browser cookies and try logging in again
- Check Vercel logs for authentication errors
- Ensure `NEXTAUTH_URL` matches your production domain exactly

### Server-Side Fetch Authentication

**Important Note:** When making fetch calls from Server Components to internal API routes in Next.js App Router, cookies are NOT automatically forwarded. Always use the `fetchAdminData` utility from `lib/admin/fetch-with-auth.ts` for authenticated requests.

**Example:**

```typescript
import { fetchAdminData } from "@/lib/admin/fetch-with-auth";

// ✅ Correct - uses utility that passes cookies
const data = await fetchAdminData('/api/admin/analytics');

// ❌ Incorrect - cookies won't be passed
const data = await fetch('/api/admin/analytics');
```

## 🧪 Testing & Verification

### Pre-Deployment Checks

Before deploying to production, run the comprehensive verification script:

```bash
# Run all pre-deployment checks
npm run predeploy
```

This script automatically verifies:

- ✅ All required environment variables are set
- ✅ All admin routes are properly protected
- ✅ Build completes without errors
- ✅ TypeScript compilation succeeds
- ✅ No critical security issues

### Individual Verification Scripts

```bash
# Verify environment variables only
npm run verify:env

# Verify admin route protection only
npm run verify:routes

# Build the project
npm run build
```

### Manual Testing Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] All public pages are accessible
- [ ] Admin login works (`/admin/login`)
- [ ] Admin dashboard loads after login
- [ ] Logout and re-login works (test cookie passing)
- [ ] Contact form sends emails
- [ ] Blog posts display correctly
- [ ] Projects showcase works
- [ ] Images load from Cloudinary
- [ ] Dark mode toggle functions
- [ ] Mobile responsiveness
- [ ] Health check endpoint: `/api/health`

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

### Built with ❤️ by Ammar Bin Anwar Fuad

Powered by Next.js 16, React 19, TypeScript, Tailwind CSS, and MongoDB

Deployed on Vercel • [View Live Site](<https://ammarbin.vercel.app>)

© 2024-2025 Ammar Bin Anwar Fuad. All rights reserved.
