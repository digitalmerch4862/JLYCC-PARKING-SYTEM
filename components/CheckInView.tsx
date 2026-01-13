
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, LogEntry } from '../types';
import { StorageService } from '../services/storage';

interface CheckInViewProps {
  onComplete: () => void;
}

const CheckInView: React.FC<CheckInViewProps> = ({ onComplete }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVehicles(StorageService.getDatabase());
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchTerm(vehicle.plateNumber);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    const match = vehicles.find(v => v.plateNumber === val);
    if (!match) setSelectedVehicle(null);
    else setSelectedVehicle(match);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const newLog: Omit<LogEntry, 'id'> = {
      ...selectedVehicle,
      checkIn: new Date().toISOString(),
      checkOut: null
    };

    StorageService.addLog(newLog);
    onComplete();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 animate-in slide-in-from-bottom-4 duration-500 pb-10 transition-colors duration-500">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/40 space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vehicle Check-In</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">Select a registered plate number to begin.</p>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-10">
          <div className="space-y-3 relative" ref={dropdownRef}>
            <label className="text-sm font-bold text-slate-800 dark:text-slate-300 ml-1">Plate Number</label>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Select Plate..."
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-medium text-slate-900 dark:text-white text-lg shadow-sm pr-12"
                required
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Searchable Dropdown List */}
              {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map(v => (
                      <div
                        key={v.plateNumber}
                        onClick={() => handleSelect(v)}
                        className={`px-6 py-4 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors flex justify-between items-center ${
                          selectedVehicle?.plateNumber === v.plateNumber ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">{v.plateNumber}</span>
                        <span className="text-xs opacity-60 font-medium">{v.vehicleModel}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-slate-400 dark:text-slate-600 text-center italic">No matching plates found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedVehicle && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selected Vehicle</h3>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedVehicle.vehicleModel}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedVehicle.vehicleColor}</p>
                </div>
                <img 
                  src={selectedVehicle.vehiclePicture} 
                  alt="Vehicle" 
                  className="w-full sm:w-32 h-32 sm:h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Owner Name</h3>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedVehicle.firstName} {selectedVehicle.familyName}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Contact</h3>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedVehicle.mobileNumbers}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 order-2 sm:order-1 px-8 py-5 bg-[#f1f5f9] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-[1.25rem] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedVehicle}
              className={`flex-1 order-1 sm:order-2 px-8 py-5 font-bold rounded-[1.25rem] transition-all text-lg shadow-lg active:scale-95 ${
                selectedVehicle 
                ? 'bg-[#2563eb] text-white hover:bg-blue-700 shadow-blue-100 dark:shadow-blue-900/20' 
                : 'bg-[#e2e8f0] dark:bg-slate-800/50 text-[#94a3b8] dark:text-slate-700 cursor-not-allowed shadow-none'
              }`}
            >
              Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInView;
