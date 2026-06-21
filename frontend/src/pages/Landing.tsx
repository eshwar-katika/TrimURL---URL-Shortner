import React, { useState } from 'react';
import { api } from '../services/api';
import type { UrlItem, UserSession } from '../services/api';
import { Link2, Sparkles, Copy, Check, ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface LandingProps {
  session: UserSession | null;
  setCurrentPage: (page: string) => void;
  onLinkCreated: () => void;
}

export const Landing: React.FC<LandingProps> = ({ session, setCurrentPage, onLinkCreated }) => {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const formattedExpiration = expiresAt ? new Date(expiresAt).toISOString() : undefined;
      const shortened = await api.createUrl(
        longUrl, 
        session ? customAlias : undefined, 
        session ? formattedExpiration : undefined
      );
      setResult(shortened);
      setLongUrl('');
      setCustomAlias('');
      setExpiresAt('');
      onLinkCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 flex flex-col justify-center">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          The Ultimate Link Management Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Shorten. Share. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Track Real-Time Analytics.
          </span>
        </h1>
        <p className="text-slate-400 md:text-lg max-w-xl mx-auto">
          Trim long URLs into sleek, branded links. Monitor your performance with low latency redirection and live visitor analytics.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        <form onSubmit={handleShorten} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Link2 className="w-5 h-5" />
              </span>
              <input
                type="url"
                required
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="Paste your long link here (e.g. https://google.com)..."
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all text-sm md:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-4 px-8 rounded-xl transition-all shadow-glow flex justify-center items-center gap-2 text-sm md:text-base shrink-0 disabled:opacity-50"
            >
              {loading ? 'Shortening...' : 'Trim Link'}
            </button>
          </div>

          {/* Advanced options toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors uppercase tracking-wider"
            >
              <Settings className="w-3.5 h-3.5" />
              Advanced Options
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Custom Alias */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Custom Alias {!session && <span className="text-indigo-400">(Requires Login)</span>}
                  </label>
                  <input
                    type="text"
                    disabled={!session}
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder={session ? "e.g. portfolio" : "Login to use this feature"}
                    className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 outline-none transition-all text-sm disabled:opacity-40"
                  />
                </div>

                {/* Expiration date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Expiration Date {!session && <span className="text-indigo-400">(Requires Login)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      disabled={!session}
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 outline-none transition-all text-sm disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Results layout */}
        {result && (
          <div className="mt-8 p-6 bg-slate-900/80 border border-indigo-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex-1 w-full truncate">
              <span className="text-xs font-semibold uppercase text-indigo-400 block mb-1">
                Your Shortened Link:
              </span>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base md:text-lg font-bold text-white hover:text-indigo-300 underline transition-colors"
              >
                {result.shortUrl}
              </a>
              <span className="text-xs text-slate-500 block truncate mt-1">
                Destination: {result.longUrl}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className={`w-full md:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all border ${
                copied
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        )}

        {!session && (
          <div className="mt-8 text-center border-t border-slate-800/40 pt-6">
            <p className="text-xs text-slate-400">
              Want more features?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
              >
                Sign in to customize your link alias, set expiration dates, and view analytics traffic.
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
