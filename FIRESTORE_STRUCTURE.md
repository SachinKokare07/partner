# Firestore Database Structure - Partner Project

## 📊 Visual Structure

```
Firebase Project: partner-b4e79
│
├── 🔥 Firestore Database
│   │
│   └── 📁 users (Collection)
│       │
│       ├── 📄 {userId1} (Document - Auto-generated ID)
│       │   ├── 👤 name: "Sachin Sharma"
│       │   ├── 📧 email: "sachin@example.com"
│       │   ├── 📱 mobile: "+919876543210"
│       │   ├── 📚 course: "B.Tech Computer Science"
│       │   ├── 🏫 college: "ABC Institute of Technology"
│       │   ├── 📅 year: "3rd Year"
│       │   ├── ⏰ startDate: 2025-10-18T10:30:00Z
│       │   ├── 💻 dsa: 25 (DSA problems solved)
│       │   ├── 🛠️ dev: 18 (Dev projects completed)
│       │   ├── 🔥 streak: 7 (Current streak days)
│       │   ├── 📈 total: 43 (dsa + dev)
│       │   ├── 🤝 partner: null (Partner's userId or null)
│       │   └── 📬 pendingRequests: [] (Array of userIds)
│       │
│       ├── 📄 {userId2} (Another User Document)
│       │   ├── 👤 name: "Priya Singh"
│       │   ├── 📧 email: "priya@example.com"
│       │   ├── 📱 mobile: "+919876543211"
│       │   ├── 💻 dsa: 30
│       │   ├── 🛠️ dev: 20
│       │   ├── 📈 total: 50
│       │   └── ... (same structure)
│       │
│       └── 📄 {userId3} (More users...)
│
├── 🔐 Authentication
│   └── 👥 Users
│       ├── sachin@example.com (UID: abc123...)
│       ├── priya@example.com (UID: def456...)
│       └── ... (more users)
│
└── 📑 Indexes
    ├── users: email (Ascending) - For search by email
    └── users: total (Descending) - For leaderboard
```

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│   Your App      │
│ (localhost:5174)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Firebase SDK                     │
│  (src/firebase/config.js)               │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│Firebase │ │  Firestore   │
│  Auth   │ │  Database    │
└────┬────┘ └──────┬───────┘
     │             │
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│  Login   │  │  users   │
│  Logout  │  │Collection│
│ Register │  └──────────┘
└──────────┘
```

## 📝 Registration Flow

```
1. User fills registration form
   ↓
2. Frontend calls: register(profile)
   ↓
3. AuthContext creates Firebase Auth user
   ↓
4. Creates Firestore document in 'users/{uid}'
   ↓
5. Document structure:
   {
     name: "...",
     email: "...",
     mobile: "...",
     course: "...",
     college: "...",
     year: "...",
     startDate: timestamp,
     dsa: 0,
     dev: 0,
     streak: 0,
     total: 0,
     partner: null,
     pendingRequests: []
   }
   ↓
6. User logged in → Redirected to Dashboard
```

## 🔄 Profile Update Flow

```
1. User clicks "Edit Profile" in About page
   ↓
2. Makes changes to fields
   ↓
3. Clicks "Save" button
   ↓
4. Frontend calls: updateDoc(userRef, updates)
   ↓
5. Firestore updates document in 'users/{uid}'
   ↓
6. Local state updated: setUser({...user, ...updates})
   ↓
7. Success message shown
   ↓
8. Changes visible immediately in UI
```

## 🤝 Partner Request Flow (Future)

```
User A                    Firestore                    User B
  │                          │                          │
  ├─ Search for partner ────→│                          │
  │  (by email)               │                          │
  │                          │                          │
  ├─ Send request ──────────→│                          │
  │                          │                          │
  │                          ├─ Add userA.id to ───────→│
  │                          │  userB.pendingRequests   │
  │                          │                          │
  │                          │                          │
  │                          │  ←─────── View requests ─┤
  │                          │                          │
  │                          │  ←───── Accept request ──┤
  │                          │                          │
  │  ←───── Update partner ──┤──── Update partner ─────→│
  │     userA.partner = B    │     userB.partner = A    │
  │                          │                          │
  └── Partners connected! ───┴────── Partners connected!┘
```

## 📊 Field Types Reference

| Field Name | Firestore Type | JavaScript Type | Example |
|------------|---------------|-----------------|---------|
| name | string | String | "Sachin Sharma" |
| email | string | String | "sachin@example.com" |
| mobile | string | String | "+919876543210" |
| course | string | String | "B.Tech CSE" |
| college | string | String | "ABC Institute" |
| year | string | String | "3rd Year" |
| startDate | timestamp | Date/String | "2025-10-18T10:30:00Z" |
| dsa | number | Number | 25 |
| dev | number | Number | 18 |
| streak | number | Number | 7 |
| total | number | Number | 43 |
| partner | string | String/null | "abc123xyz..." or null |
| pendingRequests | array | Array | ["user1", "user2"] |

## 🔐 Security Rules Explained

```javascript
// Rule 1: Only authenticated users can access
function isSignedIn() {
  return request.auth != null;
}

// Rule 2: Check if user owns the document
function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}

// Rule 3: Users collection permissions
match /users/{userId} {
  allow read: if isSignedIn();           // ✅ Any logged-in user can read
  allow create: if isSignedIn() && 
                request.auth.uid == userId; // ✅ Can create own profile only
  allow update: if isOwner(userId);      // ✅ Can update own profile only
  allow delete: if isOwner(userId);      // ✅ Can delete own profile only
}
```

## 💾 Storage Limits (Free Tier)

| Resource | Free Limit | Your Usage |
|----------|-----------|------------|
| Stored data | 1 GB | ~5 MB (with 100 users) |
| Document reads | 50,000/day | ~5,000/day (active usage) |
| Document writes | 20,000/day | ~2,000/day (active usage) |
| Document deletes | 20,000/day | Minimal |

**Average user document size:** ~500 bytes
**100 users = 50 KB storage**

## 🎯 Collection Strategy

### Why Only 1 Collection?

**❌ Bad (Multiple Collections):**
```
users/
partners/
progress/
requests/
```
This requires complex queries and multiple reads.

**✅ Good (Single Collection with Nested Data):**
```
users/
  {userId}/
    - all user data
    - partner info
    - progress data
    - pending requests
```
This allows atomic operations and faster queries.

## 🔍 Query Examples

### Find User by Email
```javascript
const q = query(
  collection(db, "users"),
  where("email", "==", "sachin@example.com"),
  limit(1)
);
const snapshot = await getDocs(q);
```

### Get Top 10 Users (Leaderboard)
```javascript
const q = query(
  collection(db, "users"),
  orderBy("total", "desc"),
  limit(10)
);
const snapshot = await getDocs(q);
```

### Get User by ID
```javascript
const docRef = doc(db, "users", userId);
const docSnap = await getDoc(docRef);
```

### Update User Progress
```javascript
const userRef = doc(db, "users", userId);
await updateDoc(userRef, {
  dsa: 30,
  dev: 20,
  total: 50
});
```

---

**Pro Tip:** Your app automatically creates the correct structure when users register. Just enable Firestore and Authentication, then let your app handle the rest!
