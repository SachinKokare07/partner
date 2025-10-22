import express from 'express';
import { auth, db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, mobile } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and name are required' 
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      mobile: mobile || '',
      partner: null,
      dsa: 0,
      dev: 0,
      streak: 0,
      pendingRequests: [],
      createdAt: new Date().toISOString(),
    });

    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token: customToken,
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    let message = 'Registration failed';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email already in use';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters';
    }

    res.status(400).json({ success: false, message });
  }
});

// Verify token and get user data
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: req.uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data' 
    });
  }
});

// Refresh user session
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    // Generate new custom token
    const customToken = await auth.createCustomToken(req.uid);
    
    res.json({
      success: true,
      token: customToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh token' 
    });
  }
});

export default router;
