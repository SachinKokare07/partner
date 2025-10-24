# 🚀 Quick Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)

## Step 1: Deploy Backend (5 minutes)
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables from `Backend/.env.example`
6. Click "Create Web Service"
7. **Copy your Render URL** (e.g., `https://partner-abc123.onrender.com`)

## Step 2: Deploy Frontend (3 minutes)
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `Frontend`
   - **Framework Preset**: Vite
5. Add environment variable:
   - `VITE_BACKEND_URL` = `https://your-render-url.onrender.com`
6. Click "Deploy"

## Step 3: Update Backend URL in Render
1. Go back to Render dashboard
2. Open your web service
3. Go to "Environment"
4. Update `FRONTEND_URL` with your Vercel URL
5. Click "Save Changes" (auto redeploys)

## ✅ Done!
Your app is now live at your Vercel URL!

## 🔥 Important Notes
- **First load may be slow** (Render free tier sleeps after inactivity)
- **Firebase Rules**: Make sure to deploy your firestore.rules in Firebase Console
- **Indexes**: Create composite indexes in Firebase Console (check console for links)

## 📝 Environment Variables Checklist

### Backend (Render)
- [ ] `PORT=5000`
- [ ] `NODE_ENV=production`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `FRONTEND_URL` (your Vercel URL)

### Frontend (Vercel)
- [ ] `VITE_BACKEND_URL` (your Render URL)

## 🐛 Troubleshooting
- **CORS Error**: Check FRONTEND_URL in Render matches your Vercel URL
- **Firebase Error**: Verify all Firebase env variables are correct
- **Build Failed**: Check Node version (should be 18+)
