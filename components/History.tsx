
import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { StorageService } from '../services/storage';

const History: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLogs(StorageService.getLogs().reverse()); // Show newest first
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesDate = filterDate ? l.checkIn.startsWith(filterDate) : true;
    const matchesSearch = searchTerm ? 
      (l.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
       l.familyName.toLowerCase().includes(searchTerm.toLowerCase())) 
      : true;
    return matchesDate && matchesSearch;
  });

  const formatDuration = (checkInStr: string, checkOutStr: string | null) => {
    if (!checkOutStr) return null;
    const start = new Date(checkInStr).getTime();
    const end = new Date(checkOutStr).getTime();
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else {
      const mins = Math.round(diffMs / (1000 * 60));
      return `${mins} mins`;
    }
  };

  const downloadCSV = () => {
    const headers = [
      'Date', 
      'Plate Number', 
      'Vehicle Model', 
      'Vehicle Color', 
      'First Name', 
      'Family Name', 
      'Mobile Number', 
      'Check In', 
      'Check Out',
      'Duration'
    ];
    
    const rows = filteredLogs.map(log => [
      new Date(log.checkIn).toLocaleDateString(),
      log.plateNumber,
      log.vehicleModel,
      log.vehicleColor,
      log.firstName,
      log.familyName,
      log.mobileNumbers,
      new Date(log.checkIn).toLocaleTimeString(),
      log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'Parked',
      formatDuration(log.checkIn, log.checkOut) || '--'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parking_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 transition-colors duration-500">
      {/* Frozen Header Section */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] dark:bg-slate-950 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 pt-2 pb-6 space-y-6 shadow-[0_15px_15px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Activity Logs</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Full history of parking check-ins and check-outs.</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 active:scale-95 text-lg"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search plate or owner..."
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <input
              type="date"
              className="w-full px-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg text-slate-700 dark:text-slate-200"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vehicle</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Check In</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 dark:text-slate-500 italic text-lg">No activity logs found matching your criteria.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const checkIn = new Date(log.checkIn);
                  const checkOut = log.checkOut ? new Date(log.checkOut) : null;
                  const durationLabel = formatDuration(log.checkIn, log.checkOut);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{checkIn.toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-xs font-black rounded-lg border border-slate-200 dark:border-slate-700 uppercase w-fit shadow-sm">{log.plateNumber}</div>
                             <span className="text-sm font-bold text-slate-900 dark:text-slate-300 uppercase truncate max-w-[150px]">{log.firstName} {log.familyName}</span>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{log.vehicleModel}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-blue-600 dark:text-blue-400">{checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase">{checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {checkOut ? (
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase">{checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-widest shadow-sm">Parked</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {durationLabel ? (
                          <p className="text-lg font-black text-slate-700 dark:text-slate-300">{durationLabel}</p>
                        ) : (
                          <p className="text-lg font-black text-slate-300 dark:text-slate-600">--</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
