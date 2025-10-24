import React from 'react';
import { Menu, Award } from 'lucide-react';
import Logo from '../assets/Logo.png';
//navbar : 
const Navbar = ({ toggleSidebar, showMenu = true, showUser = true }) => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button onClick={toggleSidebar} className="lg:hidden text-gray-300 hover:text-white">
              <Menu size={24} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Partner Logo" className="h-8 w-auto object-contain" />
            <h1 className="text-xl font-bold text-white">Partner</h1>
          </div>
        </div>
        {showUser && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
              <Award size={16} className="text-indigo-400" />
              <span className="text-sm text-gray-300">12 Day Streak 🔥</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              Y
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
