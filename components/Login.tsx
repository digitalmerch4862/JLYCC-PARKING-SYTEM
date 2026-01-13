
import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

type LoginViewState = 'Login' | 'Recovery';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<LoginViewState>('Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = StorageService.getUsers();
    const found = users.find(u => u.userName === username && u.password === password);
    
    if (found) {
      onLogin(found);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Simulate Google Authentication
    setTimeout(() => {
      // For demo, we just log in as the default admin 'jly'
      const admin = StorageService.getUsers().find(u => u.userName === 'jly');
      if (admin) {
        onLogin(admin);
      }
      setLoading(false);
    }, 1500);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const user = StorageService.findUserByEmail(recoveryEmail);
    if (user) {
      setSuccess(`Retrieval successful! Your password has been sent to ${recoveryEmail}. (Simulation: ${user.password})`);
    } else {
      setError('No account found with this email address.');
    }
  };

  if (viewState === 'Recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1f29] px-4 font-inter transition-colors duration-500">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Password Recovery</h1>
            <p className="text-slate-500 dark:text-[#6b7280] text-[14px] text-center max-w-[300px]">Enter your email and we'll send you your retrieval password.</p>
          </div>

          <div className="w-full space-y-8 bg-white dark:bg-[#252b36] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5">
            <form onSubmit={handleRecovery} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border border-slate-100 dark:border-white/5 rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium"
                  placeholder="name@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-xl text-center">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-[#2563eb] hover:bg-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] text-[17px]"
              >
                Send Retrieval Link
              </button>
            </form>

            <div className="pt-2 text-center">
              <button 
                onClick={() => { setViewState('Login'); setError(''); setSuccess(''); }}
                className="text-slate-500 dark:text-[#6b7280] hover:text-blue-600 dark:hover:text-blue-400 text-[13px] font-bold transition-colors flex items-center justify-center mx-auto"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1f29] px-4 font-inter transition-colors duration-500">
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
        <div className="w-full space-y-6 bg-white dark:bg-[#252b36] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5">
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-white dark:bg-[#2d3441] border border-slate-200 dark:border-white/10 rounded-[1.25rem] text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm mb-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#FBBC05" d="M16.04 18.013c-1.09.613-2.345.968-3.693.968-3.564 0-6.605-2.45-7.618-5.741L.703 16.355C2.613 20.44 6.963 24 12 24c3.082 0 5.823-1.045 8-2.827l-3.96-3.16z"/>
                  <path fill="#4285F4" d="M19.91 3l-3.49 3.491c1.2.982 1.964 2.455 1.964 4.091 0 .28-.023.556-.068.825H12v4.4h6.736C18.15 18.254 15.355 20 12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8c1.69 0 3.218.6 4.418 1.582L19.91 3z"/>
                  <path fill="#34A853" d="M22.25 12c0-.682-.068-1.341-.182-1.977H12v4.4h6.736c-.446 2.15-1.741 3.968-3.696 4.982l3.96 3.16C21.132 20.44 24 16.909 24 12c0-.341-.01-.67-.03-.99H12v2.2h8.07c-.182 1.977-1.341 3.568-3.07 4.545l4.026 3.115A11.96 11.96 0 0 0 24 12c0-.341-.01-.67-.03-.99H12v2.2h8.07c-.182 1.977-1.341 3.568-3.07 4.545l4.026 3.115A11.96 11.96 0 0 0 24 12c0-.341-.01-.67-.03-.99H12v2.2h8.07c-.182 1.977-1.341 3.568-3.07 4.545l4.026 3.115"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-black uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
          </div>

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
              onClick={() => setViewState('Recovery')}
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
