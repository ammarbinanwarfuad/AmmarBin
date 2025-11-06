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

### Security

- Password hashing with bcrypt
- Rate limiting on login attempts
- Session management with NextAuth
- Protected API routes
- CSRF protection
- Secure headers

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

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel automatically:
- Detects Next.js
- Optimizes builds
- Provides CDN
- Enables analytics

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

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ by Ammar Bin Anwar Fuad using Next.js 16**

