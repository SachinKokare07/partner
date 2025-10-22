import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code, Target, Calendar } from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import { dsaTopicsData, COLORS } from '../data';

const DSATracker = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">DSA Tracker</h2>
        <p className="text-gray-400">Monitor your Data Structures & Algorithms progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressCard title="Problems Solved" value="156" subtitle="+8 this week" icon={Code} color="bg-indigo-600" />
        <ProgressCard title="Success Rate" value="87%" subtitle="First attempt" icon={Target} color="bg-green-600" />
        <ProgressCard title="Avg Time" value="24m" subtitle="Per problem" icon={Calendar} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Topic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dsaTopicsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dsaTopicsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { problem: 'Two Sum', difficulty: 'Easy', time: '12m', date: 'Today' },
              { problem: 'Binary Tree Level Order', difficulty: 'Medium', time: '28m', date: 'Today' },
              { problem: 'Coin Change', difficulty: 'Medium', time: '35m', date: 'Yesterday' },
              { problem: 'Word Break', difficulty: 'Hard', time: '48m', date: 'Yesterday' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.problem}</p>
                  <p className="text-sm text-gray-400">{item.date} • {item.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                  item.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {item.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSATracker;