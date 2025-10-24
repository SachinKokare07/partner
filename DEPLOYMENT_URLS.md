# 🌐 Deployment URLs & Resources

## 🔗 Important Links

### Hosting Platforms
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://render.com/dashboard

### Firebase Console
- **Project Overview**: https://console.firebase.google.com/project/partner-b4e79
- **Firestore Rules**: https://console.firebase.google.com/project/partner-b4e79/firestore/rules
- **Firestore Indexes**: https://console.firebase.google.com/project/partner-b4e79/firestore/indexes
- **Authentication**: https://console.firebase.google.com/project/partner-b4e79/authentication/providers

### Gmail Setup
- **App Passwords**: https://myaccount.google.com/apppasswords

## 🎯 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. PREPARE FIREBASE
   ↓
   Deploy firestore.rules
   Create composite indexes
   ↓

2. DEPLOY BACKEND (Render)
   ↓
   Push to GitHub
   Connect repo to Render
   Add environment variables
   Deploy
   ↓
   📋 Copy Render URL: https://your-app.onrender.com
   ↓

3. DEPLOY FRONTEND (Vercel)
   ↓
   Import GitHub repo
   Add VITE_BACKEND_URL (Render URL)
   Deploy
   ↓
   📋 Copy Vercel URL: https://your-app.vercel.app
   ↓

4. UPDATE BACKEND
   ↓
   Add FRONTEND_URL (Vercel URL) in Render
   Redeploy
   ↓

5. ✅ DONE!
   Share your app: https://your-app.vercel.app
```

## 📝 Environment Variables Quick Reference

### Backend (Render)
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `PORT` | `5000` | Use 5000 |
| `NODE_ENV` | `production` | Use production |
| `FIREBASE_PROJECT_ID` | `partner-b4e79` | Firebase Console |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN..."` | Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | `firebase@partner...` | Firebase Admin SDK |
| `EMAIL_USER` | `your@gmail.com` | Your Gmail |
| `EMAIL_PASS` | `abcd efgh ijkl mnop` | Google App Password |
| `FRONTEND_URL` | `https://app.vercel.app` | After Vercel deploy |

### Frontend (Vercel)
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `VITE_BACKEND_URL` | `https://app.onrender.com` | After Render deploy |

## 🚀 Quick Commands

### Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Test Backend Locally
```bash
cd Backend
npm install
npm start
# Should see: Server running on port 5000
```

### Test Frontend Locally
```bash
cd Frontend
npm install
npm run dev
# Should see: Local: http://localhost:5173
```

## ✅ Post-Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured in both
- [ ] FRONTEND_URL updated in Render
- [ ] Firestore rules deployed
- [ ] Composite indexes created
- [ ] Test registration on live site
- [ ] Test login on live site
- [ ] Test partner request
- [ ] Test chat
- [ ] Test notes creation
- [ ] Test posts creation
- [ ] No CORS errors in browser console

## 🐛 Debugging URLs

### Check Backend Health
```
https://your-backend.onrender.com/
```
Should return: Server is running

### Check Frontend
```
https://your-frontend.vercel.app/
```
Should show your app homepage

### View Logs

**Render Logs**:
1. Go to Render dashboard
2. Click your web service
3. Click "Logs" tab
4. See real-time backend logs

**Vercel Logs**:
1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. See build logs

**Browser Console**:
1. Open your deployed app
2. Press F12
3. Go to "Console" tab
4. Check for errors

## 📱 Share Your App

Once deployed, share this:
```
Check out my Partner Progress Tracking App!
🔗 https://your-app.vercel.app

Features:
✨ Partner system for collaboration
💬 Real-time chat
📝 Notes with DSA/Dev categories
📊 Progress tracking with streaks
🎯 Like & comment system
```

## 🎊 Success Indicators

Your deployment is successful when:
- ✅ You can register a new account
- ✅ OTP email arrives
- ✅ You can login
- ✅ You can send partner request
- ✅ Chat works in real-time
- ✅ Notes are created and visible
- ✅ Posts show up in feed
- ✅ No CORS errors in console

## 🔄 Updating Your App

After making code changes:

**For Backend**:
1. Push to GitHub
2. Render auto-deploys (if connected to GitHub)
3. Or manually redeploy in Render dashboard

**For Frontend**:
1. Push to GitHub
2. Vercel auto-deploys (if connected to GitHub)
3. Or manually redeploy in Vercel dashboard

---

**Need help?** Check `QUICK_START.md` for step-by-step guide!
