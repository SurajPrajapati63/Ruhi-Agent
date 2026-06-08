import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { FiLogOut, FiTrash2, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { clearMessages } = useChatStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearMessages();
      setMenuOpen(false);
    }
  };

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-semibold text-slate-100">Ruhi AI</span>
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-100">{user?.name || 'User'}</div>
            <div className="text-xs text-slate-400">{user?.email || 'user@example.com'}</div>
          </div>

          <button onClick={handleClearChat} title="Clear chat history" className="flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-200 rounded-md">
            <FiTrash2 size={18} />
            <span>Clear Chat</span>
          </button>

          <button onClick={handleLogout} title="Sign out" className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md">
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <button className="md:hidden p-2 text-slate-200" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {menuOpen && (
          <div className="absolute left-4 top-16 bg-slate-800 border border-slate-700 rounded-md p-3 flex flex-col gap-2 md:hidden">
            <button onClick={handleClearChat} className="flex items-center gap-2 px-3 py-1 bg-slate-700 text-slate-200 rounded-md"><FiTrash2 size={16} /> Clear Chat</button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md"><FiLogOut size={16} /> Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
