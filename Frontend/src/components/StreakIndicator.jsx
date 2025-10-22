import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

const StreakIndicator = ({ streak, size = 'normal' }) => {
  const isSmall = size === 'small';
  
  const getStreakColor = (streak) => {
    if (streak >= 30) return 'from-orange-500 to-red-500';
    if (streak >= 14) return 'from-yellow-500 to-orange-500';
    if (streak >= 7) return 'from-green-500 to-yellow-500';
    if (streak >= 3) return 'from-blue-500 to-green-500';
    return 'from-gray-500 to-blue-500';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return 'Start your streak!';
    if (streak === 1) return 'First day!';
    if (streak < 7) return 'Keep going!';
    if (streak < 14) return 'Great momentum!';
    if (streak < 30) return 'On fire! 🔥';
    if (streak < 60) return 'Unstoppable! 🚀';
    return 'Legend! 👑';
  };

  const getFlameSize = () => {
    if (isSmall) return 16;
    if (streak >= 30) return 40;
    if (streak >= 14) return 36;
    if (streak >= 7) return 32;
    return 28;
  };

  if (isSmall) {
    return (
      <div className="flex items-center gap-1">
        <Flame 
          size={16} 
          className={`${streak > 0 ? `text-transparent bg-gradient-to-br ${getStreakColor(streak)} bg-clip-text` : 'text-gray-500'}`}
          fill={streak > 0 ? 'currentColor' : 'none'}
        />
        <span className={`text-sm font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${getStreakColor(streak)} opacity-20 blur-xl rounded-full`}></div>
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className={`relative animate-bounce-slow ${streak >= 7 ? 'animate-pulse' : ''}`}>
            <Flame 
              size={getFlameSize()} 
              className={`${streak > 0 ? `text-transparent bg-gradient-to-br ${getStreakColor(streak)} bg-clip-text` : 'text-gray-600'}`}
              fill={streak > 0 ? 'currentColor' : 'none'}
            />
            {streak >= 30 && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                🔥
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <p className={`text-4xl font-bold bg-gradient-to-br ${getStreakColor(streak)} text-transparent bg-clip-text`}>
            {streak}
          </p>
          <p className="text-sm text-gray-400 mt-1">Day Streak</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp size={14} className="text-green-400" />
          <p className="text-xs font-semibold text-green-400">
            {getStreakMessage(streak)}
          </p>
        </div>
        
        {streak > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
            <p className="mb-1">Keep posting daily to maintain your streak!</p>
            {streak < 7 && (
              <p className="text-yellow-400 font-semibold">{7 - streak} more days to reach 1 week! 🎯</p>
            )}
            {streak >= 7 && streak < 30 && (
              <p className="text-orange-400 font-semibold">{30 - streak} more days to reach 1 month! 🚀</p>
            )}
            {streak >= 30 && (
              <p className="text-red-400 font-semibold">You're a legend! Keep it going! 👑</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakIndicator;
