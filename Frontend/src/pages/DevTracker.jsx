import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Laptop, Code, Calendar } from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import { devTopicsData, COLORS } from '../data';

const DevTracker = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Development Tracker</h2>
        <p className="text-gray-400">Track your development projects and learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressCard title="Projects" value="142" subtitle="+6 this week" icon={Laptop} color="bg-cyan-600" />
        <ProgressCard title="Commits" value="324" subtitle="This month" icon={Code} color="bg-blue-600" />
        <ProgressCard title="Learning Hours" value="48h" subtitle="This week" icon={Calendar} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={devTopicsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {devTopicsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Projects</h3>
          <div className="space-y-3">
            {[
              { name: 'E-commerce Platform', tech: 'React, Node.js', progress: 75, status: 'In Progress' },
              { name: 'Task Manager App', tech: 'Next.js, MongoDB', progress: 90, status: 'Testing' },
              { name: 'Portfolio Website', tech: 'React, Tailwind', progress: 100, status: 'Completed' },
              { name: 'Chat Application', tech: 'Socket.io, Express', progress: 45, status: 'In Progress' }
            ].map((project, idx) => (
              <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{project.name}</p>
                  <span className="text-sm text-indigo-400">{project.progress}%</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{project.tech}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTracker;
