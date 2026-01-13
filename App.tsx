
import React, { useState, useEffect } from 'react';
import { User, ViewState, LogEntry } from './types';
import { StorageService } from './services/storage';
import { SoundService } from './services/audio';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VehicleList from './components/VehicleList';
import History from './components/History';
import CheckInView from './components/CheckInView';

const RECIPIENT_EMAIL = 'rad4862@gmail.com';
const MONITORING_INTERVAL = 60000; // Check every minute

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('Dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('jlycc_current_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }

    // Theme monitoring logic
    const updateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      // Light mode: 7 AM (7) to 5 PM (17). 17:00:00 starts dark mode.
      const isDark = hour < 7 || hour >= 17;
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const themeInterval = setInterval(updateTheme, MONITORING_INTERVAL);
    updateTheme(); // Run immediately

    // Long Stay Monitoring logic
    const checkLongStays = () => {
      const logs = StorageService.getLogs();
      const activeLogs = logs.filter(log => !log.checkOut);
      const now = new Date();
      let updatedCount = 0;

      activeLogs.forEach(log => {
        const checkInTime = new Date(log.checkIn).getTime();
        const diffMs = now.getTime() - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 24) {
          const lastSent = log.lastFollowUpSentAt ? new Date(log.lastFollowUpSentAt).getTime() : 0;
          const timeSinceLastEmail = (now.getTime() - lastSent) / (1000 * 60 * 60);

          if (!log.lastFollowUpSentAt || timeSinceLastEmail >= 24) {
            console.log(`[SIMULATED EMAIL] To: ${RECIPIENT_EMAIL}`);
            console.log(`Subject: Long Stay Vehicle Detected - ${log.plateNumber}`);
            console.log(`Message: Vehicle ${log.vehicleModel} (${log.plateNumber}) has been parked for ${Math.floor(diffHours)} hours without check-out.`);
            
            log.lastFollowUpSentAt = now.toISOString();
            updatedCount++;
          }
        }
      });

      if (updatedCount > 0) {
        logs.forEach(originalLog => {
          const matchingActive = activeLogs.find(al => al.id === originalLog.id);
          if (matchingActive && matchingActive.lastFollowUpSentAt) {
            originalLog.lastFollowUpSentAt = matchingActive.lastFollowUpSentAt;
          }
        });
        localStorage.setItem('jlycc_logs', JSON.stringify(logs));
      }
    };

    const interval = setInterval(checkLongStays, MONITORING_INTERVAL);
    checkLongStays(); 

    // Global sound effects
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) {
        SoundService.playClick();
      }
    };

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) {
        SoundService.playHover();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mouseover', handleGlobalMouseOver);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      clearInterval(interval);
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

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard user={currentUser} onAction={() => setActiveView('CheckIn')} />;
      case 'VehicleList':
        return <VehicleList isAdmin={currentUser.roleName === 'Admin'} />;
      case 'History':
        return <History />;
      case 'CheckIn':
        return <CheckInView onComplete={() => setActiveView('Dashboard')} />;
      default:
        return <Dashboard user={currentUser} onAction={() => setActiveView('CheckIn')} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="lg:hidden bg-slate-900 dark:bg-black px-6 py-4 sticky top-0 z-40 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-black text-white leading-none">JLYCC</h1>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Parking Monitoring</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {currentUser.userName.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <main className="flex-1 p-5 sm:p-8 lg:p-12 pb-24 lg:pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
