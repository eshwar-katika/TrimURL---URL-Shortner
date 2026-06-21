import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { UrlItem, AnalyticsData } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Link2, Trash2, Calendar, Eye, RefreshCw, BarChart2, 
  MapPin, Globe, Smartphone, Activity, AlertCircle, ExternalLink 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<String | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<String | null>(null);

  const fetchUrls = async () => {
    setUrlsLoading(true);
    setError(null);
    try {
      const data = await api.getUserUrls();
      setUrls(data);
      if (data.length > 0 && !selectedCode) {
        setSelectedCode(data[0].shortCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your URLs.');
    } finally {
      setUrlsLoading(false);
    }
  };

  const fetchStats = async (code: String) => {
    setStatsLoading(true);
    try {
      const stats = await api.getUrlStats(code);
      setAnalytics(stats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (code: String, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this shortened URL?')) return;
    
    try {
      await api.deleteUrl(code);
      setUrls(urls.filter(item => item.shortCode !== code));
      if (selectedCode === code) {
        setAnalytics(null);
        setSelectedCode(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete URL.');
    }
  };

  const handleCopy = (shortUrl: string, code: String, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  useEffect(() => {
    if (selectedCode) {
      fetchStats(selectedCode);
    }
  }, [selectedCode]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#eab308', '#10b981'];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Your Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage links and monitor traffic logs</p>
        </div>
        <button
          onClick={fetchUrls}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-950/30 border border-rose-800/40 p-4 rounded-xl text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: URLs list */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Links ({urls.length})
          </h2>
          
          {urlsLoading ? (
            <div className="glass p-12 rounded-xl text-center text-slate-500 border border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
              Loading links...
            </div>
          ) : urls.length === 0 ? (
            <div className="glass p-12 rounded-xl text-center text-slate-500 border border-slate-800">
              <Link2 className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              You haven't shortened any links yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[650px] pr-1">
              {urls.map(url => (
                <div
                  key={url.id}
                  onClick={() => setSelectedCode(url.shortCode)}
                  className={`glass p-4 rounded-xl cursor-pointer border transition-all text-left relative ${
                    selectedCode === url.shortCode
                      ? 'border-indigo-500/60 bg-indigo-950/20 shadow-glow'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-bold text-slate-200 text-sm truncate flex-1">
                      /{url.shortCode}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        url.status === 'ACTIVE' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}>
                        {url.status}
                      </span>
                      <button
                        onClick={(e) => handleDelete(url.shortCode, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-3">{url.longUrl}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/40">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(url.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded text-slate-300 font-bold">
                      <Eye className="w-3 h-3" />
                      {url.clickCount} clicks
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={(e) => handleCopy(url.shortUrl, url.shortCode, e)}
                    className={`absolute right-3.5 top-12 text-[10px] px-2 py-1 rounded font-semibold border transition-all ${
                      copiedCode === url.shortCode
                        ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                        : 'bg-indigo-600/10 border-indigo-500/10 text-indigo-300 hover:bg-indigo-600/20'
                    }`}
                  >
                    {copiedCode === url.shortCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Analytics details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {!selectedCode ? (
            <div className="glass p-16 rounded-2xl border border-slate-800 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
              <BarChart2 className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-medium">Select a short code from the left to view detailed traffic metrics.</p>
            </div>
          ) : statsLoading ? (
            <div className="glass p-16 rounded-2xl border border-slate-800 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm">Fetching real-time metrics...</p>
            </div>
          ) : !analytics ? (
            <div className="glass p-16 rounded-2xl border border-slate-800 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
              <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm">No analytics details found for this short link.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Title Bar */}
              <div className="glass p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="truncate flex-1">
                  <span className="text-[10px] font-semibold uppercase text-indigo-400 block mb-0.5">Short URL</span>
                  <a
                    href={`${urls.find(u => u.shortCode === selectedCode)?.shortUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-white hover:text-indigo-400 flex items-center gap-1.5 hover:underline"
                  >
                    /{selectedCode}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">Total Clicks</span>
                  <span className="text-xl font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg">
                    {analytics.totalClicks}
                  </span>
                </div>
              </div>

              {/* Chart 1: Overtime Click History */}
              <div className="glass p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Traffic History (clicks over time)
                </h3>
                <div className="h-60 w-full">
                  {analytics.clickHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
                      No redirection traffic registered yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.clickHistory}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={11} 
                          tickFormatter={(str) => {
                            try {
                              return new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                            } catch (e) {
                              return str;
                            }
                          }}
                        />
                        <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Grid: Pie Charts & Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Geographics (Country) */}
                <div className="glass p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    Top Countries
                  </h3>
                  <div className="h-48 w-full flex items-center">
                    {analytics.byCountry.length === 0 ? (
                      <div className="w-full text-center text-slate-500 text-xs font-semibold">No geographic logs</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.byCountry} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={70} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {analytics.byCountry.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Device & Browser split */}
                <div className="glass p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-pink-400" />
                    Device Distribution
                  </h3>
                  <div className="h-48 w-full flex items-center justify-between gap-2">
                    {analytics.byDevice.length === 0 ? (
                      <div className="w-full text-center text-slate-500 text-xs font-semibold">No device logs</div>
                    ) : (
                      <>
                        <div className="w-1/2 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.byDevice}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {analytics.byDevice.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 flex flex-col gap-2.5 text-xs text-slate-300">
                          {analytics.byDevice.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="font-semibold truncate">{entry.name}:</span>
                              <span className="text-slate-400 font-bold ml-auto">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Browser list (placed as secondary metric) */}
                <div className="glass p-5 rounded-2xl border border-slate-800 md:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Web Browsers Used
                  </h3>
                  {analytics.byBrowser.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-4">No browser logs registered</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {analytics.byBrowser.map((entry) => (
                        <div key={entry.name} className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col items-center">
                          <span className="text-xs text-slate-400 font-semibold mb-1 truncate w-full text-center">
                            {entry.name}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
