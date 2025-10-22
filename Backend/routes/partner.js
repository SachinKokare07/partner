import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = express.Router();

// Send partner request
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Partner email is required' 
      });
    }

    // Find partner by email
    const partnerSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (partnerSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const partnerDoc = partnerSnapshot.docs[0];
    const partnerId = partnerDoc.id;
    const partnerData = partnerDoc.data();

    // Check if trying to send request to self
    if (partnerId === req.uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send request to yourself' 
      });
    }

    // Check if partner already has a partner
    if (partnerData.partner) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already has a partner' 
      });
    }

    // Check if user already has a partner
    const userDoc = await db.collection('users').doc(req.uid).get();
    if (userDoc.data().partner) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a partner' 
      });
    }

    // Check if request already sent
    if (partnerData.pendingRequests?.includes(req.uid)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request already sent' 
      });
    }

    // Add request to partner's pending list
    await db.collection('users').doc(partnerId).update({
      pendingRequests: admin.firestore.FieldValue.arrayUnion(req.uid),
    });

    res.json({
      success: true,
      message: `Partner request sent to ${partnerData.name}`,
    });
  } catch (error) {
    console.error('Send partner request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send partner request' 
    });
  }
});

// Get pending requests
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get();
    const pendingRequests = userDoc.data().pendingRequests || [];

    if (pendingRequests.length === 0) {
      return res.json({
        success: true,
        requests: [],
      });
    }

    // Fetch details of users who sent requests
    const requestDetails = await Promise.all(
      pendingRequests.map(async (uid) => {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          return {
            from: uid,
            fromName: data.name,
            fromEmail: data.email,
          };
        }
        return null;
      })
    );

    res.json({
      success: true,
      requests: requestDetails.filter(r => r !== null),
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requests' 
    });
  }
});

// Accept partner request
router.post('/accept', verifyToken, async (req, res) => {
  try {
    const { partnerId } = req.body;
    
    if (!partnerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Partner ID is required' 
      });
    }

    // Update both users to be partners
    await db.collection('users').doc(req.uid).update({
      partner: partnerId,
      pendingRequests: admin.firestore.FieldValue.arrayRemove(partnerId),
    });

    await db.collection('users').doc(partnerId).update({
      partner: req.uid,
    });

    res.json({
      success: true,
      message: 'Partner request accepted',
    });
  } catch (error) {
    console.error('Accept partner request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept request' 
    });
  }
});

// Reject partner request
router.post('/reject', verifyToken, async (req, res) => {
  try {
    const { partnerId } = req.body;
    
    if (!partnerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Partner ID is required' 
      });
    }

    // Remove from pending requests
    await db.collection('users').doc(req.uid).update({
      pendingRequests: admin.firestore.FieldValue.arrayRemove(partnerId),
    });

    res.json({
      success: true,
      message: 'Partner request rejected',
    });
  } catch (error) {
    console.error('Reject partner request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject request' 
    });
  }
});

// Get partner details
router.get('/details', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get();
    const partnerId = userDoc.data().partner;

    if (!partnerId) {
      return res.json({
        success: true,
        partner: null,
      });
    }

    const partnerDoc = await db.collection('users').doc(partnerId).get();
    
    if (!partnerDoc.exists) {
      return res.json({
        success: true,
        partner: null,
      });
    }

    res.json({
      success: true,
      partner: {
        id: partnerId,
        ...partnerDoc.data(),
      },
    });
  } catch (error) {
    console.error('Get partner details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch partner details' 
    });
  }
});

export default router;
