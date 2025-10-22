import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
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
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, mobile, course, college, year, startDate } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (mobile !== undefined) updates.mobile = mobile;
    if (course !== undefined) updates.course = course;
    if (college !== undefined) updates.college = college;
    if (year !== undefined) updates.year = year;
    if (startDate !== undefined) updates.startDate = startDate;
    
    await db.collection('users').doc(req.uid).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// Get user by email
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userDoc = snapshot.docs[0];
    res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search user' 
    });
  }
});

export default router;
