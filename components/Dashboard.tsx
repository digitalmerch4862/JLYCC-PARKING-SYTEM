
import React, { useState, useEffect } from 'react';
import { LogEntry, User, Vehicle } from '../types';
import { StorageService, maskPhone, MAX_CAPACITY } from '../services/storage';
import { supabase } from '../services/supabase';
import TrainingView from './TrainingView';

interface DashboardProps {
  user: User;
  onAction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onAction }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestPlate, setGuestPlate] = useState('');
  const [errorNote, setErrorNote] = useState(false);

  const isAdmin = user.roleName === 'Admin';
  const isSuper = user.isSuperAdmin === true;
  const MAP_URL = "https://maps.app.goo.gl/NXSLHHjoF3P3ByF89";
  const ADMIN_PHONE = "09694887065";

  const fetchData = async () => {
    const [allLogs, allVehicles] = await Promise.all([
      StorageService.getLogs(),
      StorageService.getDatabase()
    ]);
    setLogs(allLogs);
    setVehicles(allVehicles);
    setActiveLogs(allLogs.filter(log => !log.checkOut));
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    initialFetch();

    // Set up Realtime Subscription for both logs and vehicle count
    const subscription = supabase
      .channel('dashboard_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_logs' },
        (payload) => {
          console.log('Realtime change detected in parking_logs:', payload);
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Realtime change detected in vehicles:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleCheckOut = async (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    if (targetLog) {
      const updated = { ...targetLog, checkOut: new Date().toISOString() };
      await StorageService.updateLog(updated);
      // Realtime will handle the refresh, but local update for speed
      await fetchData();
    }
  };

  const getOwnersForPlate = (plate: string) => {
    return vehicles.filter(v => v.plateNumber.toUpperCase() === plate.toUpperCase());
  };

  const verifyAndContact = (type: 'call' | 'sms') => {
    const isCheckedIn = activeLogs.some(log => log.plateNumber.toUpperCase() === guestPlate.toUpperCase().trim());
    if (!isCheckedIn || guestPlate.trim() === '') {
      setErrorNote(true);
      setTimeout(() => setErrorNote(false), 5000);
      return;
    }
    window.location.href = type === 'call' ? `tel:${ADMIN_PHONE}` : `sms:${ADMIN_PHONE}`;
  };

  const occupiedCarSlots = activeLogs.filter(log => log.vehicleModel === '4 WHEELS').length;
  const availableSlots = Math.max(0, MAX_CAPACITY - occupiedCarSlots);

  const getOccupancyColorClasses = () => {
    if (availableSlots === 0) {
      return 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-900/50 dark:text-red-400';
    }
    if (availableSlots <= 5) {
      return 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-900/50 dark:text-amber-400';
    }
    return 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-900/50 dark:text-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 relative">
      {errorNote && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border-4 border-blue-600 animate-in slide-in-from-top-10 duration-300">
          <div className="flex items-start gap-4">
             <div className="bg-blue-600 p-2 rounded-xl shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div>
               <p className="font-black uppercase text-xs tracking-widest text-blue-400 mb-1">Access Denied</p>
               <p className="text-sm font-bold leading-relaxed">Note: This function is designated for checked-in vehicles only.</p>
             </div>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isAdmin ? 'System Overview' : 'Parking Availability'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isSuper ? 'Master Console: Complete system authority.' : isAdmin ? 'Staff Dashboard: Manage arrivals and records.' : 'Real-time parking status for JLYCC.'}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={onAction}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black rounded-[1.25rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Check-In
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="space-y-6 w-full max-w-[200px]">
            <p className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Available Slots</p>
            <div className={`w-full py-10 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-sm ${getOccupancyColorClasses()}`}>
              <span className="text-8xl font-black leading-none tracking-tighter">{availableSlots}</span>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="contents lg:flex lg:flex-col lg:gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 space-y-6">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Parking Assistance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Contact admin for help or inquiries.</p>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Plate Number</label>
                  <input 
                    type="text" value={guestPlate} onChange={(e) => setGuestPlate(e.target.value.toUpperCase())}
                    placeholder="Enter Plate to Verify Status"
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase"
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => verifyAndContact('sms')} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20">Message</button>
                  <button onClick={() => verifyAndContact('call')} className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98] text-xs uppercase tracking-wider">Call</button>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Visit JLYCC Main</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Find your way to our main facility.</p>
              </div>
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all active:scale-[0.98] text-sm tracking-wide uppercase shadow-lg shadow-blue-500/10">Open Map</a>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-6 flex-1">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cloud Registry</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{vehicles.length}</p>
              </div>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 flex flex-col justify-center items-center text-center flex-1">
               <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Active Sessions</p>
               <p className="text-white text-5xl font-black">{activeLogs.length}</p>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Active Vehicle Sessions</h3>
            <span className="flex items-center space-x-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr><th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plate Group</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Registered Contacts</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entry Time</th><th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {activeLogs.length === 0 ? (<tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 italic">No vehicles currently active.</td></tr>) : (
                  activeLogs.map((log) => {
                    const owners = getOwnersForPlate(log.plateNumber);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 sm:px-8 py-5"><div><p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">{log.plateNumber}</p><p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{log.vehicleModel} • {log.vehicleColor}</p></div></td>
                        <td className="px-6 py-5 hidden sm:table-cell"><div className="flex flex-wrap gap-1">{owners.length > 0 ? owners.map((owner, idx) => (<span key={idx} className="inline-flex flex-col px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{owner.nickname} {owner.familyName}</span><span className="text-[8px] text-slate-500 font-bold">{maskPhone(owner.mobileNumber)}</span></span>)) : (<span className="text-[10px] text-slate-400 italic">Guest / Unknown</span>)}</div></td>
                        <td className="px-6 py-5"><p className="text-sm text-slate-900 dark:text-300 font-black">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{new Date(log.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p></td>
                        <td className="px-6 sm:px-8 py-5 text-right"><button onClick={() => handleCheckOut(log.id)} className="px-5 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Check Out</button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
           <TrainingView />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
