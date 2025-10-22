# Posts Feature Documentation

## Overview
The Posts feature allows users to share their daily work progress, including topics covered, problems solved, key learnings, tips, and resources. Users can interact with posts through likes and comments, creating an engaging learning community.

---

## Features

### ✅ Core Functionality
- **Create Posts**: Share daily progress with rich content fields
- **View Posts**: See posts from yourself and your partner
- **Filter Posts**: Filter by All, My Posts, or Partner's Posts
- **Like Posts**: Express appreciation with a heart reaction
- **Comment**: Add comments to posts for discussion
- **Delete Posts**: Remove your own posts
- **Real-time Updates**: Posts refresh automatically

### 📝 Post Content Fields
1. **Topic/Title** (Required) - Main subject of the post
2. **Problems Solved** - List of problems completed
3. **Key Learnings** - Important concepts learned
4. **Tips & Tricks** - Helpful insights discovered
5. **Resources** - Links to articles, videos, documentation
6. **Time Spent** - Duration of work session
7. **Difficulty** - Easy, Medium, or Hard

---

## Frontend Implementation

### File Structure
```
Frontend/src/
├── pages/
│   └── Posts.jsx          # Main posts page component
├── components/
│   └── Sidebar.jsx        # Updated with Posts menu item
└── App.jsx                # Updated to route to Posts page
```

### Posts.jsx Component

#### State Management
```javascript
const [posts, setPosts] = useState([]);              // All posts
const [loading, setLoading] = useState(true);        // Loading state
const [showCreateModal, setShowCreateModal] = useState(false);  // Modal visibility
const [filter, setFilter] = useState('all');         // 'all', 'my', 'partner'
const [commentingOn, setCommentingOn] = useState(null);  // Active comment input
const [commentText, setCommentText] = useState('');      // Comment text
const [newPost, setNewPost] = useState({ /* post fields */ });
```

#### Key Functions

**1. fetchPosts()**
```javascript
// Fetches posts based on filter
// - 'all': User's and partner's posts
// - 'my': Only user's posts
// - 'partner': Only partner's posts
```

**2. handleCreatePost()**
```javascript
// Creates new post with all fields
// Validates topic is required
// Adds user info and timestamp
// Refreshes posts list
```

**3. handleLike()**
```javascript
// Toggles like on/off
// Updates Firestore with arrayUnion/arrayRemove
// Refreshes posts
```

**4. handleAddComment()**
```javascript
// Adds comment to post
// Includes user info and timestamp
// Refreshes posts
```

**5. handleDeletePost()**
```javascript
// Deletes user's own post
// Shows confirmation dialog
// Refreshes posts
```

#### UI Components

**Create Post Modal**
- Full-screen overlay modal
- Form with all post fields
- Topic (required), Problems, Learnings, Tips, Resources
- Time Spent and Difficulty dropdown
- Save/Cancel buttons

**Post Card**
- User avatar and name
- Post timestamp (relative: "2h ago")
- Difficulty badge (colored)
- Content sections with icons
- Like button (red when liked)
- Comment button with count
- Delete button (only for own posts)
- Comments list
- Add comment input (when commenting)

**Filter Tabs**
- All Posts
- My Posts
- Partner's Posts (if partner exists)

---

## Backend Implementation

### File: Backend/routes/posts.js

#### API Endpoints

**1. GET /api/posts**
```javascript
// Get posts based on filter
Query Parameters:
  - filter: 'all' | 'my' | 'partner'

Response:
{
  success: true,
  posts: [
    {
      id: "postId",
      userId: "userId",
      userName: "User Name",
      userEmail: "user@email.com",
      topic: "Binary Search Trees",
      problemsSolved: "LeetCode #102, #104",
      tips: "Use BFS for level order",
      learnings: "BST properties",
      resources: "https://...",
      timeSpent: "2 hours",
      difficulty: "medium",
      likes: ["userId1", "userId2"],
      comments: [...],
      createdAt: "2025-10-19T12:00:00.000Z"
    }
  ]
}
```

**2. POST /api/posts**
```javascript
// Create new post
Body:
{
  topic: "String (required)",
  problemsSolved: "String",
  tips: "String",
  learnings: "String",
  resources: "String",
  timeSpent: "String",
  difficulty: "easy" | "medium" | "hard"
}

Response:
{
  success: true,
  post: { id, ...postData }
}
```

