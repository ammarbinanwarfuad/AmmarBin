# Vercel KV Setup Guide

Vercel KV is an optional Redis cache that improves API performance by 50-90%. The application works without it, but enabling it provides significant performance benefits.

## Why Use Vercel KV?

- **Faster API Responses**: Cache frequently accessed data (projects, blog posts, skills)
- **Reduced Database Load**: Fewer MongoDB queries
- **Better User Experience**: Instant page loads for cached content
- **Cost Effective**: Free tier includes 30,000 commands/month

## Setup Instructions

### 1. Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (AmmarBin)
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name (e.g., `ammarbin-cache`)
7. Select region closest to your users
8. Click **Create**

### 2. Connect to Your Project

1. After creation, click **Connect to Project**
2. Select your project from the dropdown
3. Click **Connect**
4. Vercel will automatically add environment variables

### 3. Environment Variables (Automatic)

Vercel automatically injects these variables in production:
```
KV_URL
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

### 4. Local Development Setup (Optional)

To use KV cache in local development:

1. Go to your Vercel project → **Storage** → **KV Database**
2. Click on your KV database
3. Go to **Settings** tab
4. Copy the `.env.local` tab content
5. Add to your local `.env.local` file:

```env
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### 5. Verify Setup

After deployment, check if caching is working:

1. Go to `/admin/dashboard` (requires login)
2. Look for cache statistics
3. Or check API response times - they should be faster on subsequent requests

## What Gets Cached?

The application caches:

- **Projects** (10 minutes)
- **Blog Posts** (10 minutes)
- **Skills** (10 minutes)
- **Education** (30 minutes)
- **Experience** (30 minutes)
- **Certifications** (30 minutes)
- **Profile** (1 hour)
- **Messages** (2 minutes)
- **Analytics** (5 minutes)

## Cache Invalidation

Cache is automatically invalidated when:
- Content is created, updated, or deleted via admin panel
- Manual cache clear from admin dashboard

## Monitoring

View cache performance in admin dashboard:
- Cache hit rate
- Total cached keys
- Cache breakdown by type
- Performance improvements

## Troubleshooting

### Cache Not Working?

1. Check environment variables are set in Vercel
2. Verify KV database is connected to project
3. Check logs for Redis connection errors
4. Ensure `@vercel/kv` package is installed

### Want to Disable Caching?

The app gracefully handles missing KV configuration. Simply don't set up Vercel KV, and the app will fetch data directly from MongoDB.

## Cost

- **Free Tier**: 30,000 commands/month, 256 MB storage
- **Pro Tier**: 500,000 commands/month, 1 GB storage
- For most portfolios, free tier is sufficient

## Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis Commands Reference](https://redis.io/commands)
- [Pricing Details](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
