import React from 'react';

const PastorView: React.FC = () => {
  const PASTOR_IMAGE = "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/db866b4c52bc48917a1fe9199f7fd583~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1127965a&x-expires=1769007600&x-signature=IlOPxrHoxVV%2BOJ%2B72DpI%2BeUXNaM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Profile Header Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
        
        <div className="p-8 sm:p-16 flex flex-col items-center text-center space-y-8">
          <div className="shrink-0 relative">
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-xl">
               <img 
                 src={PASTOR_IMAGE} 
                 alt="Bishop Rey Pe Benito" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.src = "https://via.placeholder.com/400x400?text=Bishop+Rey";
                 }}
               />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
              Senior Pastor
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Bishop <span className="text-blue-600">Rey Pe Benito</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[11px] font-black uppercase tracking-widest">Chairman</span>
              <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[11px] font-black uppercase tracking-widest">JLYM & JLYCC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biography Section */}
      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <p>
                Bishop Rey Pe Benito is a respected Christian leader and devoted servant of God based in Manila, Philippines, known for his dedication to ministry, leadership, and community transformation. He currently serves as a Bishop at the Philippine Council of Evangelical Bishops, where he continues to strengthen the work of the Church and support evangelical leadership across the nation.
              </p>
              <p>
                He is also the Chairman and Senior Pastor of JLYM & JLYCC, faithfully guiding the spiritual growth of congregations through teaching, mentorship, and pastoral care. In addition, he leads impactful humanitarian and outreach initiatives as the President/Chairman of the Heart for the World Foundation, reflecting his commitment to faith in action and compassionate service to communities.
              </p>
              <p>
                Bishop Rey Pe Benito pursued his early education at Saint Jerome’s Academy and continued his studies at Saint Louis University in Baguio City, helping shape his values and leadership foundation. He is proudly from Manila and continues to live and serve in the same city, staying deeply connected to the people and communities he is passionate about uplifting.
              </p>
              <p>
                Through his ministry and advocacy, Bishop Rey Pe Benito remains committed to spreading the Gospel, raising leaders, and making a lasting difference both spiritually and socially.
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-10 border-t border-slate-50 dark:border-slate-800">
             <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-6 text-center">Connect with Bishop Rey</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href="https://www.facebook.com/rey.pebenito.51" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Facebook</span>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
                
                <a 
                  href="https://www.tiktok.com/@bishop_rpb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-black transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.32 2.51.69 2.75 2.08.08.46.06.92-.05 1.34.73.1 1.39.39 1.91.85.52.46.88 1.08 1.01 1.79.13.71.02 1.44-.31 2.05-.33.61-.88 1.09-1.54 1.35.48.51.78 1.18.82 1.93.04.75-.18 1.46-.61 2.01-.43.55-1.05.93-1.74 1.05-.69.12-1.4.01-1.99-.3-.59-.31-1.04-.81-1.25-1.42-.31.6-.82 1.07-1.45 1.32s-1.32.27-1.97.05c-.65-.22-1.21-.66-1.56-1.24-.35-.58-.49-1.27-.38-1.95.11-.68.45-1.29.96-1.74-.71-.14-1.35-.49-1.81-1.01-.46-.52-.72-1.18-.73-1.87-.01-.69.23-1.36.67-1.88.44-.52 1.05-.88 1.74-1.01-.69-.13-1.3-.51-1.73-1.07-.43-.56-.66-1.24-.62-1.93.04-.69.31-1.34.77-1.83.46-.49 1.09-.8 1.79-.88.24-.03.49-.03.73-.01V.02z" /></svg>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">TikTok</span>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
             </div>
          </div>
        </section>
      </div>

      <footer className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] pt-8">
        Jesus Loves You City Church • JLYCC
      </footer>
    </div>
  );
};

export default PastorView;