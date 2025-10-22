import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = express.Router();

// Update progress
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { dsa, dev, streak } = req.body;
    
    const updates = {};
    
    if (typeof dsa === 'number') updates.dsa = dsa;
    if (typeof dev === 'number') updates.dev = dev;
    if (typeof streak === 'number') updates.streak = streak;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid progress fields provided' 
      });
    }

    // Update total if dsa or dev changed
    if (updates.dsa !== undefined || updates.dev !== undefined) {
      const userDoc = await db.collection('users').doc(req.uid).get();
      const currentData = userDoc.data();
      
      const newDsa = updates.dsa !== undefined ? updates.dsa : (currentData.dsa || 0);
      const newDev = updates.dev !== undefined ? updates.dev : (currentData.dev || 0);
      
      updates.total = newDsa + newDev;
    }

    // Update last activity timestamp
    updates.lastActivity = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(req.uid).update(updates);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      updates,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update progress' 
    });
  }
});

// Get user progress
router.get('/', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const data = userDoc.data();
    
    res.json({
      success: true,
      progress: {
        dsa: data.dsa || 0,
        dev: data.dev || 0,
        streak: data.streak || 0,
        total: data.total || 0,
        lastActivity: data.lastActivity,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch progress' 
    });
  }
});

// Increment specific progress field
router.post('/increment', verifyToken, async (req, res) => {
  try {
    const { field, amount = 1 } = req.body;
    
    if (!['dsa', 'dev', 'streak'].includes(field)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid field. Must be dsa, dev, or streak' 
      });
    }

    const updates = {
      [field]: admin.firestore.FieldValue.increment(amount),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If incrementing dsa or dev, also increment total
    if (field === 'dsa' || field === 'dev') {
      updates.total = admin.firestore.FieldValue.increment(amount);
    }

    await db.collection('users').doc(req.uid).update(updates);

    res.json({
      success: true,
      message: `${field.toUpperCase()} incremented by ${amount}`,
    });
  } catch (error) {
    console.error('Increment progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to increment progress' 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const snapshot = await db.collection('users')
      .orderBy('total', 'desc')
      .limit(limit)
      .get();

    const leaderboard = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        uid: doc.id,
        name: data.name,
        total: data.total || 0,
        dsa: data.dsa || 0,
        dev: data.dev || 0,
        streak: data.streak || 0,
      };
    });

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard' 
    });
  }
});

export default router;
