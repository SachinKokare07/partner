# 🔧 Troubleshooting Guide

Common issues and their solutions when deploying your Partner app.

## 🚨 CORS Errors

### Problem
Browser console shows:
```
Access to fetch at 'https://backend.onrender.com/api/...' from origin 'https://app.vercel.app' 
has been blocked by CORS policy
```

### Solutions

1. **Check FRONTEND_URL in Render**
   - Go to Render dashboard → Your service → Environment
   - Verify `FRONTEND_URL` exactly matches your Vercel URL
   - Should be: `https://your-app.vercel.app` (no trailing slash)
   - Click "Save Changes" to redeploy

2. **Check CORS Configuration in server.js**
   - Open `Backend/server.js`
   - Verify this code exists around line 15-30:
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'http://localhost:5174',
     'http://localhost:5175',
     process.env.FRONTEND_URL,
   ].filter(Boolean);

   app.use(cors({
     origin: function(origin, callback) {
       if (!origin) return callback(null, true);
       if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
   }));
   ```

3. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Hard refresh: Ctrl+Shift+R

---

## 🔥 Firebase Errors

### Problem 1: "Permission Denied" when creating notes/posts
```
Error: Missing or insufficient permissions
```

### Solution
1. Go to Firebase Console → Firestore → Rules
2. Copy your `firestore.rules` file content
3. Paste and click "Publish"
4. Wait 1-2 minutes for propagation

### Problem 2: "The query requires an index"
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### Solution
1. Click the link in the error message
2. It will open Firebase Console with pre-filled index
3. Click "Create Index"
4. Wait for index to build (1-5 minutes)
5. Try the operation again

### Problem 3: "Firebase App Not Initialized"
```
Firebase: No Firebase App '[DEFAULT]' has been created
```

### Solution
1. Check your `Frontend/src/firebase.js` or similar
2. Verify Firebase config is correct
3. Make sure Firebase is initialized before any other imports

---

## 📧 OTP Email Not Sending

### Problem
Users don't receive OTP verification emails

### Solutions

1. **Check Gmail App Password**
   - Regular Gmail password won't work
   - Must use App Password
   - Generate: https://myaccount.google.com/apppasswords
   - Copy the 16-character password (no spaces)
   - Use as `EMAIL_PASS` in Render

2. **Verify Environment Variables in Render**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop (16 characters)
   ```

3. **Check Render Logs**
   - Go to Render dashboard → Logs
   - Look for errors like "Invalid credentials"
   - If you see auth errors, regenerate app password

4. **Enable Less Secure App Access** (if needed)
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Then create App Password

---

## 🌐 Deployment Failures

### Problem: Render Build Failed
```
Error: Cannot find module 'express'
```

### Solution
1. Check `Backend/package.json` exists
2. Verify build command in Render: `npm install`
3. Check start command: `npm start`
4. Make sure `node_modules` is in `.gitignore`

### Problem: Vercel Build Failed
```
Error: Build failed with exit code 1
```

### Solutions
1. Check `Frontend/package.json` exists
2. Verify build command: `npm run build`
3. Check output directory: `dist`
4. Make sure all imports are correct (case-sensitive!)
5. Check Vercel logs for specific error

### Problem: Backend Shows "Application Error"
```
Application failed to respond
```

### Solutions
1. Check Render logs for errors
2. Verify all environment variables are set
3. Make sure `PORT` env variable is set to `5000`
4. Check `server.js` starts properly

---

## 🔐 Authentication Issues

### Problem: "User not found" after registration

### Solution
1. Check Firebase Authentication is enabled
2. Go to: https://console.firebase.google.com/project/partner-b4e79/authentication/providers
3. Enable "Email/Password" provider
4. Make sure OTP verification completed

### Problem: Can't login after registration

### Solutions
1. Check Firestore rules allow read/write to users collection
2. Verify user document was created in Firestore
3. Check browser console for errors
4. Clear browser cache and cookies

---

## 💬 Chat Issues

### Problem: Messages not sending/receiving

### Solutions
1. Check Firestore rules allow access to messages collection
2. Verify partner relationship exists in users collection
3. Check browser console for permission errors
4. Make sure both users have accepted partner request

### Problem: Partner dropdown not showing

### Solution
1. Must have 2+ friends to show dropdown
2. Check messages collection has conversations
3. Verify fetchAllPartners function works

---

## 📝 Notes/Posts Issues

### Problem: "Creating note..." but never completes

### Solutions
1. Check composite index exists:
   - Collection: `notes` or `posts`
   - Fields: `userId` (Ascending) + `createdAt` (Descending)
2. Create index in Firebase Console
3. Wait for index to build

### Problem: Can't see partner's notes/posts

### Solutions
1. Verify partner relationship exists
2. Check Firestore rules allow reading partner's documents
3. Make sure partner has created some notes/posts

---

## 🐌 Performance Issues

### Problem: Backend responds slowly (first request)

### Explanation
- Render free tier sleeps after 15 minutes of inactivity
- First request "wakes up" the service (takes 30-60 seconds)
- Subsequent requests are fast

### Solutions
1. **Upgrade to Paid Plan** ($7/month)
   - Removes sleep behavior
   - Always-on server
   - Faster response times

2. **Keep Alive Service** (free)
   - Use a service like UptimeRobot
   - Pings your backend every 5 minutes
   - Keeps it awake

3. **Accept the Delay**
   - First load is slow
   - Rest is fast
   - Good enough for side projects

---

## 🔍 Debugging Steps

### Step 1: Check Backend Health
Visit: `https://your-backend.onrender.com/`
- Should show: "Server is running"
- If error, check Render logs

### Step 2: Check Frontend
Visit: `https://your-frontend.vercel.app/`
- Should show your app
- If error, check Vercel deployment logs

### Step 3: Open Browser Console
Press F12 → Console tab
- Look for red errors
- Check for CORS errors
- Check for Firebase errors

### Step 4: Check Render Logs
Render dashboard → Your service → Logs
- Look for error messages
- Check for missing env variables
- Verify server started successfully

### Step 5: Check Vercel Logs
Vercel dashboard → Your project → Deployments → Latest
- Look for build errors
- Check for import errors
- Verify build succeeded

---

## 📞 Still Need Help?

### Check These Files
1. `QUICK_START.md` - Deployment steps
2. `PRE_DEPLOYMENT_CHECKLIST.md` - What to verify
3. `DEPLOYMENT_URLS.md` - All important links

### Debug Checklist
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All environment variables set
- [ ] FRONTEND_URL matches Vercel URL exactly
- [ ] VITE_BACKEND_URL matches Render URL exactly
- [ ] Firestore rules deployed
- [ ] Composite indexes created
- [ ] Firebase Authentication enabled
- [ ] Gmail app password generated
- [ ] No errors in browser console
- [ ] No errors in Render logs
- [ ] No errors in Vercel logs

### Common Fixes
1. **Redeploy everything**
   - Redeploy backend on Render
   - Redeploy frontend on Vercel
   - Clear browser cache

2. **Double check URLs**
   - No trailing slashes
   - Correct https:// protocol
   - Exact match (case-sensitive)

3. **Wait a bit**
   - DNS propagation takes time
   - Index building takes 1-5 minutes
   - First deploy may be slow

---

## ✅ Verification Commands

### Test Backend
```bash
curl https://your-backend.onrender.com/
# Should return: Server is running
```

### Test Frontend
```bash
curl https://your-frontend.vercel.app/
# Should return HTML
```

### Check Environment Variables (locally)
```bash
# Backend
cd Backend
cat .env

# Frontend
cd Frontend
cat .env
```

---

**Most issues are environment variable or Firebase configuration problems!**
Double-check these first before diving deeper. 🔍