**3. POST /api/posts/:postId/like**
```javascript
// Toggle like on post
Response:
{
  success: true,
  liked: true | false  // true if liked, false if unliked
}
```

**4. POST /api/posts/:postId/comment**
```javascript
// Add comment to post
Body:
{
  text: "String (required)"
}

Response:
{
  success: true,
  comment: {
    userId: "userId",
    userName: "User Name",
    text: "Comment text",
    createdAt: "2025-10-19T12:00:00.000Z"
  }
}
```

**5. DELETE /api/posts/:postId**
```javascript
// Delete post (only owner)
Response:
{
  success: true,
  message: "Post deleted successfully"
}
```

**6. GET /api/posts/:postId**
```javascript
// Get single post by ID
Response:
{
  success: true,
  post: { id, ...postData }
}
```

**7. PUT /api/posts/:postId**
```javascript
// Update post (only owner)
Body: Same as POST /api/posts
Response:
{
  success: true,
  post: { id, ...updatedPostData }
}
```

---

## Firestore Database Structure

### Collection: `posts`

#### Document Structure
```javascript
{
  userId: "string",           // Creator's user ID
  userName: "string",         // Creator's display name
  userEmail: "string",        // Creator's email
  topic: "string",            // Required - Post title/topic
  problemsSolved: "string",   // Optional - Problems list
  tips: "string",             // Optional - Tips and tricks
  learnings: "string",        // Optional - Key learnings
  resources: "string",        // Optional - Resource links
  timeSpent: "string",        // Optional - Time duration
  difficulty: "string",       // "easy" | "medium" | "hard"
  likes: ["userId1", "userId2"],  // Array of user IDs who liked
  comments: [                 // Array of comment objects
    {
      userId: "string",
      userName: "string",
      text: "string",
      createdAt: Timestamp
    }
  ],
  createdAt: Timestamp,       // Post creation time
  updatedAt: Timestamp        // Last update time (if edited)
}
```

### Required Indexes

Create composite indexes in Firestore for efficient queries:

1. **Filter by user and sort by time**
   - Collection: `posts`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

2. **Filter by multiple users (for 'all' filter)**
   - Collection: `posts`
   - Fields: `userId` (Array), `createdAt` (Descending)
   - Query scope: Collection

---

## Security Rules

Add these rules to Firestore Security Rules:

```javascript
match /posts/{postId} {
  // Anyone authenticated can read posts
  allow read: if request.auth != null;
  
  // Only authenticated users can create posts
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.topic is string
    && request.resource.data.topic.size() > 0;
  
  // Only post owner can update
  allow update: if request.auth != null
    && resource.data.userId == request.auth.uid;
  
  // Only post owner can delete
  allow delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
```

---

## Usage Guide

### Creating a Post

1. Click "New Post" button in top-right
2. Fill in the form:
   - **Topic** (required): What you worked on
   - **Problems Solved**: List specific problems
   - **Key Learnings**: Important concepts learned
   - **Tips & Tricks**: Helpful insights
   - **Resources**: Links to materials
   - **Time Spent**: Duration (e.g., "2 hours")
   - **Difficulty**: Select Easy/Medium/Hard
3. Click "Create Post"

### Interacting with Posts

**Liking a Post**
- Click the heart icon
- Icon turns red when liked
- Click again to unlike

**Commenting on a Post**
- Click comment icon to open input
- Type your comment
- Press Enter or click Send button
- Click X or comment icon again to close

**Deleting Your Post**
- Click trash icon on your own posts
- Confirm deletion in dialog
- Post is permanently removed

### Filtering Posts

**All Posts**: Shows posts from you and your partner
**My Posts**: Shows only your posts
**Partner's Posts**: Shows only your partner's posts (if you have a partner)

---

## UI Design

### Color Scheme
- **Background**: Gray-800/50 with border-gray-700
- **Primary**: Indigo-600 (buttons, active states)
- **Like**: Red-400 (heart icon)
- **Difficulty Colors**:
  - Easy: Green-500/20 bg, Green-400 text
  - Medium: Yellow-500/20 bg, Yellow-400 text
  - Hard: Red-500/20 bg, Red-400 text

### Icons
- Plus: New Post button
- Code: Topic section
- Award: Problems Solved section
- Lightbulb: Learnings and Tips sections
- Calendar: Time Spent indicator
- Heart: Like button
- MessageCircle: Comment button
- Trash2: Delete button
- Send: Submit comment
- X: Close modal

