// Shared dummy data and constants

export const weeklyProgressData = [
  { day: 'Mon', dsa: 5, dev: 3 },
  { day: 'Tue', dsa: 7, dev: 4 },
  { day: 'Wed', dsa: 4, dev: 6 },
  { day: 'Thu', dsa: 8, dev: 5 },
  { day: 'Fri', dsa: 6, dev: 7 },
  { day: 'Sat', dsa: 9, dev: 8 },
  { day: 'Sun', dsa: 5, dev: 4 }
];

export const dsaTopicsData = [
  { name: 'Arrays', value: 45 },
  { name: 'Trees', value: 30 },
  { name: 'Graphs', value: 15 },
  { name: 'DP', value: 10 }
];

export const devTopicsData = [
  { name: 'React', value: 40 },
  { name: 'Node.js', value: 30 },
  { name: 'Database', value: 20 },
  { name: 'DevOps', value: 10 }
];

export const leaderboardData = [
  { rank: 1, name: 'You', dsa: 156, dev: 142, total: 298, streak: 12 },
  { rank: 2, name: 'Partner', dsa: 148, dev: 138, total: 286, streak: 8 }
];

export const notesData = [
  { id: 1, title: 'Binary Search Implementation', date: '2025-10-17', category: 'DSA', content: 'Key points: O(log n) complexity, divide and conquer...' },
  { id: 2, title: 'React Hooks Best Practices', date: '2025-10-16', category: 'Dev', content: 'UseEffect cleanup, dependency arrays...' },
  { id: 3, title: 'Graph Traversal Algorithms', date: '2025-10-15', category: 'DSA', content: 'BFS vs DFS comparison and use cases...' },
  { id: 4, title: 'REST API Design', date: '2025-10-14', category: 'Dev', content: 'RESTful principles and best practices...' }
];

export const chatData = [
  { id: 1, sender: 'You', message: 'Just solved the "Maximum Subarray" problem! Kadane\'s algorithm is genius 🚀', timestamp: '10:30 AM', date: '2025-10-18', type: 'achievement' },
  { id: 2, sender: 'Partner', message: 'Nice! I\'m working on a React dashboard project today. Using Recharts for visualizations.', timestamp: '11:15 AM', date: '2025-10-18', type: 'update' },
  { id: 3, sender: 'You', message: 'That sounds cool! I\'m planning to tackle binary trees today. Want to do a pair programming session later?', timestamp: '11:20 AM', date: '2025-10-18', type: 'message' },
  { id: 4, sender: 'Partner', message: 'Completed the authentication module for my Node.js backend! Used JWT tokens. Let\'s pair program at 4 PM?', timestamp: '2:45 PM', date: '2025-10-18', type: 'achievement' },
  { id: 5, sender: 'You', message: 'Perfect! See you at 4. Also, check out this article on system design I found 📚', timestamp: '3:00 PM', date: '2025-10-18', type: 'message' },
  { id: 6, sender: 'Partner', message: 'Thanks! Will read it during break. How many problems did you solve today?', timestamp: '3:30 PM', date: '2025-10-18', type: 'message' },
  { id: 7, sender: 'You', message: 'Got through 5 so far. Aiming for 8 by end of day!', timestamp: '3:35 PM', date: '2025-10-18', type: 'update' }
];

export const COLORS = ['#4F46E5', '#06B6D4', '#8B5CF6', '#EC4899'];
