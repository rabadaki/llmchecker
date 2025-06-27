# 🚀 GitHub + Vercel Deployment Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and create a new repository:
   - Repository name: `llm-checker` or `ai-discoverability-tool`
   - Description: `Website AI Discoverability Analysis Tool`
   - Make it **Public** (required for Vercel free tier)
   - Don't initialize with README (we already have one)

2. **Copy the repository URL** (e.g., `https://github.com/yourusername/llm-checker.git`)

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/llm-checker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your repository**:
   - Find your `llm-checker` repository
   - Click "Import"
4. **Configure project**:
   - Project Name: `llm-checker` or choose your preferred name
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (keep default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

## Step 4: Add Environment Variables

**Before deploying**, click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ttnjojqqntqlrrmvmmlz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpvanFxbnRxbHJybXZtbWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDg3MDQsImV4cCI6MjA2NjU4NDcwNH0.RSq5taC42v8Ct-ErdT7ocrO29Bg-4-youIzgO3ePepM` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project-name.vercel.app` |

💡 **Note**: Set `NEXT_PUBLIC_BASE_URL` to your actual Vercel domain after first deployment.

## Step 5: Deploy

1. **Click "Deploy"** - Vercel will build and deploy automatically
2. **Wait for deployment** (~2-3 minutes)
3. **Get your live URL** (e.g., `https://llm-checker-abc123.vercel.app`)

## Step 6: Update Base URL

1. **Copy your live Vercel URL**
2. **Go to Project Settings > Environment Variables**
3. **Edit `NEXT_PUBLIC_BASE_URL`** to your actual domain
4. **Redeploy** (Vercel will auto-redeploy)

## Step 7: Test Your Deployment

Visit your live URL and test:
- ✅ Homepage loads
- ✅ Site analysis works
- ✅ Multi-site discovery works
- ✅ Results sharing works
- ✅ Mobile responsive

## 🎯 What You Get

- **Live URL**: `https://your-project.vercel.app`
- **Auto SSL**: Secure HTTPS
- **Global CDN**: Fast worldwide access
- **Auto Deployments**: Every push to `main` deploys
- **Preview URLs**: Every PR gets a preview deployment
- **Analytics**: Usage metrics in Vercel dashboard

## 🔄 Future Updates

To update your live site:
1. Make changes to your code
2. Commit and push to GitHub
3. Vercel automatically deploys the new version

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 🛠️ Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding/changing variables
- Check spelling and values

### 404 on API Routes
- Verify files are in `src/app/api/` directory
- Check route.ts file exports
- Ensure proper HTTP methods

### Supabase Connection Issues
- Verify Supabase URL and key
- Check Supabase project is active
- Test database connection locally first

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Use the Issues tab in your repository
- **Vercel Support**: Available in dashboard