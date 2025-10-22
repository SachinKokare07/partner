# 🧪 Quick Test Guide - Registration & OTP

## ⚡ Quick Start (3 Steps)

### Step 1: Start Backend (if not running)
```powershell
# Open terminal 1
cd C:\Users\SACHIN\OneDrive\Desktop\Partner\Backend
npm start
```

**Expected output:**
```
✅ Server running on port 5000
✅ Connected to Firebase
```

---

### Step 2: Start Frontend (if not running)
```powershell
# Open terminal 2
cd C:\Users\SACHIN\OneDrive\Desktop\Partner\Frontend
npm run dev
```

**Expected output:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5174/
```

---

### Step 3: Test Registration

1. **Open browser** → Go to `http://localhost:5174`

2. **Click "Get Started"**

3. **Fill form:**
   - Name: Test User
   - Email: YOUR_REAL_EMAIL@gmail.com  
   - Mobile: 1234567890
   - Password: test123
   - Confirm: test123

4. **Click "Register"**

5. **Watch browser console** (F12 → Console tab):
   ```
   ✅ Should see these logs:
   🔵 STEP 1: Form submitted!
   🔵 STEP 2: Calling register function...
   📧 Sending OTP to backend: http://localhost:5000
   📧 Request payload: {email: "...", otp: "123456", name: "..."}
   📧 Response status: 200 OK
   ✅ OTP email sent successfully
   🔵 STEP 3: Register result: {success: true}
   🔵 STEP 4: Switching to OTP screen...
   🟢 STEP 5: Step is now 2 - OTP screen should show!
   
   ❌ Should NOT see:
   ❌ User profile not found in Firestore. Signing out...
   ❌ Auth state changed: No user
   ```

6. **OTP screen should appear** → 6 input boxes

7. **Check your email** → Gmail inbox or spam folder

8. **Copy OTP** → 6-digit code (e.g., 123456)

9. **Paste OTP** → In the 6 boxes

10. **Click "Verify Email"**

11. **Should redirect to Dashboard** → You're logged in! 🎉

---

## 🔍 What to Check

### ✅ Success Indicators:

1. **Console logs show all 5 steps** (STEP 1 through STEP 5)
2. **OTP screen is visible** with 6 input boxes
3. **Email received** within 1 minute
4. **No error messages** in console
5. **Verification successful** → Dashboard loads

### ❌ Failure Indicators:

1. **"Network error"** → Backend not running (go to Step 1)
2. **"User profile not found"** → Old bug (should be fixed now)
3. **"Failed to send OTP"** → Check Backend/.env email credentials
4. **OTP screen not showing** → Check console logs for errors
5. **"Invalid OTP"** → Wrong code or expired (10 min limit)

---

## 🐛 Quick Fixes

### Problem: Backend not responding
```powershell
# Kill existing process and restart
netstat -ano | findstr :5000
# Note the PID (e.g., 24240)
taskkill /PID 24240 /F
cd Backend
npm start
```

### Problem: Email not received
- ✅ Check spam/junk folder
- ✅ Check "Promotions" tab in Gmail
- ✅ Wait 1-2 minutes (Gmail delay)
- ✅ Click "Resend OTP" button

### Problem: Console shows old error
```powershell
# Clear browser cache and reload
# Or use Ctrl+Shift+R (hard refresh)
```

---

## 📊 Expected Timeline

| Action | Expected Time |
|--------|--------------|
| Fill form | 30 seconds |
| Click Register | Instant |
| OTP generated | 0.5 seconds |
| Email sent | 2-5 seconds |
| Email received | 10-60 seconds |
| Enter OTP | 10 seconds |
| Verification | 1 second |
| Dashboard loads | Instant |

**Total**: ~1-2 minutes

---

## 🎯 Test Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5174/5175
- [ ] Form submitted successfully
- [ ] Console shows STEP 1-5 logs
- [ ] No "User profile not found" error
- [ ] OTP screen visible with 6 boxes
- [ ] Email received with OTP code
- [ ] OTP accepted and verified
- [ ] Redirected to Dashboard
- [ ] User logged in successfully

---

**If all checkboxes are ✅, the fix is working perfectly!** 🎉

**If any checkbox is ❌, check the REGISTRATION_OTP_FIX.md troubleshooting section.**
