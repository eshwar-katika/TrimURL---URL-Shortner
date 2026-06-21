import React, { useState } from 'react';
import { api } from '../services/api';
import type { UserSession } from '../services/api';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
  setCurrentPage: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await api.login(username, password);
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient background spots */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative">
          <div className="bg-indigo-600/10 p-4 rounded-full text-indigo-400 mb-3 border border-indigo-500/20">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your shortened links</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-rose-950/30 border border-rose-800/40 p-4 rounded-xl text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-glow flex justify-center items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 relative">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentPage('register')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};
