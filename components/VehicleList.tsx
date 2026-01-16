
import React, { useState, useEffect } from 'react';
import { Vehicle, User } from '../types';
import { StorageService, maskPhone } from '../services/storage';
import { supabase } from '../services/supabase';

interface VehicleListProps {
  isAdmin: boolean;
  user: User;
}

const VehicleList: React.FC<VehicleListProps> = ({ isAdmin, user }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const isSuper = user.isSuperAdmin === true;

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    plateNumber: '',
    vehicleModel: '4 WHEELS',
    vehicleColor: '',
    familyName: '',
    nickname: '',
    mobileNumber: '',
    email: ''
  });

  const RELOCATION_MESSAGE = "Hello! This is the JLYCC AI Agent. When you have a moment, please come down to the parking lot to relocate your vehicle. Thank you!";

  const fetchVehicles = async () => {
    try {
      const data = await StorageService.getDatabase();
      setVehicles(data);
      const { duplicateSets } = StorageService.detectDuplicates(data);
      setDuplicateIds(duplicateSets.flat());
    } catch (err) {
      showToast("Failed to load registry.", "error");
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchVehicles();
      setLoading(false);
    };

    initialFetch();

    // Set up Realtime Subscription for vehicles table
    const subscription = supabase
      .channel('vehicles_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Realtime change detected in vehicles:', payload);
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Vehicle, value: string) => {
    let finalValue = value;
    if (field === 'mobileNumber') {
      let digits = value.replace(/\D/g, '');
      if (digits.startsWith('9')) digits = '0' + digits;
      finalValue = digits.slice(0, 11);
    } else if (field !== 'email' && field !== 'vehicleModel') {
      finalValue = value.toUpperCase();
    }
    setNewVehicle(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(newVehicle.mobileNumber)) {
      showToast("Mobile number must start with 09 and be 11 digits long.", "error");
      return;
    }

    try {
      await StorageService.saveVehicle(newVehicle);
      await fetchVehicles();
      showToast(isEditMode ? "Record updated successfully." : "Vehicle registered successfully.", "success");
      setShowAddForm(false);
      resetForm();
    } catch (err: any) {
      showToast(`Save failed: ${err.message || "Unknown Error"}`, "error");
    }
  };

  const handleCleanup = async () => {
    if (!isSuper || duplicateIds.length === 0) return;
    setIsCleaning(true);
    try {
      await StorageService.removeDuplicates(duplicateIds);
      showToast(`Successfully removed ${duplicateIds.length} duplicate records.`, 'success');
      await fetchVehicles();
    } catch (err) {
      showToast("Duplicate cleanup failed.", 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const confirmDelete = async () => {
    if (!isSuper || !vehicleToDelete?.id) return;
    try {
      await StorageService.deleteVehicle(vehicleToDelete.id);
      showToast("Vehicle record deleted successfully.", "success");
    } catch (err) {
      showToast("Delete failed. Please try again.", "error");
    } finally {
      setVehicleToDelete(null);
    }
  };

  const resetForm = () => {
    setNewVehicle({ plateNumber: '', vehicleModel: '4 WHEELS', vehicleColor: '', familyName: '', nickname: '', mobileNumber: '', email: '' });
    setIsEditMode(false);
  };

  const startEdit = (vehicle: Vehicle) => {
    setNewVehicle({ ...vehicle });
    setIsEditMode(true);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fields: (keyof Vehicle)[] = ['plateNumber', 'vehicleModel', 'vehicleColor', 'familyName', 'nickname', 'mobileNumber', 'email'];

  return (
    <div className="space-y-6 pb-12 transition-colors duration-500">
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl font-black text-white animate-in slide-in-from-top-10 duration-300 flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      {vehicleToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 text-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Delete Record?</h3>
            <div className="flex gap-4">
              <button onClick={() => setVehicleToDelete(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-[#f8fafc] dark:bg-slate-950 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 pt-2 pb-6 space-y-6 shadow-[0_15px_15px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="shrink-0">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vehicle Registry</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-tight">Source of Truth • {isSuper ? 'Super Admin Mode' : 'Standard Admin Mode'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-1/2">
            {isSuper && duplicateIds.length > 0 && (
              <button onClick={handleCleanup} disabled={isCleaning} className="flex-1 flex items-center justify-center px-6 py-5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black rounded-[1.5rem] hover:bg-orange-600 hover:text-white transition-all border border-orange-100 dark:border-orange-900/50 text-lg shadow-sm">
                {isCleaning ? 'Cleaning...' : `Cleanup ${duplicateIds.length} Duplicates`}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { resetForm(); setShowAddForm(true); }} className="flex-1 flex items-center justify-center px-8 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 text-lg">
                Register Vehicle
              </button>
            )}
          </div>
        </header>
        <div className="relative group">
          <svg className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search by Plate, Owner, or Wheels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700" />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[720px] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl sm:text-4xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">{isEditMode ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {fields.map((field) => {
                  let label = field.replace(/([A-Z])/g, ' $1');
                  if (field === 'vehicleModel') label = 'No. of Wheels';
                  if (field === 'nickname') label = 'Nickname';

                  return (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">{label}</label>
                      {field === 'vehicleModel' ? (
                        <select
                          className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none text-lg font-bold uppercase cursor-pointer"
                          value={newVehicle.vehicleModel}
                          onChange={e => handleInputChange('vehicleModel', e.target.value)}
                        >
                          <option value="4 WHEELS">4 WHEELS</option>
                          <option value="3 WHEELS">3 WHEELS</option>
                          <option value="2 WHEELS">2 WHEELS</option>
                        </select>
                      ) : (
                        <input 
                          required={field !== 'email'} 
                          type={field === 'email' ? 'email' : 'text'} 
                          placeholder={field === 'mobileNumber' ? '09XXXXXXXXX' : label.toUpperCase()} 
                          className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg font-bold uppercase" 
                          value={(newVehicle as any)[field]} 
                          onChange={e => handleInputChange(field as keyof Vehicle, e.target.value)} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-black text-xl transition-all shadow-xl active:scale-[0.98]">
                  {isEditMode ? 'Update' : 'Register'}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.25rem] font-black text-xl hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredVehicles.length === 0 ? (<div className="py-20 text-center text-slate-400 dark:text-slate-600 italic">No registered vehicles found.</div>) : (
          filteredVehicles.map(vehicle => (
            <div key={vehicle.id || `${vehicle.plateNumber}-${vehicle.mobileNumber}`} className="bg-white dark:bg-[#0d1117] p-4 sm:p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 group hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="shrink-0"><div className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-xl text-xs sm:text-sm tracking-widest uppercase border border-white/5 shadow-sm">{vehicle.plateNumber}</div></div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3"><h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base uppercase truncate leading-none">{vehicle.vehicleModel}</h4><span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-black uppercase">{vehicle.vehicleColor}</span></div>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide mt-1.5 truncate">{vehicle.nickname} {vehicle.familyName} • {maskPhone(vehicle.mobileNumber)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <a href={`sms:${vehicle.mobileNumber}?body=${encodeURIComponent(RELOCATION_MESSAGE)}`} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></a>
                <a href={`tel:${vehicle.mobileNumber}`} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>
                {isAdmin && (
                  <div className="flex items-center gap-0.5 ml-2 border-l border-slate-100 dark:border-slate-800 pl-2">
                    <button onClick={() => startEdit(vehicle)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    {isSuper && <button onClick={() => setVehicleToDelete(vehicle)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleList;
