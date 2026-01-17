
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lowerName = username.toLowerCase().trim();

    if (lowerName.length < 3) {
      setError("Name must be at least 3 characters");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Tier 1: rad / 6244 (Super Admin)
    if (lowerName === 'rad' && password === '6244') {
      onLogin({
        userName: 'rad',
        roleName: 'Admin',
        isSuperAdmin: true
      });
    } 
    // Tier 2: berna / neh220 (Super Admin)
    else if (lowerName === 'berna' && password === 'neh220') {
      onLogin({
        userName: 'berna',
        roleName: 'Admin',
        isSuperAdmin: true
      });
    } 
    // Tier 3: Nickname / neh220 (Standard Admin)
    else if (password === 'neh220') {
      onLogin({
        userName: username,
        roleName: 'Admin',
        isSuperAdmin: false
      });
    } 
    else {
      setError("Incorrect credentials");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      onLogin({
        userName: 'Guest User',
        roleName: 'Guest'
      });
    } catch (err) {
      console.error("Guest login failed:", err);
      // Fallback local login if supabase fails
      onLogin({
        userName: 'Guest User',
        roleName: 'Guest'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 font-sans">
      
      {/* PWA Install Notification for Android/Desktop */}
      {deferredPrompt && (
        <div className="fixed top-6 left-6 right-6 z-50 bg-blue-600 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 animate-in slide-in-from-top-10 duration-500">
          <p className="text-xl font-black text-center">Add to Home Screen for Easy Access</p>
          <button 
            onClick={handleInstallClick}
            className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg"
          >
            Install App Now
          </button>
        </div>
      )}

      <div className="w-full max-w-[500px] space-y-12">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20">
             <img 
               src="https://lh3.googleusercontent.com/d/1fdOFajbIj--tmVyrydPhUUVh1gGaBg-s" 
               className="w-24 h-24 object-contain invert brightness-0" 
               alt="JLYCC Logo" 
             />
          </div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">JLYCC</h1>
        </div>

        {/* Selection Interface */}
        {!showAdminForm ? (
          <div className="space-y-6">
            <button
              onClick={handleGuestLogin}
              className="w-full py-12 bg-blue-600 text-white rounded-[3rem] shadow-2xl shadow-blue-500/30 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all"
            >
              <span className="text-6xl font-black uppercase tracking-tighter">Guest</span>
            </button>

            <button
              onClick={() => setShowAdminForm(true)}
              className="w-full py-10 bg-slate-100 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[3rem] flex items-center justify-center gap-4 active:scale-95 transition-all"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-5xl font-black uppercase tracking-tight">Admin</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="space-y-8 bg-slate-50 dark:bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border-4 border-blue-600/20 animate-in zoom-in-95 duration-300">
            <div className="space-y-4">
              <label className="text-xl font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
              <input
                type="text"
                autoFocus
                placeholder="(Nickname)"
                className="w-full py-6 px-8 bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 rounded-3xl text-3xl font-black outline-none focus:border-blue-600 transition-all lowercase placeholder:text-slate-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-xl font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <input
                type="password"
                className={`w-full py-6 px-8 bg-white dark:bg-slate-800 border-4 rounded-3xl text-3xl font-black outline-none transition-all ${error ? 'border-red-600 ring-4 ring-red-600/10' : 'border-slate-200 dark:border-slate-700 focus:border-blue-600'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-600 font-bold text-center animate-bounce">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-8 bg-blue-600 text-white rounded-[2rem] text-4xl font-black uppercase tracking-tighter shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setShowAdminForm(false); setError(null); }}
              className="w-full py-4 text-slate-400 font-black text-xl uppercase tracking-widest"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* iOS Instructions */}
      {isIOS && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-6 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-slate-800 animate-in slide-in-from-bottom-full duration-700 delay-1000">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-2"></div>
             <p className="text-lg font-bold text-center leading-snug">
               To save this app: Tap the <span className="text-blue-400">Share button</span> (square with arrow) and select <span className="text-blue-400">"Add to Home Screen"</span>.
             </p>
             <div className="flex items-center gap-6 mt-2">
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                      <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 11l-3 3h2v4h2v-4h2l-3-3zm0-9c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>
                   </div>
                   <span className="text-[10px] font-black uppercase mt-2">Share</span>
                </div>
                <div className="w-8 h-px bg-slate-700"></div>
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                   </div>
                   <span className="text-[10px] font-black uppercase mt-2">Add</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
