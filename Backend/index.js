import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin SDK
// You need to add your serviceAccountKey.json to the Backend folder
try {
  admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
    databaseURL: 'https://<YOUR_FIREBASE_PROJECT_ID>.firebaseio.com'
  });
} catch (e) {
  console.log('Firebase Admin already initialized or missing serviceAccountKey.json');
}

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret'; // Change this in production

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Firebase Auth logic (for demo, just check Firestore)
  const userSnap = await db.collection('users').where('email', '==', email).get();
  if (userSnap.empty) return res.status(401).json({ error: 'Invalid credentials' });
  const user = userSnap.docs[0].data();
  // For demo, password is not checked
  const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  // Check if user exists
  const userSnap = await db.collection('users').where('email', '==', email).get();
  if (!userSnap.empty) return res.status(400).json({ error: 'User already exists' });
  const newUser = {
    uid: Date.now().toString(),
    name,
    email,
    password,
    dsa: 0,
    dev: 0,
    streak: 0,
    partner: null,
    pendingRequests: [],
    course: '',
    college: '',
    year: '',
    startDate: '',
    profilePic: ''
  };
  await db.collection('users').doc(newUser.uid).set(newUser);
  const token = jwt.sign({ uid: newUser.uid, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: newUser });
});

// --- User Info ---
app.get('/api/user/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const userSnap = await db.collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });
    res.json(userSnap.data());
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// --- Partner Requests ---
app.post('/api/partner/request', async (req, res) => {
  const { toEmail, fromUid } = req.body;
  const toSnap = await db.collection('users').where('email', '==', toEmail).get();
  if (toSnap.empty) return res.status(404).json({ error: 'User not found' });
  const toUser = toSnap.docs[0].data();
  await db.collection('users').doc(toUser.uid).update({
    pendingRequests: admin.firestore.FieldValue.arrayUnion(fromUid)
  });
  res.json({ success: true });
});

app.post('/api/partner/accept', async (req, res) => {
  const { fromUid, toUid } = req.body;
  await db.collection('users').doc(toUid).update({
    partner: fromUid,
    pendingRequests: admin.firestore.FieldValue.arrayRemove(fromUid)
  });
  await db.collection('users').doc(fromUid).update({ partner: toUid });
  res.json({ success: true });
});

app.post('/api/partner/reject', async (req, res) => {
  const { fromUid, toUid } = req.body;
  await db.collection('users').doc(toUid).update({
    pendingRequests: admin.firestore.FieldValue.arrayRemove(fromUid)
  });
  res.json({ success: true });
});

app.get('/api/partner', async (req, res) => {
  const { uid } = req.query;
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });
  const user = userSnap.data();
  if (!user.partner) return res.json(null);
  const partnerSnap = await db.collection('users').doc(user.partner).get();
  res.json(partnerSnap.data());
});

// --- Chat ---
app.get('/api/chat', async (req, res) => {
  const { uid, partnerUid } = req.query;
  const chatSnap = await db.collection('chats').where('members', 'array-contains', uid).get();
  const chats = chatSnap.docs.map(doc => doc.data()).filter(chat => chat.members.includes(partnerUid));
  res.json(chats.length ? chats[0].messages : []);
});

app.post('/api/chat', async (req, res) => {
  const { uid, partnerUid, message, type } = req.body;
  const chatSnap = await db.collection('chats').where('members', 'array-contains', uid).get();
  let chat = chatSnap.docs.map(doc => doc.data()).find(chat => chat.members.includes(partnerUid));
  if (!chat) {
    chat = { members: [uid, partnerUid], messages: [] };
    await db.collection('chats').add(chat);
  }
  chat.messages.push({ sender: uid, message, type, timestamp: Date.now() });
  await db.collection('chats').doc(chat.id).set(chat);
  res.json({ success: true });
});

// --- Progress ---
app.get('/api/progress', async (req, res) => {
  const { uid } = req.query;
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });
  const user = userSnap.data();
  res.json({ dsa: user.dsa, dev: user.dev, streak: user.streak });
});

app.post('/api/progress', async (req, res) => {
  const { uid, dsa, dev, streak } = req.body;
  await db.collection('users').doc(uid).update({ dsa, dev, streak });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
