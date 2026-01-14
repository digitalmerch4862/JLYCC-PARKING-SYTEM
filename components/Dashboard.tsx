
import React, { useState, useEffect } from 'react';
import { LogEntry, User, Vehicle } from '../types';
import { StorageService, maskPhone, MAX_CAPACITY } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  user: User;
  onAction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onAction }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.roleName === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    const [allLogs, allVehicles] = await Promise.all([
      StorageService.getLogs(),
      StorageService.getDatabase()
    ]);
    setLogs(allLogs);
    setVehicles(allVehicles);
    setActiveLogs(allLogs.filter(log => !log.checkOut));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckOut = async (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    if (targetLog) {
      const updated = { ...targetLog, checkOut: new Date().toISOString() };
      await StorageService.updateLog(updated);
      await fetchData();
    }
  };

  const getOwnersForPlate = (plate: string) => {
    return vehicles.filter(v => v.plateNumber.toUpperCase() === plate.toUpperCase());
  };

  const occupancyPercent = Math.min(100, Math.round((activeLogs.length / MAX_CAPACITY) * 100));
  const isFull = activeLogs.length >= MAX_CAPACITY;

  const data = [
    { name: 'Occupied', value: activeLogs.length },
    { name: 'Available', value: Math.max(0, MAX_CAPACITY - activeLogs.length) },
  ];
  const COLORS = ['#2563eb', '#f1f5f9'];
  const DARK_COLORS = ['#3b82f6', '#1e293b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isAdmin ? 'System Overview' : 'Parking Availability'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isAdmin ? 'Monitor parking occupancy and active plate sessions.' : 'Real-time parking status for JLYCC.'}
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

      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-5 sm:gap-6`}>
        <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between ${!isAdmin ? 'max-w-2xl mx-auto w-full' : ''}`}>
          <div className="space-y-2 text-center sm:text-left mb-6 sm:mb-0">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Occupancy</p>
            <div className="flex items-baseline space-x-2 justify-center sm:justify-start">
              <p className="text-5xl font-black text-slate-900 dark:text-white">{occupancyPercent}%</p>
              <p className="text-slate-400 font-bold">({activeLogs.length}/{MAX_CAPACITY})</p>
            </div>
            <div className="pt-2">
              {isFull ? (
                <span className="px-4 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-full tracking-widest border border-red-200 dark:border-red-900/50">Full</span>
              ) : (
                <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-widest border border-emerald-200 dark:border-emerald-900/50">Available</span>
              )}
            </div>
          </div>
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={document.documentElement.classList.contains('dark') ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Plates</p>
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
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cloud Registry</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{vehicles.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Active Vehicle Sessions</h3>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plate Group</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Registered Contacts</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entry Time</th>
                  <th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {activeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 italic">No vehicles currently active.</td>
                  </tr>
                ) : (
                  activeLogs.map((log) => {
                    const owners = getOwnersForPlate(log.plateNumber);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 sm:px-8 py-5">
                          <div>
                            <p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">{log.plateNumber}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{log.vehicleModel} • {log.vehicleColor}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {owners.length > 0 ? (
                              owners.map((owner, idx) => (
                                <span key={idx} className="inline-flex flex-col px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{owner.firstName} {owner.familyName}</span>
                                  <span className="text-[8px] text-slate-500 font-bold">{maskPhone(owner.mobileNumber)}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Guest / Unknown</span>
                            )}
                          </div>
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
                            className="px-5 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50"
                          >
                            Check Out
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
