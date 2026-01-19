
import React, { useState, useEffect } from 'react';
import { User, ViewState, LogEntry } from './types';
import { StorageService } from './services/storage';
import { SoundService } from './services/audio';
import { AutomationService } from './services/automation';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VehicleList from './components/VehicleList';
import History from './components/History';
import CheckInView from './components/CheckInView';
import TrainingView from './components/TrainingView';
import ContactView from './components/ContactView';
import PastorView from './components/PastorView';
import DevotionView from './components/DevotionView';
import BibleView from './components/BibleView';
import SermonsView from './components/SermonsView';

const MONITORING_INTERVAL = 60000;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('Parking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jlycc_current_user');
    if (saved) setCurrentUser(JSON.parse(saved));

    const updateTheme = () => {
      const hour = new Date().getHours();
      const isDark = hour < 7 || hour >= 17;
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };

    const runAutomation = () => AutomationService.processScheduledTasks();
    const automationInterval = setInterval(runAutomation, MONITORING_INTERVAL);
    const themeInterval = setInterval(updateTheme, MONITORING_INTERVAL);
    
    updateTheme();
    runAutomation();

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) SoundService.playClick();
    };

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) SoundService.playHover();
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mouseover', handleGlobalMouseOver);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      clearInterval(automationInterval);
      clearInterval(themeInterval);
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('jlycc_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jlycc_current_user');
  };

  const handleViewChange = (view: ViewState) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeView) {
      case 'Parking':
        return <Dashboard user={currentUser} onAction={() => setActiveView('CheckIn')} />;
      case 'VehicleList':
        return <VehicleList isAdmin={currentUser.roleName === 'Admin'} user={currentUser} />;
      case 'History':
        return <History user={currentUser} />;
      case 'CheckIn':
        return <CheckInView user={currentUser} onComplete={() => setActiveView('Parking')} />;
      case 'Training':
        return <TrainingView onQuit={() => handleViewChange('Contact')} />;
      case 'Contact':
        return <ContactView />;
      case 'Pastor':
        return <PastorView />;
      case 'Devotion':
        return <DevotionView />;
      case 'Bible':
        return <BibleView />;
      case 'Sermons':
        return <SermonsView />;
      default:
        return <Dashboard user={currentUser} onAction={() => setActiveView('CheckIn')} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} user={currentUser} onLogout={handleLogout} isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />
      
      <div className="lg:hidden bg-slate-900 dark:bg-black px-6 py-4 sticky top-0 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{currentUser.userName.charAt(0).toUpperCase()}</div>
          <div><h1 className="text-xl font-black text-white leading-none">JLYCC</h1></div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Open Menu">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      <main className="flex-1 p-5 sm:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
