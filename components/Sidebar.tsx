
import React from 'react';
import { ViewState, User } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  user, 
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const isAdmin = user.roleName === 'Admin';
  
  const navItems: { label: string; view: ViewState; icon: string; adminOnly?: boolean; hideForGuest?: boolean }[] = [
    { label: 'Parking', view: 'Parking', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Check In', view: 'CheckIn', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1', adminOnly: true },
    { label: 'Vehicles', view: 'VehicleList', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', adminOnly: true },
    { label: 'History', view: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', adminOnly: true },
    { label: 'Bible', view: 'Bible', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Year Declaration', view: 'Devotion', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Parking School', view: 'Training', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', hideForGuest: true },
    { label: 'Our Pastor', view: 'Pastor', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Contact Us', view: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.hideForGuest && !isAdmin) return false;
    return true;
  });

  const NavContent = () => (
    <>
      <div className="p-8 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">JLYCC</h1>
        </div>
        <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item) => {
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
              <span className="font-bold">{item.label}</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          <span>SIGN OUT</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
      
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex h-screen sticky top-0 shadow-2xl">
        <NavContent />
      </div>

      <div 
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
        
        <div 
          className={`absolute top-0 right-0 h-full w-4/5 max-w-[300px] bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-out transform ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <NavContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
