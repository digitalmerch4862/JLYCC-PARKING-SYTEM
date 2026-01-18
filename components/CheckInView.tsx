import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, User } from '../types';
import { StorageService, maskPhone, VehicleGroup } from '../services/storage';
import { supabase } from '../services/supabase';

interface CheckInViewProps {
  user: User;
  onComplete: () => void;
}

const CheckInView: React.FC<CheckInViewProps> = ({ user, onComplete }) => {
  const [groups, setGroups] = useState<VehicleGroup[]>([]);
  const [activePlates, setActivePlates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<VehicleGroup | null>(null);
  const [parkingLocation, setParkingLocation] = useState<'Covered' | 'Street'>('Covered');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vehiclesData, logsData] = await Promise.all([
          StorageService.getGroupedVehicles(),
          StorageService.getLogs()
        ]);
        
        setGroups(vehiclesData);
        
        // Identify currently checked-in vehicles (where checkOut is null)
        const active = new Set(
          logsData
            .filter(log => !log.checkOut)
            .map(log => log.plateNumber.toUpperCase())
        );
        setActivePlates(active);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out plates that are already checked in
  const filteredGroups = groups.filter(g => {
    const isCheckedIn = activePlates.has(g.plateNumber.toUpperCase());
    const matchesSearch = g.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && !isCheckedIn;
  });

  const handleSelect = (group: VehicleGroup) => {
    setSelectedGroup(group);
    setSearchTerm(group.plateNumber);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    
    // Only auto-select if it's not checked in
    const match = groups.find(g => 
      g.plateNumber.toUpperCase() === val.toUpperCase() && 
      !activePlates.has(g.plateNumber.toUpperCase())
    );
    
    if (!match) setSelectedGroup(null);
    else setSelectedGroup(match);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const plateToCheck = selectedGroup.plateNumber;
    const primaryOwner = selectedGroup.owners[0];

    try {
      // 1. Search Vehicle in DB
      const { data: vehicleCheck, error: searchError } = await supabase
        .from('vehicles')
        .select('plate_number')
        .eq('plate_number', plateToCheck)
        .limit(1);

      if (searchError) throw searchError;

      // 2. Decision: If Vehicle NOT Found
      if (!vehicleCheck || vehicleCheck.length === 0) {
        alert('Vehicle not found. Please register first.');
        return;
      }

      // 3. Decision: If Vehicle Found
      if (parkingLocation === 'Covered') {
        // If Covered Parking: Insert into parking_logs
        
        // Check local cache for duplicates to be safe
        if (activePlates.has(plateToCheck.toUpperCase())) {
          alert("This vehicle is already checked in.");
          return;
        }

        const newLog: Omit<LogEntry, 'id'> = {
          plateNumber: selectedGroup.plateNumber,
          vehicleModel: selectedGroup.vehicleModel,
          vehicleColor: selectedGroup.vehicleColor,
          familyName: primaryOwner.familyName,
          nickname: primaryOwner.nickname,
          mobileNumber: primaryOwner.mobileNumber,
          email: primaryOwner.email,
          checkIn: new Date().toISOString(),
          checkOut: null,
          attendantName: user.userName,
          parkingLocation: 'Covered'
        };

        await StorageService.addLog(newLog);

      } else {
        // If Street Parking: Insert into street_queue
        const { error: queueError } = await supabase
          .from('street_queue')
          .insert([{
             plate_number: selectedGroup.plateNumber,
             vehicle_model: selectedGroup.vehicleModel,
             vehicle_color: selectedGroup.vehicleColor,
             family_name: primaryOwner.familyName,
             first_name: primaryOwner.nickname,
             mobile_number: primaryOwner.mobileNumber,
             email: primaryOwner.email,
             entry_time: new Date().toISOString(),
             attendant_name: user.userName
          }]);
        
        if (queueError) throw queueError;
      }

      // 4. Completion
      onComplete();

    } catch (err: any) {
      console.error("Check-in failed:", err);
      alert(`Error processing check-in: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/40 space-y-8">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Plate Check-In</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">Monitoring unique plate identifiers.</p>
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
                placeholder="Search Plate Group..."
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-black text-slate-900 dark:text-white text-xl shadow-sm pr-12"
                required
              />
              
              {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(g => (
                      <div
                        key={g.plateNumber}
                        onClick={() => handleSelect(g)}
                        className={`px-6 py-4 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${
                          selectedGroup?.plateNumber === g.plateNumber ? 'bg-blue-50 dark:bg-blue-900/40' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-black">{g.plateNumber}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 uppercase font-black">
                            {g.owners.length} {g.owners.length === 1 ? 'Owner' : 'Owners'}
                          </span>
                        </div>
                        <div className="text-xs opacity-60 font-medium truncate mt-1">
                          {g.owners.map(o => `${o.nickname} ${o.familyName}`).join(', ')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-slate-400 dark:text-slate-600 text-center italic">
                      {searchTerm ? 'No available plates found' : 'Type to search...'}
                    </div>
                  )}
                </div>
              )}
            </div>
            {activePlates.size > 0 && (
              <p className="text-[10px] text-slate-400 italic text-right pr-2">
                * Currently parked vehicles are hidden
              </p>
            )}
          </div>

          {selectedGroup && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selected Vehicle</h3>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedGroup.plateNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-700 dark:text-300">{selectedGroup.vehicleModel}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">{selectedGroup.vehicleColor}</p>
                </div>
              </div>

              {/* Parking Location Selection */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Parking Location</label>
                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setParkingLocation('Covered')}
                    className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all ${
                      parkingLocation === 'Covered'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-md scale-[1.02]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Covered Parking
                  </button>
                  <button
                    type="button"
                    onClick={() => setParkingLocation('Street')}
                    className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all ${
                      parkingLocation === 'Street'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-md scale-[1.02]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Street Parking
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 order-2 sm:order-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-[1.25rem] hover:bg-slate-200 transition-all text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedGroup}
              className={`flex-1 order-1 sm:order-2 px-8 py-5 font-black rounded-[1.25rem] transition-all text-lg shadow-lg ${
                selectedGroup 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-95' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed'
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