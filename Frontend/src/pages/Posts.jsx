import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Plus, Calendar, Code, Award, Lightbulb, Trash2, Heart, MessageCircle, Send, X } from 'lucide-react';

export default function Posts() {
  const { user, setUser, getPartner } = useAuth();
  const partner = getPartner();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'partner'
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  const [newPost, setNewPost] = useState({
    topic: '',
    problemsSolved: '',
    totalProblemsCount: '',
    postDate: new Date().toISOString().split('T')[0], // Default to today
    tips: '',
    learnings: '',
    resources: '',
    timeSpent: '',
    difficulty: 'medium'
  });

  // Ensure user profile exists in Firestore
  useEffect(() => {
    const ensureUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          console.warn('User profile not found, creating it now...');
          // Create user profile with default values
          await setDoc(userRef, {
            name: user.name || 'User',
            email: user.email || '',
            dsa: 0,
            dev: 0,
            streak: 0,
            total: 0,
            partner: null,
            pendingRequests: [],
            lastLoginDate: new Date().toISOString(),
            lastPostDate: null,
            emailVerified: true
          });
          console.log('User profile created successfully');
        }
      } catch (error) {
        console.error('Error ensuring user profile:', error);
      }
    };
    
    ensureUserProfile();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      let q;

      if (filter === 'my') {
        q = query(postsRef, where('userId', '==', user.id), orderBy('createdAt', 'desc'));
      } else if (filter === 'partner' && partner) {
        q = query(postsRef, where('userId', '==', partner.id), orderBy('createdAt', 'desc'));
      } else {
        // Show posts from user and partner
        const userIds = [user.id];
        if (partner) userIds.push(partner.id);
        q = query(postsRef, where('userId', 'in', userIds), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      console.log('Fetched posts:', postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', error.message);
      
      // If there's an index error, try without orderBy
      if (error.message.includes('index')) {
        console.log('Trying to fetch without ordering...');
        try {
          const postsRef = collection(db, 'posts');
          let q;
          
          if (filter === 'my') {
            q = query(postsRef, where('userId', '==', user.id));
          } else if (filter === 'partner' && partner) {
            q = query(postsRef, where('userId', '==', partner.id));
          } else {
            const userIds = [user.id];
            if (partner) userIds.push(partner.id);
            q = query(postsRef, where('userId', 'in', userIds));
          }
          
          const snapshot = await getDocs(q);
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));
          
          // Sort manually by createdAt
          postsData.sort((a, b) => b.createdAt - a.createdAt);
          
          console.log('Fetched posts (without ordering):', postsData);
          setPosts(postsData);
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (!newPost.postDate) {
      alert('Please select a date');
      return;
    }

    try {
      const postData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        topic: newPost.topic.trim(),
        problemsSolved: newPost.problemsSolved.trim(),
        totalProblemsCount: newPost.totalProblemsCount ? parseInt(newPost.totalProblemsCount) : 0,
        postDate: newPost.postDate || new Date().toISOString().split('T')[0],
        tips: newPost.tips.trim(),
        learnings: newPost.learnings.trim(),
        resources: newPost.resources.trim(),
        timeSpent: newPost.timeSpent.trim(),
        difficulty: newPost.difficulty,
        likes: [],
        comments: [],
        createdAt: serverTimestamp()
      };

      console.log('Creating post with data:', postData);
      await addDoc(collection(db, 'posts'), postData);
      
      // Update DSA score if problems were solved
      if (postData.totalProblemsCount > 0) {
        const userRef = doc(db, 'users', user.id);
        const newDsaScore = (user.dsa || 0) + postData.totalProblemsCount;
        
        // Use setDoc with merge to create document if it doesn't exist
        await setDoc(userRef, {
          dsa: newDsaScore
        }, { merge: true });
        
        // Update local user state
        setUser({
          ...user,
          dsa: newDsaScore
        });
        
        console.log(`Added ${postData.totalProblemsCount} problems to DSA score. New total: ${newDsaScore}`);
        alert(`✅ Post created! Added ${postData.totalProblemsCount} problems to your DSA score. New total: ${newDsaScore}`);
      } else {
        alert('✅ Post created successfully!');
      }
      
      // Update post streak
      await updatePostStreak();
      
      setNewPost({
        topic: '',
        problemsSolved: '',
        totalProblemsCount: '',
        postDate: new Date().toISOString().split('T')[0],
        tips: '',
        learnings: '',
        resources: '',
        timeSpent: '',
        difficulty: 'medium'
      });
      
      setShowCreateModal(false);
      
      // Wait a bit for serverTimestamp to process, then fetch posts
      setTimeout(() => {
        fetchPosts();
      }, 500);
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.message);
      alert('Failed to create post: ' + error.message);
    }
  };

  // Update streak when post is created
  const updatePostStreak = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const lastPostDate = user.lastPostDate;
      const lastPostStr = lastPostDate ? new Date(lastPostDate).toISOString().split('T')[0] : null;

      // If already posted today, don't update streak
      if (lastPostStr === todayStr) {
        console.log('Already posted today');
        return;
      }

      const userRef = doc(db, 'users', user.id);

      // Calculate new streak based on last post date
      let newStreak = user.streak || 0;
      
      if (lastPostStr) {
        const lastDate = new Date(lastPostStr);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastPostStr === yesterdayStr) {
          // Posted yesterday - increment streak
          newStreak += 1;
          console.log('Consecutive day post! Streak:', newStreak);
        } else if (lastPostStr === todayStr) {
          // Already posted today - no change
          console.log('Already posted today');
          return;
        } else {
          // Gap in posting - reset to 1
          newStreak = 1;
          console.log('Posting gap. Starting new streak.');
        }
      } else {
        // First post ever
        newStreak = 1;
        console.log('First post! Starting streak.');
      }

      // Update last post date and streak (use setDoc with merge)
      await setDoc(userRef, {
        lastPostDate: today.toISOString(),
        streak: newStreak
      }, { merge: true });

      // Update local user state
      setUser({
        ...user,
        lastPostDate: today.toISOString(),
        streak: newStreak
      });

      console.log('Post streak updated:', newStreak);
    } catch (error) {
      console.error('Error updating post streak:', error);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const hasLiked = currentLikes.includes(user.id);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.id)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.id)
        });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const comment = {
        userId: user.id,
        userName: user.name,
        text: commentText.trim(),
        createdAt: Timestamp.now()
      };

      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      setCommentText('');
      setCommentingOn(null);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="text-white text-center py-20">
        <p>Please login to view posts</p>
      </div>
    );
  }

  return (
    <div className="text-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Posts</h1>
          <p className="text-gray-400">Share your progress, learnings, and tips</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'all' ? 'bg-indigo-600' : 'hover:bg-gray-700'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter('my')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'my' ? 'bg-indigo-600' : 'hover:bg-gray-700'
          }`}
        >
          My Posts
        </button>
        {partner && (
          <button
            onClick={() => setFilter('partner')}
            className={`px-4 py-2 rounded-md transition ${
              filter === 'partner' ? 'bg-indigo-600' : 'hover:bg-gray-700'
            }`}
          >
            Partner's Posts
          </button>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Code size={48} className="mx-auto mb-4 opacity-50" />
          <p>No posts yet. Start sharing your progress!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              {/* Post Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    {post.userName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{post.userName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {post.postDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.totalProblemsCount > 0 && (
                    <span className="bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full font-semibold">
                      {post.totalProblemsCount} solved
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(post.difficulty)}`}>
                    {post.difficulty}
                  </span>
                  {post.userId === user.id && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <Code size={16} />
                    <span className="text-sm font-semibold">Topic</span>
                  </div>
                  <p className="text-lg font-semibold">{post.topic}</p>
                </div>

                {post.problemsSolved && (
                  <div>
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Award size={16} />
                      <span className="text-sm font-semibold">Problems Solved</span>
                    </div>
                    <p className="text-gray-300">{post.problemsSolved}</p>
                  </div>
                )}

                {post.learnings && (
                  <div>
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Lightbulb size={16} />
                      <span className="text-sm font-semibold">Key Learnings</span>
                    </div>
                    <p className="text-gray-300">{post.learnings}</p>
                  </div>
                )}

                {post.tips && (
                  <div>
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <Lightbulb size={16} />
                      <span className="text-sm font-semibold">Tips & Tricks</span>
                    </div>
                    <p className="text-gray-300">{post.tips}</p>
                  </div>
                )}

                {post.resources && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Resources</div>
                    <p className="text-blue-400">{post.resources}</p>
                  </div>
                )}

                {post.timeSpent && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={14} />
                    <span>Time spent: {post.timeSpent}</span>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleLike(post.id, post.likes || [])}
                  className={`flex items-center gap-2 transition ${
                    post.likes?.includes(user.id)
                      ? 'text-red-400'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={18} fill={post.likes?.includes(user.id) ? 'currentColor' : 'none'} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition"
                >
                  <MessageCircle size={18} />
                  <span>{post.comments?.length || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0">
                        {comment.userName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{comment.userName}</p>
                        <p className="text-gray-300 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              {commentingOn === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Topic / Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPost.topic}
                    onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                    placeholder="e.g., Binary Search Trees, React Hooks, System Design"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={newPost.postDate}
                    onChange={(e) => setNewPost({ ...newPost, postDate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Total Problems Solved Today
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPost.totalProblemsCount}
                    onChange={(e) => setNewPost({ ...newPost, totalProblemsCount: e.target.value })}
                    placeholder="e.g., 5"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-green-400 mt-1">
                    💡 This will be added to your DSA score!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Problems Solved (Details)</label>
                <textarea
                  value={newPost.problemsSolved}
                  onChange={(e) => setNewPost({ ...newPost, problemsSolved: e.target.value })}
                  placeholder="List problems you solved today (e.g., LeetCode #102, #104, #110)"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Key Learnings</label>
                <textarea
                  value={newPost.learnings}
                  onChange={(e) => setNewPost({ ...newPost, learnings: e.target.value })}
                  placeholder="What did you learn today?"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tips & Tricks</label>
                <textarea
                  value={newPost.tips}
                  onChange={(e) => setNewPost({ ...newPost, tips: e.target.value })}
                  placeholder="Share helpful tips or tricks you discovered"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Resources</label>
                <input
                  type="text"
                  value={newPost.resources}
                  onChange={(e) => setNewPost({ ...newPost, resources: e.target.value })}
                  placeholder="Links to articles, videos, or documentation"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Time Spent</label>
                  <input
                    type="text"
                    value={newPost.timeSpent}
                    onChange={(e) => setNewPost({ ...newPost, timeSpent: e.target.value })}
                    placeholder="e.g., 2 hours, 45 mins"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Difficulty</label>
                  <select
                    value={newPost.difficulty}
                    onChange={(e) => setNewPost({ ...newPost, difficulty: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold transition"
                >
                  Create Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
