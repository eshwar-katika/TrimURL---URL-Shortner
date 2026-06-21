import React from 'react';
import { Link2, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import type { UserSession } from '../services/api';

interface NavbarProps {
  session: UserSession | null;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ session, currentPage, setCurrentPage, onLogout }) => {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => setCurrentPage('landing')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-indigo-600 p-2 rounded-lg text-white group-hover:bg-indigo-500 transition-colors shadow-glow">
            <Link2 className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
            TrimURL
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              
              <div className="h-6 w-px bg-slate-800" />
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-400">
                  {session.username}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all border border-transparent hover:border-rose-900/50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-glow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
