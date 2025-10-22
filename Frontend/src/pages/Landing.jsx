import React from 'react';
import { ArrowRight, TrendingUp, Code2, MessageSquare } from 'lucide-react';
import Logo from '../assets/Logo.png';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
    <div className="w-12 h-12 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-white font-semibold mb-1">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </div>
);

const Landing = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="max-w-6xl mx-auto px-6 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <img src={Logo} alt="Partner Logo" className="h-10 w-auto" />
          <span className="text-white text-lg font-semibold">Partner</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Stay accountable. Grow together.
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
          Track DSA, development, notes, and daily wins with your coding partner — all in one sleek dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onGetStarted} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
            Get Started <ArrowRight size={18} />
          </button>
          <button onClick={onLogin} className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
            Log In
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature icon={TrendingUp} title="Dashboard Insights" desc="Beautiful charts to visualize weekly progress and compare growth." />
          <Feature icon={Code2} title="DSA + Dev Tracking" desc="Focus on problems and projects with structured trackers." />
          <Feature icon={MessageSquare} title="Daily Chat" desc="Share updates and achievements to keep the momentum." />
        </div>

        <div className="mt-16 p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 rounded-xl text-indigo-100">
          <p className="text-sm">Pro tip: Set a daily sync time with your partner. Short updates beat long status reports.</p>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Partner. Built for learning together.
      </footer>
    </div>
  );
};

export default Landing;
