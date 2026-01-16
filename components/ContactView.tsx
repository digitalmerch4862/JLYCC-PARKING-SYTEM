
import React from 'react';

const ContactView: React.FC = () => {
  const contactItems = [
    { label: 'Facebook', url: 'https://www.facebook.com/jlycc.main', color: 'bg-[#1877F2]', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { label: 'YouTube', url: 'https://www.youtube.com/@jlymicentral233', color: 'bg-[#FF0000]', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 00-1.94 2C1 8.14 1 12 1 12s0 3.86 1.46 5.58a2.78 2.78 0 001.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 001.94-2C23 15.86 23 12 23 12s0-3.86-1.46-5.58z M9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
    { label: 'Website', url: 'https://jlycc.org/', color: 'bg-slate-700', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9' },
  ];

  return (
    <div className="flex flex-col gap-10 min-h-[calc(100vh-120px)] animate-in fade-in duration-500 pb-12">
      {/* Main Content - Church Profile */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="relative h-48 sm:h-72 overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/d/1fdOFajbIj--tmVyrydPhUUVh1gGaBg-s" 
            className="w-full h-full object-cover opacity-10 blur-xl absolute inset-0" 
            alt="Background blur"
          />
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-b from-transparent to-white dark:to-slate-900">
             <div className="text-center">
                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 text-center">JESUS LOVES YOU</h1>
                <p className="text-blue-600 dark:text-blue-400 font-black text-sm sm:text-xl uppercase tracking-[0.5em] text-center">CITY CHURCH</p>
             </div>
          </div>
        </div>

        <div className="p-8 sm:p-16 space-y-12">
          <section className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white border-l-4 border-blue-600 pl-4 tracking-tight uppercase">Welcome to the Family</h3>
            <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              At Jesus Loves You City Church, we passionately believe in the transforming love of our Lord Jesus Christ. Our church is a place where everyone is welcomed with open arms, encouraged to grow spiritually, and empowered to experience the fullness of God’s love and purpose.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-50 dark:border-slate-800">
            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest mb-2 shadow-sm">The Dream</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">
                The Jesus Loves You City Church exists to provide a place to come before God in worship; committed to disciples who demonstrate our faith in a contemporary, creative, caring way; and established churches all over the world.
              </p>
            </section>

            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-widest mb-2 shadow-sm">The Call</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 text-lg">We exist to glorify God by:</p>
              <ul className="space-y-5">
                {[
                  "Worshiping Him in spirit and truth.",
                  "Discipling believers to grow in faith and share the gospel.",
                  "Reaching out to the lost and bringing hope to our communities through Christ-centered outreach."
                ].map((point, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm shadow-sm">{i+1}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Connection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <header className="px-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Connect Us</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Our Official Platforms</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactItems.map((contact) => (
              <a
                key={contact.label}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-5 p-6 rounded-[2rem] text-white font-black text-lg uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-black/5 group ${contact.color}`}
              >
                <div className="bg-white/20 p-4 rounded-2xl group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d={contact.icon} />
                  </svg>
                </div>
                {contact.label}
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <header className="px-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Visit Us</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Physical Location</p>
          </header>

          <div className="p-8 h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] space-y-6 shadow-xl flex flex-col justify-center">
             <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <p className="text-base font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">JLYCC Main Campus, Manila, Philippines</p>
             </div>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-6">
                Join our community online or in-person for our regular services and events. We look forward to seeing you there!
             </p>
             <a 
                href="https://maps.app.goo.gl/3eG8J4CsFJtUkhmB8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white font-black text-center rounded-2xl hover:bg-black transition-all text-xs tracking-[0.2em] uppercase"
             >
                Get Directions
             </a>
          </div>
        </section>
      </div>

      <footer className="pt-8 text-center border-t border-slate-100 dark:border-slate-800">
         <p className="text-slate-400 dark:text-slate-500 text-sm font-bold italic">“For God so loved the world that He gave His only begotten Son...” — John 3:16</p>
      </footer>
    </div>
  );
};

export default ContactView;
