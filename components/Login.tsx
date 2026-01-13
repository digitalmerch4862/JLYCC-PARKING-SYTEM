
import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = StorageService.getUsers();
    const found = users.find(u => u.userName === username && u.password === password);
    
    if (found) {
      onLogin(found);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#212733] px-4 font-inter transition-colors duration-500">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-[100px] h-[100px] bg-[#2563eb] rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] mb-8">
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor">
               <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">JLYCC</h1>
          <p className="text-[#6b7280] dark:text-[#94a3b8] text-[13px] font-black uppercase tracking-[0.25em]">Parking Monitoring</p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-8 bg-white dark:bg-transparent p-10 sm:p-0 rounded-[2.5rem] shadow-xl sm:shadow-none border border-slate-100 sm:border-none">
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

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-bold rounded-xl text-center animate-in fade-in zoom-in-95 duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-[#2563eb] hover:bg-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] text-[17px] mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Recovery info */}
          <div className="pt-4 text-center">
            <button 
              onClick={() => alert('Please contact: rad4862@gmail.com for password recovery.')}
              className="text-slate-400 dark:text-[#4b5563] hover:text-blue-600 dark:hover:text-blue-400 text-[13px] font-bold transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
