
import React, { useState } from 'react';

interface AdminVerificationModalProps {
  onVerify: () => void;
  onCancel: () => void;
}

const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({ onVerify, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'nehemiah220') {
      onVerify();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Verification Required</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Please enter the admin password to proceed with this sensitive action.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              autoFocus
              required
              placeholder="Enter Admin Password"
              className={`w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all text-center font-bold tracking-widest text-lg ${
                error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-blue-500'
              }`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
            {error && <p className="text-red-500 text-xs font-bold text-center">Incorrect Password</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVerificationModal;
