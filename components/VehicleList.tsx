
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { StorageService, maskPhone } from '../services/storage';

interface VehicleListProps {
  isAdmin: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ isAdmin }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    plateNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    familyName: '',
    firstName: '',
    middleName: '',
    mobileNumber: '',
    email: ''
  });

  const RELOCATION_MESSAGE = "Hello! This is the JLYCC AI Agent. When you have a moment, please come down to the parking lot to relocate your vehicle. Thank you!";

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getDatabase();
      setVehicles(data);
      
      // Detect duplicates
      const { duplicateSets } = StorageService.detectDuplicates(data);
      const allDupIds = duplicateSets.flat();
      setDuplicateIds(allDupIds);
      
    } catch (err) {
      console.error("Fetch failed:", err);
      showToast("Failed to load registry.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
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
      if (digits.startsWith('9')) {
        digits = '0' + digits;
      }
      finalValue = digits.slice(0, 11);
    } else if (field !== 'email') {
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
      setShowAddForm(false);
      resetForm();
      showToast(isEditMode ? "Record updated successfully." : "Vehicle registered successfully.", "success");
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(`Save failed: ${err.message || "Unknown Error"}`, "error");
    }
  };

  const handleCleanup = async () => {
    if (duplicateIds.length === 0) return;
    setIsCleaning(true);
    try {
      await StorageService.removeDuplicates(duplicateIds);
      showToast(`Successfully removed ${duplicateIds.length} duplicate records.`, 'success');
      await fetchVehicles();
    } catch (err) {
      console.error("Cleanup failed:", err);
      showToast("Duplicate cleanup failed.", 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete?.id) return;
    try {
      await StorageService.deleteVehicle(vehicleToDelete.id);
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
      showToast("Vehicle record deleted successfully.", "success");
    } catch (err) {
      showToast("Delete failed. Please try again.", "error");
    } finally {
      setVehicleToDelete(null);
    }
  };

  const resetForm = () => {
    setNewVehicle({
      plateNumber: '',
      vehicleModel: '',
      vehicleColor: '',
      familyName: '',
      firstName: '',
      middleName: '',
      mobileNumber: '',
      email: ''
    });
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

  return (
    <div className="space-y-6 pb-12 transition-colors duration-500">
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl font-black text-white animate-in slide-in-from-top-10 duration-300 flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      {vehicleToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight text-center">Delete Record?</h3>
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
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-tight">Managing cloud-based source of truth.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-1/2">
            {isAdmin && duplicateIds.length > 0 && (
              <button 
                onClick={handleCleanup}
                disabled={isCleaning}
                className="flex-1 flex items-center justify-center px-6 py-5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black rounded-[1.5rem] hover:bg-orange-600 hover:text-white transition-all border border-orange-100 dark:border-orange-900/50 text-lg shadow-sm"
              >
                {isCleaning ? 'Cleaning...' : `Cleanup ${duplicateIds.length} Duplicates`}
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="flex-1 flex items-center justify-center px-8 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 text-lg"
              >
                Register Vehicle
              </button>
            )}
          </div>
        </header>

        <div className="relative group">
          <svg className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Plate, Owner, or Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[720px] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl sm:text-4xl font-black mb-8 text-slate-900 dark:text-white tracking-tight">{isEditMode ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {['plateNumber', 'vehicleModel', 'vehicleColor', 'familyName', 'firstName', 'middleName', 'mobileNumber', 'email'].map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      required={field !== 'middleName' && field !== 'email'}
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={field === 'mobileNumber' ? '09XXXXXXXXX' : field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg font-bold uppercase"
                      value={(newVehicle as any)[field]}
                      onChange={e => handleInputChange(field as keyof Vehicle, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[1.25rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl active:scale-[0.98]">
                  {isEditMode ? 'Update' : 'Register'}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.25rem] font-black text-xl hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 italic">No registered vehicles found.</div>
        ) : (
          filteredVehicles.map(vehicle => (
            <div key={vehicle.id || `${vehicle.plateNumber}-${vehicle.mobileNumber}`} className="bg-white dark:bg-[#0d1117] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
              {isAdmin && (
                <div className="absolute top-5 right-5 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => startEdit(vehicle)} className="w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-blue-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-blue-600 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => setVehicleToDelete(vehicle)} className="w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-red-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-red-600 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
              <div className="p-8 space-y-6">
                <div className="px-5 py-2 bg-slate-900/90 dark:bg-slate-800/90 text-white font-black rounded-2xl text-sm tracking-widest shadow-lg border border-white/10 uppercase w-fit">{vehicle.plateNumber}</div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight line-clamp-2">{vehicle.vehicleModel}</h4>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em] mt-0.5">{vehicle.vehicleColor}</p>
                </div>
                <div className="flex items-center space-x-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-blue-600 flex items-center justify-center text-white text-sm font-black shrink-0">{vehicle.firstName.charAt(0)}{vehicle.familyName.charAt(0)}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{vehicle.firstName} {vehicle.familyName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">{maskPhone(vehicle.mobileNumber)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={`sms:${vehicle.mobileNumber}?body=${encodeURIComponent(RELOCATION_MESSAGE)}`} className="flex-1 flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/40 text-blue-600 dark:text-blue-400 rounded-[1.25rem] hover:bg-blue-600 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></a>
                  <a href={`tel:${vehicle.mobileNumber}`} className="flex-1 flex items-center justify-center py-4 bg-slate-50 dark:bg-emerald-800/20 text-emerald-600 dark:text-emerald-400 rounded-[1.25rem] hover:bg-emerald-600 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleList;
