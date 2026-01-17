
import React from 'react';

const DevotionView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <p className="text-emerald-200 font-bold uppercase tracking-[0.3em] text-sm">Declaration of Faith</p>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">YEAR TO <br className="sm:hidden" /><span className="text-emerald-300">FLOURISH</span></h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 sm:p-16 space-y-12">
          
          {/* Intro */}
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Church Family, This is Our Declaration</h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              We are not stepping into a year of struggle, delay, or defeat—we are stepping into a year of growth, fruitfulness, strength, and Kingdom impact.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

          {/* Declaration Sections */}
          <div className="space-y-10">
            {/* Planted */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">
                 Psalm 92:13–14
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">We Are Planted and We Will Flourish</h4>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium italic border-l-4 border-emerald-500 pl-4">
                "Those who are planted in the house of the Lord shall flourish in the courts of our God."
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-slate-700 dark:text-slate-300 font-bold leading-relaxed space-y-2">
                <p>We declare today:</p>
                <ul className="list-disc list-inside space-y-1 marker:text-emerald-500">
                  <li>We are planted in God’s house.</li>
                  <li>We are rooted in His presence.</li>
                  <li>We are established in His Word.</li>
                  <li>And because we are planted we will flourish!</li>
                </ul>
              </div>
            </div>

            {/* Fruit */}
            <div className="space-y-4">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">We Will Bear Much Fruit</h4>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                Flourishing is not just a feeling; flourishing is bearing much fruit.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-slate-700 dark:text-slate-300 font-bold leading-relaxed space-y-2">
                <p>This year we declare:</p>
                <ul className="list-disc list-inside space-y-1 marker:text-emerald-500">
                  <li>Our lives will be productive.</li>
                  <li>Our families will be blessed.</li>
                  <li>Our faith will increase.</li>
                  <li>Our ministries will grow.</li>
                  <li>Our purpose will become clearer.</li>
                  <li>Our testimonies will be undeniable.</li>
                </ul>
              </div>
            </div>

            {/* Strength */}
            <div className="space-y-4">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">We Will Be Strong and Unshakable</h4>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                We declare that we will flourish like the palm tree—resilient and victorious. We declare that we will grow like the cedar of Lebanon—strong, stable, and enduring.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl text-blue-800 dark:text-blue-200 font-bold leading-relaxed">
                <p>Even when pressure comes, we will not collapse.</p>
                <p>Even when challenges rise, we will not retreat.</p>
                <p>We are strengthened by the Lord, and we will stand firm.</p>
              </div>
            </div>

            {/* Soul Winners */}
            <div className="space-y-4">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">We Are Soul Winners</h4>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                This year, we will not just grow personally—we will grow the Kingdom. Because we believe that the greatest fruit we can bear is souls for the Kingdom of God.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-slate-700 dark:text-slate-300 font-bold leading-relaxed space-y-2">
                <p>We declare:</p>
                <ul className="list-disc list-inside space-y-1 marker:text-emerald-500">
                  <li>We will win souls.</li>
                  <li>We will preach Jesus with boldness.</li>
                  <li>We will invite, reach, and restore.</li>
                  <li>We will be a “tree of life” to our communities.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

          {/* Final Declaration */}
          <div className="bg-slate-900 dark:bg-black p-8 sm:p-12 rounded-[2.5rem] text-center space-y-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
             <h3 className="text-2xl font-black text-white uppercase tracking-widest">Final Declaration</h3>
             <div className="text-xl sm:text-2xl font-bold text-slate-300 leading-relaxed space-y-4">
               <p>Church, lift your faith and declare it loud:</p>
               <p className="text-white font-black">This is our year to flourish!</p>
               <p>We are planted! We are growing! We are fruitful!</p>
               <p>We are winning souls! We are blessed! We are unstoppable!</p>
               <p className="text-emerald-400">And we will flourish in every area—spiritually, financially, emotionally, and in ministry.</p>
             </div>
          </div>

          {/* Video Button */}
          <div className="pt-8 text-center pb-4">
            <a 
              href="https://www.youtube.com/watch?v=GiURvSANcmw&t=3428s"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-5 bg-[#FF0000] text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 text-lg uppercase tracking-wide group hover:scale-105"
            >
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span>Watch the Message</span>
            </a>
            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Opens in new tab</p>
          </div>

        </div>
      </div>

      <footer className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] pt-8">
        Year of Flourish 2026 • JLYMI • JLYCC
      </footer>
    </div>
  );
};

export default DevotionView;
