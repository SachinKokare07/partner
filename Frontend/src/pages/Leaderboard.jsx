import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { leaderboardData } from '../data';

const Leaderboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Leaderboard</h2>
        <p className="text-gray-400">Competition drives excellence</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">DSA Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Dev Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leaderboardData.map((user) => (
                <tr key={user.rank} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.rank === 1 ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {user.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        user.name === 'You' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'
                      } text-white`}>
                        {user.name[0]}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.dsa}</td>
                  <td className="px-6 py-4 text-gray-300">{user.dev}</td>
                  <td className="px-6 py-4"><span className="text-indigo-400 font-semibold">{user.total}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">{user.streak}</span>
                      <span>🔥</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaderboardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#F3F4F6' }} />
              <Legend />
              <Bar dataKey="dsa" fill="#4F46E5" name="DSA Score" />
              <Bar dataKey="dev" fill="#06B6D4" name="Dev Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            {[
              { title: '100 Day Streak', description: 'Keep going!', progress: 12, total: 100, icon: '🔥' },
              { title: 'DSA Master', description: 'Solve 200 problems', progress: 156, total: 200, icon: '🎯' },
              { title: 'Full Stack Dev', description: 'Complete 150 projects', progress: 142, total: 150, icon: '💻' },
              { title: 'Speed Demon', description: 'Solve 10 in under 15m', progress: 7, total: 10, icon: '⚡' }
            ].map((achievement, idx) => (
              <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="text-white font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-indigo-400 font-medium">{achievement.progress}/{achievement.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
