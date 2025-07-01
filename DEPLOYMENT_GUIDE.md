# LLM Checker Deployment Guide

## 🚀 Quick Deploy

We've created scripts to automate the deployment process:

### 1. Run the Deployment Script

```bash
./scripts/deploy.sh
```

This script will:
- ✅ Check for uncommitted changes
- ✅ Run tests
- ✅ Build the project
- ✅ Push to GitHub
- ✅ Deploy to Vercel

### 2. Set Up Environment Variables

```bash
node scripts/setup-env.js
```

This will help you configure environment variables in Vercel.

## 📋 Manual Deployment Steps

If you prefer to deploy manually:

### Step 1: Prepare Your Code

```bash
# Commit any changes
git add .
git commit -m "Prepare for deployment"

# Run tests
npm test

# Build the project
npm run build
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | ✅ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | ❌ |

### Step 4: Update Production URLs

After deployment, update these in Vercel:
- `NEXT_PUBLIC_API_URL` → `https://your-app.vercel.app`
- `NEXT_PUBLIC_BASE_URL` → `https://your-app.vercel.app`

## 🔧 Post-Deployment Setup

### 1. Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 2. GitHub Integration
1. Go to Vercel Dashboard → Settings → Git
2. Connect your GitHub repository
3. Enable automatic deployments

### 3. Enable CI/CD
1. Push code to GitHub to activate workflows
2. Go to GitHub Settings → Secrets → Actions
3. Add `CODECOV_TOKEN` (get from codecov.io)

### 4. Branch Protection
1. Go to GitHub Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks (CI tests)
   - Include administrators

## 🎯 Deployment Checklist

- [ ] All tests passing
- [ ] Build successful locally
- [ ] Environment variables configured
- [ ] Supabase connection verified
- [ ] Production URLs updated
- [ ] Custom domain configured (optional)
- [ ] GitHub integration enabled
- [ ] CI/CD workflows active

## 🔍 Verify Deployment

After deployment, verify:

1. **Homepage loads**: `https://your-app.vercel.app`
2. **API works**: `https://your-app.vercel.app/api/analyze`
3. **Analysis runs**: Test with a real URL
4. **Results save**: Check Supabase dashboard

## 🆘 Troubleshooting

### Build Fails
- Check `npm run build` locally
- Review build logs in Vercel

### API Errors
- Verify environment variables
- Check Supabase connection
- Review function logs in Vercel

### Slow Performance
- API routes have 60s timeout
- Consider optimizing heavy operations
- Check Vercel function logs

## 📊 Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Function Logs**: Real-time API logs
3. **Error Tracking**: Set up Sentry (optional)
4. **Uptime Monitoring**: Use Better Uptime (optional)

## 🔄 Continuous Deployment

With GitHub integration enabled:
- Push to `main` → Production deployment
- Push to other branches → Preview deployments
- Pull requests → Preview URLs in PR comments

---

Need help? Check the [Vercel Documentation](https://vercel.com/docs) or open an issue on GitHub.