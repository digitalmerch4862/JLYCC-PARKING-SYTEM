
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { StorageService, maskPhone, VehicleGroup, MAX_CAPACITY } from '../services/storage';
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
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vehiclesData = await StorageService.getGroupedVehicles();
        setGroups(vehiclesData);
        
        // Fetch active logs (both parking and queue) to prevent duplicates
        const { data: logsData } = await supabase
          .from('parking_logs')
          .select('plate_number')
          .is('check_out', null);

        const { data: queueData } = await supabase
          .from('street_queue')
          .select('plate_number');

        let activeSet = new Set<string>();
        let occupancy = 0;

        if (logsData) {
           occupancy = logsData.length;
           logsData.forEach(l => activeSet.add(l.plate_number.toUpperCase()));
        }
        if (queueData) {
           queueData.forEach(q => activeSet.add(q.plate_number.toUpperCase()));
        }
        
        setCurrentOccupancy(occupancy);
        setActivePlates(activeSet);

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
    
    const match = groups.find(g => 
      g.plateNumber.toUpperCase() === val.toUpperCase() && 
      !activePlates.has(g.plateNumber.toUpperCase())
    );
    
    if (!match) setSelectedGroup(null);
    else setSelectedGroup(match);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || selectedGroup.owners.length === 0) return;

    if (activePlates.has(selectedGroup.plateNumber.toUpperCase())) {
      alert("This vehicle is already checked in.");
      return;
    }

    const primaryOwner = selectedGroup.owners[0];
    const isFull = currentOccupancy >= MAX_CAPACITY;
    
    // Strict Payload for Supabase
    const payload = {
      plate_number: selectedGroup.plateNumber.toUpperCase(),
      mobile_number: primaryOwner.mobileNumber,
      vehicle_model: selectedGroup.vehicleModel.toUpperCase(), // Currently holds wheel count
      attendant_name: user.userName,
    };

    try {
      if (isFull) {
        // Insert into street_queue if full
        const { error } = await supabase.from('street_queue').insert([payload]);
        if (error) throw error;
        alert(`Parking full! ${selectedGroup.plateNumber} added to Street Queue.`);
      } else {
        // Insert into parking_logs if space available
        const logPayload = {
          ...payload,
          vehicle_color: selectedGroup.vehicleColor.toUpperCase(),
          family_name: primaryOwner.familyName.toUpperCase(),
          first_name: primaryOwner.nickname.toUpperCase(),
          email: primaryOwner.email || null,
          check_in: new Date().toISOString()
        };
        const { error } = await supabase.from('parking_logs').insert([logPayload]);
        if (error) throw error;
      }
      onComplete();
    } catch (error) {
      console.error("Failed to add log/queue:", error);
      alert("Error saving check-in data.");
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
                * Currently parked vehicles are hidden from list
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

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Registered Contacts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedGroup.owners.map((owner, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <p className="font-black text-slate-900 dark:text-white text-sm uppercase">{owner.nickname} {owner.familyName}</p>
                      <p className="text-xs text-slate-500 font-medium">{maskPhone(owner.mobileNumber)}</p>
                    </div>
                  ))}
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
              {currentOccupancy >= MAX_CAPACITY ? 'Queue (Full)' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInView;
