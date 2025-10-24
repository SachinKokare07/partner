# Deployment Guide - Partner App

## 🚀 Deploying Your Application

Your app has 2 parts that need to be deployed:
1. **Backend** (Node.js/Express) → Deploy to Render.com
2. **Frontend** (React/Vite) → Deploy to Vercel

---

## 📦 Part 1: Deploy Backend to Render

### Step 1: Push code to GitHub (if not already)
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**

### Step 3: Configure Render
1. **Connect Repository**: Select `partner` repo
2. **Root Directory**: `Backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Plan**: Free

### Step 4: Add Environment Variables in Render
Click **"Environment"** and add:
```
PORT=5000
NODE_ENV=production
FIREBASE_PROJECT_ID=partner-b4e79
FIREBASE_PRIVATE_KEY=(your firebase private key)
FIREBASE_CLIENT_EMAIL=(your firebase client email)
EMAIL_USER=(your gmail)
EMAIL_PASS=(your gmail app password)
FRONTEND_URL=https://your-app.vercel.app
```

### Step 5: Deploy
Click **"Create Web Service"** - Render will deploy automatically!

**Your backend URL will be**: `https://your-app-name.onrender.com`

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**

### Step 2: Import Repository
1. Select `partner` repository
2. **Root Directory**: `Frontend`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Step 3: Add Environment Variables
In Vercel dashboard, add:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Step 4: Update Firebase Config
In your Firebase config, make sure to use environment variables for the backend URL.

### Step 5: Deploy
Click **"Deploy"** - Vercel will build and deploy!

**Your frontend URL will be**: `https://your-app.vercel.app`

---

## 🔄 After Both Are Deployed

### Update Backend CORS
1. Go to Render dashboard
2. Add your Vercel URL to `FRONTEND_URL` environment variable
3. Redeploy backend

### Update Frontend API URL
1. Update your frontend code to use the Render backend URL
2. Redeploy frontend

---

## ✅ Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Firebase security rules deployed
- [ ] Test registration and login
- [ ] Test all features

---

## 🐛 Common Issues

**CORS Errors**: Make sure FRONTEND_URL is set in Render env variables
**Firebase Errors**: Verify Firebase credentials are correct
**Build Errors**: Check Node version (use Node 18+)

---

## 📱 Access Your App

Once deployed, share this URL with everyone:
**https://your-app.vercel.app**

Your backend will be at:
**https://your-backend.onrender.com**
