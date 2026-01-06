# Deployment Checklist ✅

Use this checklist to ensure everything is configured correctly before deploying.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All tests pass locally (`npm test`)
- [ ] Environment variables are documented in `.env.example` files
- [ ] No secrets or credentials in the codebase (check `.gitignore`)
- [ ] Database schema is finalized

## Database (Supabase)

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection pooling string copied
- [ ] Database schema will be auto-created on first deploy

## Backend (Render)

- [ ] Render account created and linked to GitHub
- [ ] Web service configured with correct build/start commands
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=4000`
  - [ ] `DATABASE_URL` (from Supabase)
  - [ ] `JWT_SECRET` (generated with `openssl rand -base64 32`)
  - [ ] `CORS_ORIGIN` (will be updated after frontend deployment)
- [ ] Service deployed successfully
- [ ] Health check works: `https://your-api.onrender.com/healthz`
- [ ] Database seeded: `npm run db:seed`

## Frontend (Vercel)

- [ ] Vercel account created and linked to GitHub
- [ ] Project configured with correct root directory (`apps/web`)
- [ ] Build settings correct (Vite preset)
- [ ] Environment variables set:
  - [ ] `VITE_API_URL` (your Render API URL)
- [ ] Deployment successful
- [ ] App loads correctly in browser

## Post-Deployment

- [ ] Updated `CORS_ORIGIN` on Render to match Vercel URL
- [ ] Backend redeployed after CORS update
- [ ] Test complete user flow:
  - [ ] Registration works
  - [ ] Login works
  - [ ] Can select brewing method
  - [ ] Can configure and start brew
  - [ ] Can save session to logbook
  - [ ] Settings persist correctly
- [ ] PWA installs correctly on mobile
- [ ] Tested on multiple devices/browsers
- [ ] Analytics/monitoring set up (optional)

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL/HTTPS verified (automatic on Vercel/Render)
- [ ] GitHub Actions workflow running
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Performance monitoring configured

## Common Issues

If something doesn't work:

1. **Frontend can't reach backend**: Check CORS_ORIGIN matches exactly
2. **Database errors**: Verify DATABASE_URL and run `prisma db push`
3. **Auth not working**: Check JWT_SECRET is set and consistent
4. **Slow first load**: Render free tier spins down after inactivity (30s cold start)

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
