# Deployment Guide: Vercel + Railway

This guide will help you deploy your Cal.com-like scheduling platform to production.

## Prerequisites

1. **GitHub Account** - Both Vercel and Railway deploy from Git repositories
2. **Railway Account** - Sign up at https://railway.app
3. **Vercel Account** - Sign up at https://vercel.com

## Step 1: Initialize Git Repository

In your project root directory, initialize Git and push to GitHub:

```bash
# In d:\Scheduling Platform (root)
git init
git add .
git commit -m "Initial commit: Cal.com scheduling platform"
```

Create a GitHub repository and push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/scheduling-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway

### 2a. Create a Railway Project

1. Go to https://railway.app and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. If first time: Authorize GitHub
4. Select your `scheduling-platform` repository

### 2b. Add Variables

In Railway project settings, go to **Variables** and add:

```
DB_HOST=<railway-mysql-host>
DB_USER=root
DB_PASSWORD=<generated-password>
DB_NAME=scheduling_platform
DB_PORT=3306
PORT=8000
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
```

### 2c. Add MySQL Service

1. In Railway, click **"Add"** button
2. Select **"Database"** → **"MySQL"**
3. Railway will generate DB_HOST, DB_USER, DB_PASSWORD automatically
4. Copy these values to your Backend service variables

### 2d. Configure for Backend Deployment

Create `railway.json` in backend folder:

```json
{
  "build": {
    "builder": "nixpacks",
    "config": {
      "nixpacks": {
        "providers": ["nodejs-npm"]
      }
    }
  }
}
```

## Step 3: Deploy Frontend to Vercel

### 3a. Connect Repository

1. Go to https://vercel.com and sign up
2. Click **"New Project"** → **Import Git Repository**
3. Select your `scheduling-platform` repository

### 3b. Configure Project

When importing:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3c. Set Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

```
REACT_APP_API_URL=https://your-railway-backend-url/api
```

Replace `your-railway-backend-url` with your actual Railway URL (e.g., `https://scheduling-platform-prod-env.up.railway.app`)

## Step 4: Update Backend for CORS

Edit `backend/server.js` to allow Vercel frontend:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-vercel-domain.vercel.app',
    'https://scheduling-platform.vercel.app' // Your actual Vercel URL
  ],
  credentials: true
};
```

## Step 5: First Deployment

### Deploy Backend:
1. Railway auto-deploys when you push to main
2. Check deployment logs in Railway dashboard
3. Note your backend URL from Railway

### Deploy Frontend:
1. In Vercel, update `REACT_APP_API_URL` with your Railway backend URL
2. Vercel auto-deploys on push to main
3. Your app should now be live!

## Environment Variables Summary

### Backend (.env in production)
```
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=<your-password>
DB_NAME=scheduling_platform
DB_PORT=3306
PORT=8000
NODE_ENV=production
SESSION_SECRET=<long-random-string>
```

### Frontend (.env in production)
```
REACT_APP_API_URL=https://your-backend-railway-url.up.railway.app/api
```

## Troubleshooting

### "Cannot connect to database"
- Check MySQL service is running in Railway
- Verify DB credentials in environment variables
- Ensure firewall allows connection

### "CORS errors in browser console"
- Update the `corsOptions` in backend/server.js
- Redeploy backend
- Clear browser cache (Ctrl+Shift+Delete)

### "Frontend showing blank page"
- Check browser console (F12) for errors
- Verify `REACT_APP_API_URL` is correct
- Check network tab to see API calls

### "Bookings not saving"
- Check backend logs in Railway
- Verify database credentials
- Check if database tables were created

## Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. In Vercel project settings → Domains
2. Enter your domain (e.g., myscheduler.com)
3. Follow DNS configuration steps

### Add Custom Domain to Railway:
1. In Railway, open Backend service
2. Click Settings → Custom Domain
3. Follow DNS configuration steps

## Monitoring & Debugging

- **Railway Logs**: Click service → View Logs
- **Vercel Logs**: Click project → Deployments → View logs
- **Frontend Errors**: Browser DevTools (F12) → Console
- **Backend Errors**: Railway dashboard logs

## Security Tips

- ✓ Use strong SESSION_SECRET in production
- ✓ Never commit .env files
- ✓ Use HTTPS for all connections
- ✓ Keep dependencies updated
- ✓ Review environment variables before deployment

---

**Questions?** Check Railway docs: https://docs.railway.app
