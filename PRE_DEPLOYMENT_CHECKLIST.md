# 📋 Pre-Deployment Checklist

Before deploying your app, make sure you've completed these steps:

## 🔥 Firebase Console Setup

### 1. Deploy Firestore Rules
1. Go to https://console.firebase.google.com/project/partner-b4e79/firestore/rules
2. Copy the contents of your `firestore.rules` file
3. Paste and click "Publish"

### 2. Create Composite Indexes
Your app needs these indexes to work properly:

**For Notes Collection:**
- Collection: `notes`
- Fields: `userId` (Ascending) + `createdAt` (Descending)
- Create: https://console.firebase.google.com/project/partner-b4e79/firestore/indexes

**For Posts Collection:**
- Collection: `posts`
- Fields: `userId` (Ascending) + `createdAt` (Descending)

**Note**: Firebase will show you index creation links in the console when you try to query without indexes.

### 3. Verify Authentication Settings
1. Go to https://console.firebase.google.com/project/partner-b4e79/authentication/providers
2. Make sure "Email/Password" is enabled

## 📧 Email Setup (Gmail)

### Generate App Password for Nodemailer
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Click "Generate"
4. Copy the 16-character password
5. Use this as `EMAIL_PASS` in your Render environment variables

## 🔐 Environment Variables

### Backend (.env for Render)
```
PORT=5000
NODE_ENV=production
FIREBASE_PROJECT_ID=partner-b4e79
FIREBASE_PRIVATE_KEY="your-private-key-here"
FIREBASE_CLIENT_EMAIL=your-email@partner-b4e79.iam.gserviceaccount.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env for Vercel)
```
VITE_BACKEND_URL=https://your-backend.onrender.com
```

## 📂 File Structure Check
Make sure these files exist:
- [ ] `Backend/.env.example`
- [ ] `Backend/.gitignore`
- [ ] `Backend/server.js`
- [ ] `Frontend/.env.example`
- [ ] `Frontend/.gitignore`
- [ ] `Frontend/vercel.json`
- [ ] `firestore.rules`

## 🧪 Local Testing Before Deploy
Test these features locally:
- [ ] User registration with OTP
- [ ] User login
- [ ] Partner request send/accept
- [ ] Chat with partner
- [ ] Create notes (DSA/Dev)
- [ ] Create posts
- [ ] View partner's posts
- [ ] Like/comment on posts
- [ ] Delete notes/posts

## 🚀 Deployment Order
1. **Deploy Backend First** (Render)
   - Get the backend URL
2. **Deploy Frontend** (Vercel)
   - Use backend URL in environment variables
3. **Update Backend**
   - Add Vercel frontend URL to `FRONTEND_URL`

## ✅ Post-Deployment Testing
After deployment, test:
- [ ] Can register new account
- [ ] Can login
- [ ] Can send partner request
- [ ] Can chat
- [ ] Can create notes/posts
- [ ] No CORS errors in browser console

## 🐛 Common Issues

### "Failed to fetch" error
- Check backend URL in frontend env variables
- Verify Render service is running

### CORS policy error
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check CORS configuration in `server.js`

### Firebase permission denied
- Deploy firestore.rules to Firebase Console
- Check user is authenticated

### OTP email not sending
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASS in Render

## 📞 Need Help?
- Check browser console for errors
- Check Render logs for backend errors
- Check Vercel deployment logs for build errors

---

**Ready to deploy?** → See `QUICK_START.md`
