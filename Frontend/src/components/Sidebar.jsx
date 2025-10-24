import React from 'react';
import { Home, FileText, MessageCircle, UserPlus, BookOpen, User } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, isOpen, closeSidebar }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', page: 'dashboard' },
    { icon: BookOpen, label: 'Posts', page: 'posts' },
    { icon: MessageCircle, label: 'Chat', page: 'chat' },
    { icon: FileText, label: 'Notes', page: 'notes' },
    { icon: UserPlus, label: 'Partner', page: 'partner' },
    { icon: User, label: 'About', page: 'about' }
  ];

  return (
    <>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeSidebar}></div>
      )}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64`}>
        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { setCurrentPage(item.page); closeSidebar(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