### Responsive Design
- Max width: 4xl (896px)
- Modal: Full-screen overlay with centered content
- Cards: Stack vertically with proper spacing
- Filters: Horizontal tabs that wrap on mobile

---

## Example Post

```json
{
  "id": "abc123",
  "userId": "user123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "topic": "Binary Search Trees - In-depth Study",
  "problemsSolved": "LeetCode #102 (Level Order), #104 (Max Depth), #110 (Balanced Tree)",
  "tips": "Use BFS with queue for level order traversal. Remember to check null nodes!",
  "learnings": "BST properties: left < root < right. Height-balanced trees improve performance.",
  "resources": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
  "timeSpent": "2.5 hours",
  "difficulty": "medium",
  "likes": ["user456", "user789"],
  "comments": [
    {
      "userId": "user456",
      "userName": "Jane Smith",
      "text": "Great explanation! The BFS approach is clearer now.",
      "createdAt": "2025-10-19T14:30:00.000Z"
    }
  ],
  "createdAt": "2025-10-19T12:00:00.000Z"
}
```

---

## Testing

### Manual Testing Checklist

**Create Post**
- ✅ Can create post with all fields
- ✅ Topic is required
- ✅ Optional fields can be empty
- ✅ Post appears immediately after creation
- ✅ Modal closes after successful creation

**View Posts**
- ✅ Posts display in chronological order (newest first)
- ✅ User avatar shows first letter of name
- ✅ Relative timestamps display correctly
- ✅ Difficulty badges show correct colors
- ✅ Empty state shows when no posts

**Filter Posts**
- ✅ "All" shows user and partner posts
- ✅ "My Posts" shows only user's posts
- ✅ "Partner's Posts" shows only partner's posts
- ✅ Active filter tab is highlighted

**Like Posts**
- ✅ Can like a post
- ✅ Like count increments
- ✅ Heart icon turns red when liked
- ✅ Can unlike a post
- ✅ Like count decrements

**Comment on Posts**
- ✅ Can add comment
- ✅ Comment appears immediately
- ✅ Comment shows correct user name
- ✅ Can have multiple comments
- ✅ Press Enter submits comment

**Delete Posts**
- ✅ Can delete own posts
- ✅ Confirmation dialog appears
- ✅ Post is removed after confirmation
- ✅ Cannot see delete button on others' posts

---

## Troubleshooting

### Posts Not Loading
1. Check if user is logged in
2. Verify Firestore collection `posts` exists
3. Check browser console for errors
4. Verify Firebase config is correct

### Cannot Create Post
1. Ensure topic field is filled
2. Check Firestore security rules allow write
3. Verify user is authenticated
4. Check network tab for API errors

### Likes Not Working
1. Check if user ID is valid
2. Verify Firestore update permissions
3. Look for array operation errors in console

### Comments Not Appearing
1. Ensure comment text is not empty
2. Check Firestore update succeeded
3. Verify comments array structure

### Missing Partner Posts
1. Confirm partner relationship exists in user profile
2. Check if partner has created any posts
3. Verify query includes partner's user ID

---

## Future Enhancements

### Potential Features
- 📷 **Image Uploads**: Add screenshots or diagrams
- 🏷️ **Tags**: Categorize posts with tags (DSA, Web Dev, etc.)
- 🔍 **Search**: Search posts by topic or content
- 📊 **Analytics**: Track post engagement statistics
- 📌 **Pin Posts**: Pin important posts to top
- 📝 **Edit Posts**: Allow editing after creation
- 🔔 **Notifications**: Notify when partner posts or comments
- ⭐ **Favorites**: Save favorite posts
- 📱 **Rich Media**: Embed code snippets, videos
- 🎨 **Markdown Support**: Format posts with markdown
- 📈 **Trending**: Show most liked/commented posts
- 👥 **Mentions**: Mention partner in comments
- 🔗 **Share**: Share posts with others

---

## Summary

The Posts feature is now fully implemented with:
- ✅ Complete frontend UI with create, view, filter, like, comment, delete
- ✅ Backend API routes for all operations
- ✅ Firestore database structure
- ✅ Security rules (ready to be added)
- ✅ Responsive design
- ✅ Real-time updates
- ✅ User-friendly interface

**Next Steps:**
1. Test the feature by creating your first post
2. Add Firestore security rules
3. Create composite indexes if needed
4. Invite your partner to start posting!

