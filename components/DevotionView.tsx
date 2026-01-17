
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface DevotionData {
  dailyTitle: string;
  anchorScripture: string;
  reflectionParagraph1: string;
  reflectionParagraph2: string;
  propheticDeclaration: string;
  actionStep: string;
}

const DevotionView: React.FC = () => {
  const [devotion, setDevotion] = useState<DevotionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDevotion = async () => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
      const response = await ai.models.generateContent({
        // @ts-ignore
        model: 'gemini-1.5-flash-001',
        contents: `Generate today's "Flourish 2026" daily devotion. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
        config: {
          systemInstruction: `You are a spiritual mentor and devotional writer for the "Flourish 2026" app, based on the theme from Jesus Loves You Ministries International (JLYMI). 

Your goal is to generate a daily devotion that empowers believers to live out the "Year of Flourish."

### Structure of Every Response:
1. Daily Title: A catchy, encouraging title (e.g., "Deep Roots, High Heights").
2. Anchor Scripture: One verse from the Bible (focusing heavily on Psalm 92:12-14, John 1, or themes of growth, strength, and victory).
3. The Flourish Reflection: A 2-paragraph teaching. 
   - Paragraph 1: Connect the scripture to the "Flourish" theme (Palm trees, Cedars of Lebanon, being planted in God's house).
   - Paragraph 2: Practical application for modern life (work, family, and ministry).
4. Prophetic Declaration: A first-person "I am" statement the user can speak aloud.
5. Today’s Seed (Action Step): One practical, small task to "plant" a seed of growth today.

### Tone & Style:
- Encouraging, prophetic, and authoritative yet warm.
- Focus on resilience ("the palm tree bends but doesn't break") and longevity ("bearing fruit in old age").
- Use the term "Flourish" frequently.
- Keep the language accessible for church members of all ages.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailyTitle: { type: Type.STRING },
              anchorScripture: { type: Type.STRING },
              reflectionParagraph1: { type: Type.STRING },
              reflectionParagraph2: { type: Type.STRING },
              propheticDeclaration: { type: Type.STRING },
              actionStep: { type: Type.STRING },
            },
            required: ["dailyTitle", "anchorScripture", "reflectionParagraph1", "reflectionParagraph2", "propheticDeclaration", "actionStep"]
          }
        },
      });

      const data = JSON.parse(response.text || '{}');
      setDevotion(data);
      // Store in local storage to prevent multiple calls on the same day
      localStorage.setItem('jlycc_daily_devotion', JSON.stringify({
        date: new Date().toDateString(),
        data: data
      }));
    } catch (err) {
      console.error("Devotion generation failed:", err);
      setError("Unable to generate today's devotion. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('jlycc_daily_devotion');
    if (cached) {
      const { date, data } = JSON.parse(cached);
      if (date === new Date().toDateString()) {
        setDevotion(data);
        return;
      }
    }
    generateDevotion();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Flourish Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">FLOURISH <span className="text-emerald-300">2026</span></h2>
            <p className="text-emerald-100 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">Jesus Loves You Ministries International</p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
             <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse"></div>
             <span className="text-sm font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Devotion</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 flex flex-col items-center justify-center space-y-6 shadow-xl border border-slate-100 dark:border-slate-800">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm animate-pulse">Preparing Today's Seed...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-12 rounded-[3rem] text-center space-y-6">
           <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-4xl">⚠️</div>
           <p className="text-red-800 dark:text-red-300 font-bold text-xl">{error}</p>
           <button onClick={generateDevotion} className="px-10 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest">Retry Connection</button>
        </div>
      )}

      {devotion && !loading && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
            
            {/* Title & Scripture */}
            <div className="space-y-6 text-center">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{devotion.dailyTitle}</h1>
              <div className="relative inline-block px-8 py-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Anchor Scripture</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 italic">"{devotion.anchorScripture}"</p>
              </div>
            </div>

            {/* Reflection */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-8 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-emerald-600 first-letter:mr-3 first-letter:float-left">
                  {devotion.reflectionParagraph1}
                </p>
                <p>{devotion.reflectionParagraph2}</p>
              </div>
            </div>

            {/* Prophetic Declaration */}
            <div className="bg-slate-900 dark:bg-emerald-600 p-8 sm:p-12 rounded-[3rem] shadow-xl text-white space-y-6 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300 dark:text-white/70">Prophetic Declaration</h3>
               <p className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                 {devotion.propheticDeclaration}
               </p>
            </div>

            {/* Action Step */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">🌱</div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Today's Seed</h3>
               </div>
               <p className="text-lg text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                 {devotion.actionStep}
               </p>
            </div>
          </div>

          <div className="flex justify-center">
             <button 
               onClick={generateDevotion}
               className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-black rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-emerald-500 transition-all text-xs uppercase tracking-widest"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               Refresh Devotion
             </button>
          </div>
        </div>
      )}

      <footer className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] pt-8">
        Year of Flourish 2026 • JLYMI • JLYCC
      </footer>
    </div>
  );
};

export default DevotionView;
