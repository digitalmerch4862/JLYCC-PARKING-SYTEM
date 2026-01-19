
import React, { useState, useEffect, useRef } from 'react';

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

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", 
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", 
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", 
  "Song of Solomon (Song of Songs)", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", 
  "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", 
  "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", 
  "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", 
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", 
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const BibleView: React.FC = () => {
  // Set default verse to John 3:16
  const [searchTrigger, setSearchTrigger] = useState('John 3:16');
  const [version, setVersion] = useState<'KJV' | 'NIV'>('KJV');
  
  // Search state
  const [bookQuery, setBookQuery] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [verse, setVerse] = useState('16');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bibleData, setBibleData] = useState<BibleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBible = async () => {
      setLoading(true);
      setError('');
      
      const apiTranslation = version === 'NIV' ? 'web' : 'kjv';

      try {
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(searchTrigger)}?translation=${apiTranslation}`);
        
        if (!res.ok) throw new Error('Verse not found');
        const data = await res.json();
        setBibleData(data);
      } catch (err) {
        setError('Could not find passage. Please check the book, chapter, and verse.');
        setBibleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBible();
  }, [searchTrigger, version]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookQuery.trim() || !chapter.trim()) {
        setError('Please enter at least a Book and a Chapter.');
        return;
    }
    
    // Sanitize book name for API (remove parenthetical aliases like "(Song of Songs)")
    const cleanBook = bookQuery.replace(/\s*\(.*?\)\s*/g, '');
    const q = `${cleanBook} ${chapter}${verse.trim() ? ':' + verse : ''}`;
    
    setSearchTrigger(q);
    setIsDropdownOpen(false);
  };

  const filteredBooks = BIBLE_BOOKS.filter(b => 
    b.toLowerCase().includes(bookQuery.toLowerCase())
  );

  const selectBook = (b: string) => {
    setBookQuery(b);
    setIsDropdownOpen(false);
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

           <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 grid grid-cols-12 gap-3">
                {/* Book Dropdown */}
                <div className="col-span-12 sm:col-span-6 relative" ref={dropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Book"
                      value={bookQuery}
                      onChange={(e) => {
                        setBookQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-slate-200"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                      {filteredBooks.length > 0 ? (
                        filteredBooks.map((b) => (
                          <div
                            key={b}
                            onClick={() => selectBook(b)}
                            className={`px-5 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-medium text-slate-700 dark:text-slate-300 ${bookQuery === b ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : ''}`}
                          >
                            {b}
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-3 text-slate-400 italic text-sm">No books found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chapter */}
                <div className="col-span-6 sm:col-span-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ch"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-slate-200 text-center"
                  />
                </div>

                {/* Verse */}
                <div className="col-span-6 sm:col-span-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ver"
                    value={verse}
                    onChange={(e) => setVerse(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-slate-200 text-center"
                  />
                </div>
              </div>

              <button type="submit" className="w-full lg:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                 SEARCH
              </button>
           </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 py-8">
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
                       <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                         {version === 'KJV' ? 'King James Version' : 'Modern English (WEB)'}
                       </p>
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
        </div>
      </div>
    </div>
  );
};

export default BibleView;
