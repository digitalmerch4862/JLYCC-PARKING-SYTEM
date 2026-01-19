
import React, { useState, useEffect } from 'react';

interface Sermon {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
}

const FALLBACK_SERMONS: Sermon[] = [
  {
    id: "GiURvSANcmw",
    title: "Sunday Service: Year of Flourish",
    date: "Jan 1, 2026",
    thumbnail: "https://img.youtube.com/vi/GiURvSANcmw/mqdefault.jpg"
  },
  {
    id: "ScMzIvxBSi4",
    title: "Midweek Service: Power of Prayer",
    date: "Dec 28, 2025",
    thumbnail: "https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg"
  },
  {
    id: "9bZkp7q19f0",
    title: "Worship Night Highlights",
    date: "Dec 25, 2025",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg"
  }
];

const RSS_API = "https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UCxTCV_x9eQZmnhei1NIal0g";

const SermonsView: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [mainVideo, setMainVideo] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(RSS_API);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (data.status === "ok" && data.items) {
          const mappedSermons: Sermon[] = data.items.map((item: any) => {
            // GUID is usually "yt:video:[VIDEO_ID]"
            const videoId = item.guid.split(':')[2];
            return {
              id: videoId,
              title: item.title,
              date: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            };
          });

          setSermons(mappedSermons);
          if (mappedSermons.length > 0) {
            setMainVideo(mappedSermons[0]);
          } else {
             // If feed is empty for some reason, use fallback
             setSermons(FALLBACK_SERMONS);
             setMainVideo(FALLBACK_SERMONS[0]);
          }
        } else {
          throw new Error("RSS2JSON returned error");
        }
      } catch (err) {
        console.warn("Using fallback sermons due to fetch error:", err);
        setError(true);
        setSermons(FALLBACK_SERMONS);
        setMainVideo(FALLBACK_SERMONS[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest animate-pulse">Loading Latest Sermons...</p>
       </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 px-2">
         <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-500/20 text-white">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
         </div>
         <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Sermons & Streams</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
              {error ? "Offline Archive" : "Live from YouTube Channel"}
            </p>
         </div>
      </div>

      {/* Main Player */}
      {mainVideo && (
        <div className="space-y-4">
           <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-900 dark:border-slate-800">
              <iframe 
                src={`https://www.youtube.com/embed/${mainVideo.id}?autoplay=0`} 
                title={mainVideo.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
           </div>
           <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">{mainVideo.title}</h3>
              <div className="flex items-center gap-3 mt-3">
                 <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full">Featured</span>
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">{mainVideo.date}</p>
              </div>
           </div>
        </div>
      )}

      {/* Recent List */}
      <div className="pt-8 space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white border-l-4 border-red-600 pl-4 uppercase tracking-tight">Recent Messages</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {sermons.filter(s => s.id !== mainVideo?.id).map((video) => (
             <button 
               key={video.id}
               onClick={() => {
                 setMainVideo(video);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all text-left flex flex-col h-full hover:-translate-y-1"
             >
                <div className="relative aspect-video w-full overflow-hidden">
                   <img 
                     src={video.thumbnail} 
                     alt={video.title} 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all shadow-lg">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                   </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                   <h4 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">{video.title}</h4>
                   <p className="text-xs font-medium text-slate-400 mt-auto pt-3">{video.date}</p>
                </div>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SermonsView;
