
import React, { useState, useEffect } from 'react';

interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  error?: string;
}

const BibleView: React.FC = () => {
  const [query, setQuery] = useState('John 3:16');
  const [searchTrigger, setSearchTrigger] = useState('John 3:16');
  const [version, setVersion] = useState<'KJV' | 'NIV'>('KJV');
  const [bibleData, setBibleData] = useState<BibleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch for KJV as it is the public domain version we support natively
    if (version === 'NIV') return;

    const fetchBible = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(searchTrigger)}?translation=kjv`);
        if (!res.ok) throw new Error('Verse not found');
        const data = await res.json();
        setBibleData(data);
      } catch (err) {
        setError('Could not find passage. Please try a standard format like "John 3:16" or "Psalm 23".');
        setBibleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBible();
  }, [searchTrigger, version]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchTrigger(query);
  };

  const openNIV = () => {
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(searchTrigger)}&version=NIV`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
             <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">THE <span className="text-indigo-300">WORD</span></h2>
             <p className="text-indigo-100 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">Scripture & Study</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 min-h-[500px] flex flex-col">
        
        {/* Controls */}
        <div className="space-y-6 pb-8 border-b border-slate-100 dark:border-slate-800">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-fit mx-auto sm:mx-0">
              <button 
                onClick={() => setVersion('KJV')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${version === 'KJV' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                KJV
              </button>
              <button 
                onClick={() => setVersion('NIV')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${version === 'NIV' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                NIV
              </button>
           </div>

           <form onSubmit={handleSearch} className="relative group">
              <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter passage (e.g. Psalm 23, John 3:16)"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
                <button type="submit" className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20">
                   GO
                </button>
              </div>
           </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 py-8">
           {version === 'KJV' && (
             <>
               {loading ? (
                 <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Opening Scripture...</p>
                 </div>
               ) : error ? (
                 <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">⚠️</div>
                    <p className="text-slate-500 font-bold">{error}</p>
                 </div>
               ) : bibleData ? (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center space-y-2 pb-6 border-b border-slate-50 dark:border-slate-800/50">
                       <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{bibleData.reference}</h3>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">King James Version</p>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                       {bibleData.verses.map((verse, idx) => (
                         <div key={idx} className="relative pl-6 sm:pl-8 py-2 group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                            <span className="absolute left-0 top-3 text-[10px] font-black text-indigo-400 select-none">{verse.verse}</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-lg sm:text-xl">
                              {verse.text.replace(/\n/g, ' ')}
                            </p>
                         </div>
                       ))}
                    </div>
                 </div>
               ) : null}
             </>
           )}

           {version === 'NIV' && (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
                   📖
                </div>
                <div className="max-w-md mx-auto space-y-3">
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">New International Version</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                     The NIV is copyright protected and cannot be displayed directly here. However, you can read this passage on BibleGateway.
                   </p>
                </div>
                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 w-full max-w-sm">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Selected Passage</p>
                   <p className="text-xl font-black text-indigo-900 dark:text-indigo-200">{searchTrigger}</p>
                </div>
                <button 
                  onClick={openNIV}
                  className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <span>Read on BibleGateway</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BibleView;
