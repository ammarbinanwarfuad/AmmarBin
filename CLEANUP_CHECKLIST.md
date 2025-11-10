# Cleanup Checklist - AmmarBin Portfolio

Quick reference checklist for removing unnecessary code.

## ✅ COMPLETED

- [x] Fixed `use-debounce` import error in MediaClient.tsx
- [x] Removed unused `isLoading` variables (3 files)
- [x] Removed unused eslint-disable directive
- [x] Build successful ✅
- [x] Lint warnings fixed ✅

---

## 🗑️ FILES TO DELETE

### High Priority - Delete Now

```bash
# Unused hooks
rm hooks/useColumnVirtualization.ts

# Unused utilities (if not using Vercel KV)
rm lib/redis-cache.ts
rm lib/websocket-client.ts
rm lib/error-tracker.ts
rm lib/performance-monitor.ts
rm lib/cursor-pagination.ts
rm lib/swrLocalStorageProvider.ts

# Incomplete PWA
rm app/offline/page.tsx
rm app/manifest.ts

# Unused API routes (verify first)
rm app/api/rum/route.ts
rm app/api/admin/cache-stats/route.ts
```

---

## 📦 DEPENDENCIES TO REMOVE

### Update package.json

```bash
npm uninstall @vercel/kv
npm uninstall @tanstack/react-virtual
npm uninstall dotenv
```

### Optional (if not using external blog sync)
```bash
npm uninstall cheerio
npm uninstall rss-parser
```

---

## 🔧 CODE CHANGES NEEDED

### 1. Remove Redis Cache Usage

**Files to update:**
- `app/api/projects/route.ts` - Remove redis-cache import
- `app/api/contact/route.ts` - Remove redis-cache import
- `app/admin/dashboard/page.tsx` - Remove redis-cache import
- `app/api/admin/analytics/route.ts` - Remove redis-cache import

**Replace with:** Next.js `unstable_cache`

### 2. Remove Cursor Pagination

**File to update:**
- `app/api/contact/route.ts` - Use standard offset pagination

### 3. Remove Custom Performance Monitoring

**File to update:**
- `components/ClientPerformanceMonitor.tsx` - Simplify or remove

### 4. Remove WebSocket References

**Check these files:**
- Search for `createDashboardWebSocket` imports
- Remove any WebSocket initialization code

---

## 🧹 CLEANUP COMMANDS

### Run these commands in order:

```bash
# 1. Remove unused files
rm hooks/useColumnVirtualization.ts
rm lib/websocket-client.ts
rm lib/error-tracker.ts
rm lib/performance-monitor.ts
rm lib/cursor-pagination.ts
rm lib/swrLocalStorageProvider.ts
rm app/offline/page.tsx
rm app/manifest.ts

# 2. Remove unused dependencies
npm uninstall @vercel/kv @tanstack/react-virtual dotenv

# 3. If not using Vercel KV, remove redis cache
rm lib/redis-cache.ts
rm app/api/admin/cache-stats/route.ts

# 4. Clean build cache
rm -rf .next node_modules/.cache

# 5. Rebuild
npm run build

# 6. Run lint
npm run lint

# 7. Run tests (if you have them)
npm run test
```

---

## 📋 VERIFICATION STEPS

After cleanup:

1. ✅ Build succeeds: `npm run build`
2. ✅ No lint errors: `npm run lint`
3. ✅ Dev server works: `npm run dev`
4. ✅ Admin login works
5. ✅ All pages load correctly
6. ✅ API routes respond
7. ✅ No console errors

---

## 🎯 EXPECTED RESULTS

### Before Cleanup
- Dependencies: 67
- Bundle size: ~X MB
- Build time: ~20s
- Unused code: ~2000 lines

### After Cleanup
- Dependencies: ~60 (-7)
- Bundle size: ~X-0.5 MB (-550KB)
- Build time: ~18s (-2s)
- Unused code: 0 lines

---

## ⚠️ WARNINGS

### DO NOT DELETE

- ✅ `lib/db.ts` - Database connection (KEEP)
- ✅ `lib/auth.ts` - Authentication (KEEP)
- ✅ `lib/cache.ts` - Next.js cache utilities (KEEP)
- ✅ `lib/logger.ts` - Production logging (KEEP)
- ✅ `lib/cloudinary.ts` - Image hosting (KEEP)
- ✅ `lib/github.ts` - GitHub sync (KEEP if using)
- ✅ `lib/email.ts` - Contact form (KEEP)
- ✅ All models in `models/` - Database schemas (KEEP)
- ✅ All components in `components/ui/` - UI library (KEEP)

### VERIFY BEFORE DELETING

- ⚠️ `lib/blog-fetchers.ts` - Check if external blog sync is used
- ⚠️ `/admin/calendar` - Check if calendar feature is used
- ⚠️ `/admin/scheduled-tasks` - Check if tasks are scheduled
- ⚠️ `cheerio` & `rss-parser` - Only if not syncing external blogs

---

## 🚀 QUICK START

**Safest approach (recommended):**

```bash
# 1. Create a backup branch
git checkout -b cleanup-unused-code

# 2. Delete obviously unused files
rm hooks/useColumnVirtualization.ts
rm lib/websocket-client.ts

# 3. Remove unused dependencies
npm uninstall @tanstack/react-virtual dotenv

# 4. Test
npm run build
npm run dev

# 5. If successful, commit
git add .
git commit -m "Remove unused code and dependencies"

# 6. Continue with more deletions
```

---

## 📞 NEED HELP?

If build fails after cleanup:
1. Check the error message
2. Restore deleted file if needed
3. Update imports in affected files
4. Run `npm install` if dependency issues

---

**Created:** November 30, 2025  
**Status:** Ready for cleanup  
**Estimated time:** 30-60 minutes
