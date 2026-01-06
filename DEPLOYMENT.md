# Coffee Brewster - Deployment Guide

This guide will help you deploy Coffee Brewster to free hosting platforms.

## 🎯 Deployment Architecture

- **Frontend**: Vercel (Free)
- **Backend**: Render.com (Free)
- **Database**: Supabase PostgreSQL (Free)

Total cost: **$0/month** 🎉

---

## 📋 Prerequisites

1. GitHub account (for deploying from repository)
2. Accounts on the following platforms:
   - [Vercel](https://vercel.com) (for frontend)
   - [Render](https://render.com) (for backend)
   - [Supabase](https://supabase.com) (for database)

---

## 1️⃣ Database Setup (Supabase)

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click **"New project"**
3. Fill in:
   - **Name**: `coffee-brewster`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to:
   **Project Settings** → **Database** → **Connection string**
2. Select **"Connection pooling"** tab
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Replace `[PASSWORD]` with your database password
5. **Save this string** - you'll need it for backend deployment

### Step 3: Configure Database

The database schema will be automatically created when the backend starts for the first time (via `prisma db push` in the start command).

---

## 2️⃣ Backend Setup (Render)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `coffee-brewster-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     cd apps/api && npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     cd apps/api && npx prisma db push && npm start
     ```
   - **Plan**: **Free**

### Step 2: Add Environment Variables

In the **Environment** section, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Your Supabase connection string from Step 1.2 |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Will add after deploying frontend (Step 3) |

> **Important**: Leave `CORS_ORIGIN` empty for now. You'll update it after deploying the frontend.

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (~3-5 minutes)
3. Your API will be available at: `https://coffee-brewster-api.onrender.com`
4. **Save this URL** - you'll need it for frontend deployment

### Step 4: Verify Deployment

Visit: `https://coffee-brewster-api.onrender.com/healthz`

You should see: `{"status":"ok"}`

---

## 3️⃣ Frontend Setup (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Add Environment Variables

In **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render API URL from Step 2.3 |

Example: `https://coffee-brewster-api.onrender.com`

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. Your app will be available at: `https://coffee-brewster.vercel.app` (or your custom domain)
4. **Copy this URL**

### Step 4: Update Backend CORS

1. Go back to your **Render dashboard**
2. Select your `coffee-brewster-api` service
3. Go to **Environment** tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   https://coffee-brewster.vercel.app
   ```
5. Click **"Save Changes"** (this will redeploy the backend)

---

## 4️⃣ Final Configuration

### Update Frontend API Client

The frontend needs to know where to send API requests. Update the API base URL:

**Option A: Using Environment Variable (Recommended)**

If you added `VITE_API_URL` to Vercel environment variables, update `apps/web/src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

**Option B: Hardcode for Production**

Or directly set the production URL in `apps/web/src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://coffee-brewster-api.onrender.com';
```

After making this change, commit and push to trigger a new deployment on Vercel.

---

## 5️⃣ Post-Deployment Setup

### Seed the Database

The brewing methods need to be seeded. SSH into your Render service or run locally:

```bash
# Using Render Shell (in Render Dashboard → Shell)
cd apps/api && npm run db:seed
```

Or run it locally with your production database:

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-supabase-connection-string"
cd apps/api
npm run db:seed
```

### Test Your Deployment

1. Visit your Vercel URL: `https://coffee-brewster.vercel.app`
2. **Register** a new account
3. **Select a brewing method** (V60, Chemex, etc.)
4. **Configure and start** a brew
5. **Save a session** to test the full flow

---

## 🔧 Troubleshooting

### Frontend can't connect to backend

- Check that `CORS_ORIGIN` in Render matches your Vercel URL exactly
- Verify the API URL is correct in your frontend code
- Check browser console for CORS errors

### Database connection errors

- Verify your `DATABASE_URL` is correct
- Make sure you're using the **Connection Pooling** string from Supabase
- Check that the password doesn't contain special characters that need URL encoding

### API not starting on Render

- Check the build logs in Render dashboard
- Verify all environment variables are set
- Make sure `prisma generate` completed successfully in the build command

### Free tier limitations

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month (enough for one service running 24/7)

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments

**Supabase Free Tier:**
- 500 MB database storage
- Unlimited API requests
- Auto-pauses after 7 days of inactivity (easily resumed)

---

## 🚀 Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Push to `main` branch** → Both services automatically deploy
- **Pull requests** → Vercel creates preview deployments
- **Rollbacks** → Both platforms support instant rollbacks

---

## 🔐 Security Checklist

- ✅ Use strong `JWT_SECRET` (generated with `openssl rand -base64 32`)
- ✅ Never commit `.env` files to git
- ✅ Set `NODE_ENV=production` on Render
- ✅ Configure `CORS_ORIGIN` to only your frontend URL
- ✅ Use Supabase connection pooling string
- ✅ Enable HTTPS (automatic on Vercel and Render)

---

## 📊 Monitoring

### Render

- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Health checks**: Automatic via `/healthz` endpoint

### Vercel

- **Analytics**: Dashboard → Your Project → Analytics
- **Logs**: Dashboard → Your Project → Deployments → View Logs

### Supabase

- **Database**: Dashboard → Database → Tables
- **Logs**: Dashboard → Logs

---

## 🎨 Custom Domain (Optional)

### Vercel (Frontend)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Render (Backend)

1. Go to Service Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update `CORS_ORIGIN` to include your custom frontend domain

---

## 💡 Alternative Deployment Options

### Railway (Backend + Database)

If you prefer an all-in-one platform:

1. Deploy to [Railway](https://railway.app)
2. Add PostgreSQL plugin
3. Deploy the API service
4. Railway provides DATABASE_URL automatically

### Netlify (Frontend)

Alternative to Vercel:

1. Connect your repo to [Netlify](https://netlify.com)
2. Set base directory to `apps/web`
3. Build command: `npm run build`
4. Publish directory: `apps/web/dist`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

**Happy Deploying! ☕✨**

If you encounter issues, check the logs on each platform or open an issue on GitHub.
