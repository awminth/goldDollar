import React, { useState, useEffect } from 'react';
import { DollarSign, Coins, ExternalLink, Calendar, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/awminth/goldDollar/refs/heads/main/scraper/data.json'; 

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, fetch from GitHub raw URL. For now, use local mock
      const res = await fetch(GITHUB_RAW_URL);
      const jsonData = await res.json();
      setData(jsonData);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-4xl flex flex-col space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center glass rounded-2xl p-6">
          <div className="flex items-center space-x-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
            <Coins size={32} className="text-amber-400" />
            <span>Myanmar Rates Tracker</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {data && (
              <div className="flex text-amber-200 items-center space-x-2 text-sm glass px-3 py-1.5 rounded-full">
                <Calendar size={16} />
                <span>{data.date}</span>
              </div>
            )}
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 text-slate-300"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {loading && !data ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="glass border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
            {error}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* USD Card */}
            <div className="glass bg-white/5 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform">
                <DollarSign size={100} className="text-emerald-400" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                      <DollarSign className="text-emerald-400 font-bold" size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">US Dollar</h2>
                      <p className="text-sm text-slate-400">USD / MMK</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <TrendingDown size={18} className="text-blue-400" />
                        <span>Buy Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {formatCurrency(data.usd_buy)} <span className="text-sm font-normal opacity-70">Ks</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <TrendingUp size={18} className="text-emerald-400" />
                        <span>Sell Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(data.usd_sell)} <span className="text-sm font-normal opacity-70">Ks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Card */}
            <div className="glass bg-white/5 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform">
                <Coins size={100} className="text-amber-400" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
                    <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
                      <Coins className="text-amber-400" size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">Myanmar Gold</h2>
                      <p className="text-sm text-slate-400">16 Pe (Kyat Thar)</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <TrendingDown size={18} className="text-blue-400" />
                        <span>Buy Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {formatCurrency(data.gold_buy)} <span className="text-sm font-normal opacity-70">Ks</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <TrendingUp size={18} className="text-amber-400" />
                        <span>Sell Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-400">
                        {formatCurrency(data.gold_sell)} <span className="text-sm font-normal opacity-70">Ks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}

        <footer className="text-center text-slate-500 text-sm mt-8 opacity-70 hover:opacity-100 transition-opacity">
          Data scraped from <a href="https://t.me/s/goldcurrencyupdate" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1"><span>@goldcurrencyupdate</span> <ExternalLink size={12} /></a>
        </footer>
      </div>
    </div>
  );
}

export default App;
