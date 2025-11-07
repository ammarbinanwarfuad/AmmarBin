# Portfolio Website - Modern Full-Stack Next.js Application

A high-performance, feature-rich portfolio website built with Next.js 16, featuring a comprehensive admin dashboard, blog system, project showcase, and advanced performance optimizations.

**Author:** Ammar Bin Anwar Fuad

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Performance Optimizations](#performance-optimizations)
- [Admin Dashboard](#admin-dashboard)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is a modern, production-ready portfolio website that showcases projects, skills, experience, education, certifications, and blog posts. It includes a powerful admin dashboard for content management, analytics tracking, and automated tasks. The application is optimized for performance, SEO, and user experience.

### Key Highlights

- ⚡ **High Performance**: Optimized for Core Web Vitals with sub-100ms TTFB
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- 🔐 **Secure Admin Panel**: Protected admin dashboard with authentication
- 📊 **Analytics**: Built-in analytics and performance monitoring
- 📝 **Blog System**: Full-featured blog with external source integration
- 🤖 **Automation**: Scheduled tasks for GitHub sync and content updates
- 📱 **PWA Ready**: Service worker for offline support
- 🌐 **SEO Optimized**: Comprehensive SEO features and sitemap generation

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
- **SEO Tools**: SEO analysis and optimization suggestions
- **Performance Monitoring**: Web Vitals tracking and performance budgets

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library (lazy loaded)
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **SWR** - Data fetching and caching
- **React Hot Toast** - Toast notifications

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication
- **Mongoose** - MongoDB ODM
- **MongoDB** - Database
- **Cloudinary** - Image/video hosting and optimization
- **Nodemailer** - Email sending
- **Bcrypt** - Password hashing

### Performance & Monitoring

- **Vercel Analytics** - Web analytics
- **Vercel Speed Insights** - Performance monitoring
- **Web Vitals** - Core Web Vitals tracking
- **Google Tag Manager** - Analytics integration
- **Service Worker** - Offline support and caching

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Bundle Analyzer** - Bundle size analysis
- **Next Sitemap** - Sitemap generation

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── analytics/            # Analytics page
│   │   ├── blog/                 # Blog management
│   │   ├── projects/             # Projects management
│   │   ├── skills/                # Skills management
│   │   ├── experience/           # Experience management
│   │   ├── education/           # Education management
│   │   ├── certifications/      # Certifications management
│   │   ├── media/                # Media library
│   │   ├── messages/            # Contact messages
│   │   ├── activity/            # Activity log
│   │   ├── scheduled-tasks/     # Scheduled tasks
│   │   ├── backup/              # Backup & restore
│   │   ├── export/              # Export & import
│   │   ├── settings/            # Settings
│   │   ├── calendar/            # Calendar view
│   │   ├── change-password/     # Change password
│   │   └── login/               # Admin login
│   ├── api/                      # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── blog/                 # Blog API endpoints
│   │   ├── projects/            # Projects API endpoints
│   │   ├── skills/               # Skills API endpoints
│   │   ├── experience/           # Experience API endpoints
│   │   ├── education/            # Education API endpoints
│   │   ├── certifications/      # Certifications API endpoints
│   │   ├── participation/        # Participation API endpoints
│   │   ├── profile/               # Profile API endpoints
│   │   ├── contact/              # Contact form API endpoints
│   │   ├── resume/               # Resume API endpoints
│   │   └── ...                   # Other API endpoints
│   ├── blog/                     # Blog pages
│   │   └── [slug]/              # Individual blog post pages
│   ├── projects/                 # Projects page
│   ├── skills/                   # Skills page
│   ├── experience/               # Experience page
│   ├── education/                # Education page
│   ├── certifications/           # Certifications page
│   ├── participation/            # Participation page
│   ├── contact/                  # Contact page
│   ├── resume/                   # Resume page
│   ├── offline/                  # Offline page (PWA)
│   └── ...                       # Other public pages
├── components/                    # React components
│   ├── ui/                       # UI components (shadcn/ui)
│   ├── Header.tsx                # Site header
│   ├── Footer.tsx                # Site footer
│   ├── BlogGrid.tsx              # Blog grid component
│   ├── ProjectsGrid.tsx         # Projects grid component
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication configuration
│   ├── db.ts                     # Database connection
│   ├── cache.ts                  # Caching utilities
│   ├── cache-invalidation.ts    # Cache invalidation system
│   ├── etag.ts                   # ETag support for conditional requests
│   ├── cloudinary.ts             # Cloudinary configuration
│   ├── github.ts                 # GitHub API integration
│   ├── blog-fetchers.ts          # External blog fetching (Hashnode, GUCC)
│   ├── hooks/                    # Custom React hooks
│   ├── server/                   # Server-side utilities
│   └── ...                       # Other utilities
├── models/                       # Mongoose models
│   ├── User.ts                   # User model
│   ├── Project.ts                # Project model
│   ├── Blog.ts                   # Blog model
│   └── ...                       # Other models
├── public/                       # Static assets
│   ├── sw.js                     # Service worker for PWA
│   ├── sitemap.xml               # SEO sitemap
│   ├── robots.txt                # SEO robots file
│   └── ...                       # Other static files
├── scripts/                      # Utility scripts
│   ├── seed.ts                   # Database seeding script
│   └── ...                       # Other utility scripts
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Next.js middleware (auth, caching, geo)
├── next.config.ts                # Next.js configuration
├── vercel.json                   # Vercel deployment configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts
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
git clone <repository-url>
cd AmmarBin-SSR-SWR-ETC
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Set up the database**

Ensure MongoDB is running and update the connection string in `.env.local`

5. **Run the development server**

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

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Service Worker
NEXT_PUBLIC_ENABLE_SW=true

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Vercel Cache Invalidation (Optional)

For enhanced cache purging when content is updated, add these environment variables:

1. **Get VERCEL_TOKEN**:
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Create a new token with read/write permissions
   - Copy the token

2. **Get VERCEL_PROJECT_ID**:
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → General
   - Copy the Project ID

3. **Add to Vercel Environment Variables**:
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

The application uses the following Mongoose models:

- **User** - Admin users and authentication
- **Project** - Portfolio projects
- **Blog** - Blog posts
- **ExternalBlog** - External blog posts (Hashnode, GUCC)
- **Skill** - Technical skills
- **Experience** - Work experience
- **Education** - Educational background
- **Certificate** - Professional certifications
- **Message** - Contact form submissions
- **Activity** - Activity log entries
- **PageView** - Analytics page views
- **WebVital** - Performance metrics
- **ScheduledTask** - Automated tasks
- **Setting** - Application settings
- **Profile** - User profile information
- **Participation** - Community participation

### Database Indexes

The application automatically creates indexes for optimal query performance:

- Projects: `dateCreated`, `createdAt`, `published`, `featured`
- Blogs: `published`, `publishedDate`, `slug`
- Skills: `category`, `proficiency`
- And more...

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Analyze bundle size
npm run analyze
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

1. **Server-Side Rendering (SSR)**: Most pages use SSR for better SEO
2. **Static Site Generation (SSG)**: Blog posts and static pages
3. **Incremental Static Regeneration (ISR)**: Blog posts revalidate every 30 minutes, skills and about page revalidate every 2 hours
4. **Image Optimization**: Next.js Image with Cloudinary
5. **Code Splitting**: Automatic code splitting with dynamic imports
6. **Lazy Loading**: Components and libraries loaded on demand
7. **Caching**: Multiple caching layers (CDN, edge, in-memory, Next.js unstable_cache)
8. **Cache Invalidation**: Automatic cache invalidation on content updates for instant changes
9. **ETags**: Conditional requests support for reduced bandwidth
10. **Bundle Optimization**: Tree shaking, minification, compression
11. **Font Optimization**: Next.js font optimization with preloading
12. **Service Worker**: Offline support and caching
13. **Stale-While-Revalidate**: CDN caching with background updates

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
- **Projects**: Add, edit, delete projects with GitHub sync
- **Blog**: Create blog posts, sync from external sources
- **Skills**: Manage technical skills with proficiency levels
- **Experience**: Manage work experience entries
- **Education**: Manage educational background
- **Certifications**: Manage professional certifications

#### Media Library
- Upload images and videos
- Cloudinary integration
- Image cropping and optimization
- Bulk operations

#### Analytics
- Visitor analytics
- Page views tracking
- Performance metrics
- Web Vitals dashboard

#### Automation
- **Scheduled Tasks**: Automate recurring tasks
  - GitHub project sync
  - Blog post sync from external sources
  - Data backups

#### System Tools
- **Backup & Restore**: Database backup and restore
- **Export & Import**: Data export/import
- **Activity Log**: Track all admin actions
- **Settings**: System and profile settings

### Security Details

- Password hashing with bcrypt
- Session-based authentication (JWT)
- Rate limiting on login attempts (5 attempts per 15 minutes)
- All admin API routes protected with authentication checks
- Cookie-based session management with secure flags
- Session management with NextAuth
- CSRF protection
- Secure headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)

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

2. **Import the repository in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project Settings**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   - Go to Project → Settings → Environment Variables
   - Add all required variables (see checklist above)
   - Ensure variables are set for "Production" environment
   - **Important**: After adding variables, redeploy the project

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Test your production site

6. **Post-Deployment Verification**
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

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Ammar Bin Anwar Fuad** - Project creator and developer
- Next.js team for the amazing framework
- Vercel for hosting and analytics
- All open-source contributors whose packages made this possible

## 🔄 Cache Invalidation

The application includes an advanced cache invalidation system that ensures content updates appear instantly on the live site:

- **Automatic Invalidation**: All admin actions (create, update, delete) automatically invalidate relevant caches
- **Non-Blocking**: Cache invalidation runs asynchronously without impacting API response times
- **Multi-Layer**: Invalidates Next.js cache, CDN cache, and service worker cache
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

Before deploying, run these verification scripts:

```bash
# Verify all code tasks are complete
npm run complete:tasks

# Verify environment variables are set correctly
npm run verify:env

# Verify all admin routes are protected
npm run verify:routes

# Test authentication endpoints
npm run test:auth

# Run comprehensive test suite
npm run test:comprehensive

# Run all pre-deployment checks
npm run predeploy
```

### Testing Guide

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions, including:
- First login testing
- Logout functionality
- Subsequent login testing (critical)
- Error handling scenarios
- Session persistence

### Deployment Checklist

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a complete deployment checklist.

### Manual Tasks Guide

See [MANUAL_TASKS_GUIDE.md](./MANUAL_TASKS_GUIDE.md) for step-by-step instructions to complete the remaining manual tasks.

### Task Completion Status

**Current Status:** 47/88 tasks complete (53%)
- ✅ **Automated Tasks:** 47/47 (100%)
- ⏳ **Manual Tasks:** 0/41 (0%)

**Quick Complete:** See [QUICK_COMPLETE_GUIDE.md](./QUICK_COMPLETE_GUIDE.md) to finish remaining tasks in ~35 minutes.

**Documentation:**
- [ALL_TASKS_COMPLETE.md](./ALL_TASKS_COMPLETE.md) - Complete task status
- [TASK_COMPLETION_CHECKLIST.md](./TASK_COMPLETION_CHECKLIST.md) - Progress tracking
- [QUICK_COMPLETE_GUIDE.md](./QUICK_COMPLETE_GUIDE.md) - Fast track completion (35 min)
- [COMPLETE_ALL_TASKS.md](./COMPLETE_ALL_TASKS.md) - Complete task breakdown

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ by Ammar Bin Anwar Fuad using Next.js 16**

© 2025 Ammar Bin Anwar Fuad. All rights reserved.

