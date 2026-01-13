
import React, { useState, useEffect } from 'react';
import { LogEntry, User } from '../types';
import { StorageService, maskPhone, DEFAULT_CAR_SVG } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  user: User;
  onAction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onAction }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const allLogs = StorageService.getLogs();
    setLogs(allLogs);
    setActiveLogs(allLogs.filter(log => !log.checkOut));
  }, []);

  const handleCheckOut = (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    if (targetLog) {
      const updated = { ...targetLog, checkOut: new Date().toISOString() };
      StorageService.updateLog(updated);
      const allLogs = StorageService.getLogs();
      setLogs(allLogs);
      setActiveLogs(allLogs.filter(log => !log.checkOut));
    }
  };

  const data = [
    { name: 'Occupied', value: activeLogs.length },
    { name: 'Available', value: Math.max(0, 100 - activeLogs.length) },
  ];
  const COLORS = ['#2563eb', '#f1f5f9'];
  const DARK_COLORS = ['#3b82f6', '#1e293b'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Monitor parking occupancy and active sessions.</p>
        </div>
        <button 
          onClick={onAction}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-[1.25rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Check-In
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Vehicles</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{activeLogs.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Logs</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{logs.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm h-[140px] flex items-center justify-between md:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Occupancy</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{Math.round((activeLogs.length / 100) * 100)}%</p>
          </div>
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={28} outerRadius={42} paddingAngle={4} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={document.documentElement.classList.contains('dark') ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Live Traffic</h3>
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Live Data</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Owner</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entry</th>
                <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {activeLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 italic">No vehicles currently parked.</td>
                </tr>
              ) : (
                activeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="relative p-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <img 
                            src={log.vehiclePicture || DEFAULT_CAR_SVG} 
                            alt={log.vehicleModel} 
                            className="w-14 h-11 object-contain rounded-[0.75rem]" 
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{log.plateNumber}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{log.vehicleModel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{log.firstName} {log.familyName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{maskPhone(log.mobileNumbers)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-900 dark:text-slate-300 font-black">
                        {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                        {new Date(log.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-right">
                      <button 
                        onClick={() => handleCheckOut(log.id)}
                        className="px-5 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest"
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
