# 🔧 Production API Fix - 405 Error Resolution

## Issue Identified
The `/api/discover-sites` 405 error was caused by the **logger trying to write to log files** in Vercel's serverless environment, which doesn't allow file system writes.

## ✅ Fix Applied
Updated the logger to be **production-friendly**:
- Console-only logging in production
- File logging only in development
- Fallback error handling

## 📤 Deploy the Fix

### Option 1: Auto-Deploy (if GitHub connected)
If you've already connected GitHub to Vercel:
```bash
git push origin main
```
Vercel will auto-deploy the fix in ~2 minutes.

### Option 2: Manual Deploy
If using Vercel CLI:
```bash
vercel --prod
```

## 🧪 Test After Deploy
1. **Visit your live site**
2. **Try the site analysis** - enter any URL
3. **Check if discovery works** - no more 405 errors
4. **Verify in browser console** - should see no API errors

## 📊 What Was Changed
- `src/lib/utils/logger.ts` - Production-safe winston config
- `src/lib/utils/simple-logger.ts` - Fallback logger (if needed)
- Removed file system dependencies

## 🚀 Expected Result
- ✅ API routes work properly
- ✅ Site discovery functions
- ✅ Multi-site analysis works
- ✅ No more 405 errors
- ✅ Console logging works in Vercel

## 🔍 Verify Fix
Check Vercel function logs:
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Functions" tab
4. Check API route logs - should show successful requests

## 📞 Still Having Issues?
If you still see 405 errors after deploying this fix:
1. Check Vercel function logs for details
2. Verify environment variables are set
3. Try a hard refresh (Ctrl+F5 / Cmd+Shift+R)
4. Check Network tab in browser dev tools