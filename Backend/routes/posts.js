import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get posts (user's and partner's)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { filter } = req.query; // 'all', 'my', 'partner'

    // Get user's partner
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const partnerId = userData?.partner;

    let postsQuery = db.collection('posts').orderBy('createdAt', 'desc');

    if (filter === 'my') {
      postsQuery = postsQuery.where('userId', '==', userId);
    } else if (filter === 'partner' && partnerId) {
      postsQuery = postsQuery.where('userId', '==', partnerId);
    } else {
      // Get all posts from user and partner
      const userIds = [userId];
      if (partnerId) userIds.push(partnerId);
      postsQuery = postsQuery.where('userId', 'in', userIds);
    }

    const snapshot = await postsQuery.limit(50).get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new post
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const {
      topic,
      problemsSolved,
      tips,
      learnings,
      resources,
      timeSpent,
      difficulty
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    // Get user info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const postData = {
      userId,
      userName: userData?.name || 'Anonymous',
      userEmail: userData?.email || '',
      topic: topic.trim(),
      problemsSolved: problemsSolved?.trim() || '',
      tips: tips?.trim() || '',
      learnings: learnings?.trim() || '',
      resources: resources?.trim() || '',
      timeSpent: timeSpent?.trim() || '',
      difficulty: difficulty || 'medium',
      likes: [],
      comments: [],
      createdAt: new Date()
    };

    const postRef = await db.collection('posts').add(postData);

    res.json({
      success: true,
      post: { id: postRef.id, ...postData }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like/Unlike post
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const postData = postDoc.data();
    const likes = postData.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      // Unlike
      await postRef.update({
        likes: likes.filter(id => id !== userId)
      });
    } else {
      // Like
      await postRef.update({
        likes: [...likes, userId]
      });
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add comment to post
router.post('/:postId/comment', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Get user info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const comment = {
      userId,
      userName: userData?.name || 'Anonymous',
      text: text.trim(),
      createdAt: new Date()
    };

    const postData = postDoc.data();
    const comments = postData.comments || [];

    await postRef.update({
      comments: [...comments, comment]
    });

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete post (only owner can delete)
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const postData = postDoc.data();
    
    if (postData.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
    }

    await postRef.delete();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get post by ID
router.get('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const post = {
      id: postDoc.id,
      ...postDoc.data(),
      createdAt: postDoc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    };

    res.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update post (only owner can update)
router.put('/:postId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;
    const {
      topic,
      problemsSolved,
      tips,
      learnings,
      resources,
      timeSpent,
      difficulty
    } = req.body;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const postData = postDoc.data();
    
    if (postData.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
    }

    const updateData = {
      topic: topic?.trim() || postData.topic,
      problemsSolved: problemsSolved?.trim() || postData.problemsSolved,
      tips: tips?.trim() || postData.tips,
      learnings: learnings?.trim() || postData.learnings,
      resources: resources?.trim() || postData.resources,
      timeSpent: timeSpent?.trim() || postData.timeSpent,
      difficulty: difficulty || postData.difficulty,
      updatedAt: new Date()
    };

    await postRef.update(updateData);

    res.json({ success: true, post: { id: postId, ...postData, ...updateData } });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
