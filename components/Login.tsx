
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = password === 'nehemiah220';
    onLogin({
      userName: username || 'User',
      roleName: isAdmin ? 'Admin' : 'Guest'
    });
  };

  const handleGuestLogin = () => {
    onLogin({
      userName: 'Guest User',
      roleName: 'Guest'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1f29] px-4 font-inter transition-colors duration-500">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        <div className="mb-10 flex flex-col items-center">
          <div className="w-[100px] h-[100px] bg-[#2563eb] rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] mb-8">
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor">
               <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">JLYCC</h1>
          <p className="text-[#6b7280] dark:text-[#94a3b8] text-[13px] font-black uppercase tracking-[0.25em]">PARKING SYSTEM</p>
        </div>

        <div className="w-full space-y-6 bg-white dark:bg-[#252b36] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border border-slate-100 dark:border-white/5 rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border border-slate-100 dark:border-white/5 rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full py-5 bg-[#2563eb] hover:bg-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] text-[17px]"
              >
                Sign In
              </button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#252b36] px-3 text-slate-400 dark:text-slate-600 font-bold">Or</span></div>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-5 bg-slate-50 dark:bg-[#2d3441] hover:bg-slate-100 dark:hover:bg-[#343c4a] text-slate-600 dark:text-slate-400 font-black rounded-[1.25rem] transition-all border border-slate-100 dark:border-white/5 text-[17px]"
              >
                Continue as Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
