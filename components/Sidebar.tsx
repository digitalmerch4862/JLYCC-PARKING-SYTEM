
import React from 'react';
import { ViewState, User } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, user, onLogout }) => {
  const navItems: { label: string; view: ViewState; icon: string; adminOnly?: boolean }[] = [
    { label: 'Dash', view: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Check In', view: 'CheckIn', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
    { label: 'Vehicles', view: 'VehicleList', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'History', view: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex h-screen sticky top-0 shadow-2xl">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight text-white">JLYCC</h1>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-[0.3em]">Parking Monitoring</p>
        </div>

        <nav className="flex-1 mt-8 px-4 space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && user.roleName !== 'Admin') return null;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <svg className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                </svg>
                <span className="font-bold">{item.label === 'Dash' ? 'Dashboard' : item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-4 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-inner">
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user.userName}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.roleName}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-xs font-bold text-slate-400 hover:text-red-400 border border-slate-700 rounded-xl transition-all hover:bg-red-400/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation (Bottom Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex items-center justify-around z-50 safe-area-bottom shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          if (item.adminOnly && user.roleName !== 'Admin') return null;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex flex-col items-center justify-center flex-1 space-y-1 py-1 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <svg className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center justify-center flex-1 space-y-1 py-1 text-slate-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          <span className="text-[10px] font-bold">Sign Out</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
