import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Code, Laptop, Award, Target } from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import StreakIndicator from '../components/StreakIndicator';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const Dashboard = () => {
  const { user, getPartner, logout } = useAuth();
  const partner = getPartner();
  const [weeklyProgressData, setWeeklyProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch weekly progress data from posts
  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Get last 7 days
        const last7Days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          last7Days.push({
            date: date,
            dateStr: date.toISOString().split('T')[0],
            day: dayNames[date.getDay()],
            dsa: 0,
            dev: 0
          });
        }

        // Fetch user's posts from last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('userId', '==', user.id),
          where('createdAt', '>=', sevenDaysAgo.toISOString()),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        // Count posts by day and category
        snapshot.forEach(doc => {
          const post = doc.data();
          const postDate = new Date(post.createdAt).toISOString().split('T')[0];
          
          const dayData = last7Days.find(d => d.dateStr === postDate);
          if (dayData) {
            if (post.category === 'DSA') {
              dayData.dsa += 1;
            } else if (post.category === 'Dev') {
              dayData.dev += 1;
            }
          }
        });

        // Remove date objects before setting state
        const chartData = last7Days.map(({ date, dateStr, ...rest }) => rest);
        setWeeklyProgressData(chartData);
        
      } catch (error) {
        console.error('Error fetching weekly progress:', error);
        // Fallback to empty data
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const fallbackData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          fallbackData.push({
            day: dayNames[date.getDay()],
            dsa: 0,
            dev: 0
          });
        }
        setWeeklyProgressData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyProgress();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      // Reload to reset to landing page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Profile section top-right */}
      <div className="absolute right-0 top-0 mt-2 mr-2 z-10">
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 shadow-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col mr-2">
            <span className="text-white font-semibold text-sm">{user?.name || 'User'}</span>
            <span className="text-gray-400 text-xs">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">
          {partner ? `Your progress vs ${partner.name}` : 'Track your daily progress and achievements'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard title="DSA Problems" value={user?.dsa || 0} subtitle="This month" icon={Code} color="bg-indigo-600" />
        <ProgressCard title="Dev Projects" value={user?.dev || 0} subtitle="This month" icon={Laptop} color="bg-cyan-600" />
        <ProgressCard title="Current Streak" value={`${user?.streak || 0} 🔥`} subtitle="Days in a row" icon={Award} color="bg-purple-600" />
        <ProgressCard title="Total Score" value={((user?.dsa || 0) + (user?.dev || 0)).toString()} subtitle="Combined points" icon={Target} color="bg-pink-600" />
      </div>

      {/* Streak Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StreakIndicator streak={user?.streak || 0} />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">How Streaks Work</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Login Daily</p>
                  <p className="text-gray-400">Your streak starts when you log in each day</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Create a Post</p>
                  <p className="text-gray-400">Share your daily progress by creating at least one post</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Keep it Going!</p>
                  <p className="text-gray-400">Post every consecutive day to maintain and grow your streak</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-xs font-semibold">⚠️ Miss a day and your streak resets to 1!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {partner && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Partner Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-3">You</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">DSA</span>
                  <span className="text-white font-semibold">{user.dsa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Dev</span>
                  <span className="text-white font-semibold">{user.dev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Streak</span>
                  <span className="text-white font-semibold">{user.streak} days</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">{partner.name}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">DSA</span>
                  <span className="text-white font-semibold">{partner.dsa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Dev</span>
                  <span className="text-white font-semibold">{partner.dev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Streak</span>
                  <span className="text-white font-semibold">{partner.streak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : weeklyProgressData.length === 0 || weeklyProgressData.every(d => d.dsa === 0 && d.dev === 0) ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
              <Code className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">No posts yet this week</p>
              <p className="text-sm text-center mt-2">Start posting to see your progress!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#F3F4F6' }} />
                <Legend />
                <Line type="monotone" dataKey="dsa" stroke="#4F46E5" strokeWidth={2} name="DSA" />
                <Line type="monotone" dataKey="dev" stroke="#06B6D4" strokeWidth={2} name="Development" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Comparison</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : weeklyProgressData.length === 0 || weeklyProgressData.every(d => d.dsa === 0 && d.dev === 0) ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
              <Laptop className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">No activity to compare</p>
              <p className="text-sm text-center mt-2">Create posts to track daily progress!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#F3F4F6' }} />
                <Legend />
                <Bar dataKey="dsa" fill="#4F46E5" name="DSA" />
                <Bar dataKey="dev" fill="#06B6D4" name="Development" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
