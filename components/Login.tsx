
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  // Default to true to show form immediately, hiding selection buttons
  const [showFields, setShowFields] = useState(true); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auth Rules:
    // 1. rad / 6244 -> Super Admin (Full Control)
    // 2. berna / neh220 -> Super Admin (Full Control)
    // 3. Any / neh220 -> Admin (Add/Edit only)
    
    const isSuperRad = username === 'rad' && password === '6244';
    const isSuperBerna = username === 'berna' && password === 'neh220';

    if (isSuperRad || isSuperBerna) {
      onLogin({
        userName: username,
        roleName: 'Admin',
        isSuperAdmin: true
      });
    } else if (password === 'neh220') {
      onLogin({
        userName: username || 'Admin User',
        roleName: 'Admin',
        isSuperAdmin: false
      });
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  // SMS link for the developer
  const CONTACT_PHONE = "09694887065";
  const smsMessage = "hi im interested in jlycc conact me";
  const contactDevLink = `sms:${CONTACT_PHONE}?body=${encodeURIComponent(smsMessage)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1f29] px-4 font-inter transition-colors duration-500">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        <div className="mb-10 flex flex-col items-center">
          <div className="w-[100px] h-[100px] rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] mb-8">
            <img 
              src="https://lh3.googleusercontent.com/d/1fdOFajbIj--tmVyrydPhUUVh1gGaBg-s" 
              className="w-full h-full object-cover" 
              alt="JLYCC Logo" 
            />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">JLYCC</h1>
        </div>

        <div className="w-full bg-white dark:bg-[#252b36] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 transition-all duration-300">
          <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Username</label>
                  <input
                    type="text"
                    required
                    autoFocus
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
                    className={`w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-100 dark:border-white/5'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-5 bg-[#2563eb] hover:bg-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] text-[17px]"
                >
                  Sign In
                </button>
              </form>
          </div>
        </div>

        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <a 
            href={contactDevLink} 
            className="text-[11px] font-black text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 uppercase tracking-[0.2em] transition-all underline decoration-1 underline-offset-4"
          >
            CONTACT DEV
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
