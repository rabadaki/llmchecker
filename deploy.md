# Deployment Instructions

## Step 1: Login to Vercel
```bash
cd /Users/Amos/Developer/projects/llm-checker/frontend
vercel login
```
Choose your preferred login method (GitHub recommended).

## Step 2: Deploy
```bash
vercel --prod
```

## Step 3: Configure Environment Variables in Vercel Dashboard
After deployment, go to your Vercel dashboard and add these environment variables:

1. `NEXT_PUBLIC_SUPABASE_URL` = `https://ttnjojqqntqlrrmvmmlz.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpvanFxbnRxbHJybXZtbWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDg3MDQsImV4cCI6MjA2NjU4NDcwNH0.RSq5taC42v8Ct-ErdT7ocrO29Bg-4-youIzgO3ePepM`
3. `NEXT_PUBLIC_BASE_URL` = `https://your-actual-vercel-domain.vercel.app`

## Step 4: Redeploy
After setting environment variables:
```bash
vercel --prod
```

## Alternative: Deploy via Git
1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in dashboard
4. Auto-deploy on push

## Project Configuration
- ✅ Next.js 15.3.4
- ✅ TypeScript
- ✅ Supabase integration
- ✅ Build optimization
- ✅ API routes configured
- ✅ 30-second function timeout