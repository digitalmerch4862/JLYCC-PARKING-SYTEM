
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';
import { StorageService } from '../services/storage';

interface VehicleListProps {
  isAdmin: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ isAdmin }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    plateNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    vehiclePicture: '',
    familyName: '',
    firstName: '',
    middleName: '',
    mobileNumbers: ''
  });

  const RELOCATION_MESSAGE = "Hello! This is the JLYCC AI Agent. When you have a moment, please come down to the parking lot to relocate your vehicle. Thank you!";

  useEffect(() => {
    setVehicles(StorageService.getDatabase());
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMobileNumber = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits === '') return '';
    if (digits.length >= 2) {
      if (digits.startsWith('09')) return digits.slice(0, 11);
      if (digits.startsWith('9')) return '09' + digits.slice(1, 10);
      return '09' + digits.slice(0, 9);
    }
    return digits;
  };

  const handleInputChange = (field: keyof Vehicle, value: string) => {
    let finalValue = value;
    if (field === 'mobileNumbers') {
      finalValue = formatMobileNumber(value);
    } else if (field !== 'vehiclePicture') {
      finalValue = value.toUpperCase();
    }
    setNewVehicle(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle(prev => ({ ...prev, vehiclePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && StorageService.existsByPlate(newVehicle.plateNumber)) {
      const confirmOverwrite = window.confirm(`The plate number ${newVehicle.plateNumber} already exists. Do you want to overwrite the existing data?`);
      if (!confirmOverwrite) return;
    }

    const finalVehicle = {
      ...newVehicle,
      vehiclePicture: newVehicle.vehiclePicture || `https://picsum.photos/seed/${newVehicle.plateNumber}/400/300`
    };
    StorageService.saveVehicle(finalVehicle);
    setVehicles(StorageService.getDatabase());
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewVehicle({
      plateNumber: '',
      vehicleModel: '',
      vehicleColor: '',
      vehiclePicture: '',
      familyName: '',
      firstName: '',
      middleName: '',
      mobileNumbers: ''
    });
    setIsEditMode(false);
  };

  const startEdit = (vehicle: Vehicle) => {
    setNewVehicle(vehicle);
    setIsEditMode(true);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6 pb-12 transition-colors duration-500">
      {/* Frozen Portion */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] dark:bg-slate-950 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 pt-2 pb-6 space-y-6 shadow-[0_15px_15px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vehicle Database</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Registry of all authorized vehicles and owners.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 active:scale-95 text-lg"
            >
              Register New Vehicle
            </button>
          )}
        </header>

        <div className="relative">
          <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Plate, Owner, or Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[720px] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl sm:text-4xl font-black mb-8 text-slate-900 dark:text-white">{isEditMode ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Plate Number</label>
                  <input
                    required
                    disabled={isEditMode}
                    placeholder="PLATE NUMBER"
                    className={`w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold ${isEditMode ? 'bg-slate-50 dark:bg-slate-950 cursor-not-allowed opacity-60' : ''}`}
                    value={newVehicle.plateNumber}
                    onChange={e => handleInputChange('plateNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Vehicle Model</label>
                  <input
                    required
                    placeholder="VEHICLE MODEL"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold"
                    value={newVehicle.vehicleModel}
                    onChange={e => handleInputChange('vehicleModel', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Vehicle Color</label>
                  <input
                    required
                    placeholder="VEHICLE COLOR"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold"
                    value={newVehicle.vehicleColor}
                    onChange={e => handleInputChange('vehicleColor', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Family Name</label>
                  <input
                    required
                    placeholder="FAMILY NAME"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold"
                    value={newVehicle.familyName}
                    onChange={e => handleInputChange('familyName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">First Name</label>
                  <input
                    required
                    placeholder="FIRST NAME"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold"
                    value={newVehicle.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Middle Name</label>
                  <input
                    placeholder="MIDDLE NAME"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg uppercase font-bold"
                    value={newVehicle.middleName}
                    onChange={e => handleInputChange('middleName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Mobile Number</label>
                  <input
                    required
                    placeholder="09XXXXXXXXX"
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg font-bold"
                    value={newVehicle.mobileNumbers}
                    onChange={e => handleInputChange('mobileNumbers', e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Vehicle Picture</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-lg flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-sm">
                      {newVehicle.vehiclePicture ? 'Update Picture' : 'Upload Picture'}
                    </span>
                    {newVehicle.vehiclePicture && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img src={newVehicle.vehiclePicture} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex-1 order-1 py-5 bg-blue-600 text-white rounded-[1.25rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/40 active:scale-[0.98]"
                >
                  {isEditMode ? 'Update' : 'Register'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddForm(false); resetForm(); }} 
                  className="flex-1 order-2 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.25rem] font-black text-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.plateNumber} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
            {isAdmin && (
              <button 
                onClick={() => startEdit(vehicle)}
                className="absolute top-4 right-4 z-10 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-blue-600 dark:text-blue-400 rounded-2xl shadow-lg border border-white dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <div className="aspect-[4/3] relative">
              <img src={vehicle.vehiclePicture} className="w-full h-full object-cover" alt={vehicle.plateNumber} />
              <div className="absolute top-5 left-5">
                <span className="px-4 py-1.5 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm text-white font-black rounded-2xl text-sm tracking-wider shadow-lg border border-slate-700/50">{vehicle.plateNumber}</span>
              </div>
            </div>
            <div className="p-7 space-y-6">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xl leading-tight uppercase truncate">{vehicle.vehicleModel}</h4>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">{vehicle.vehicleColor}</p>
              </div>
              
              <div className="flex items-center space-x-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-black shadow-lg shrink-0">
                  {vehicle.firstName.charAt(0)}{vehicle.familyName.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-base font-black text-slate-900 dark:text-white truncate uppercase">{vehicle.firstName} {vehicle.familyName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">{vehicle.mobileNumbers}</p>
                </div>
              </div>

              {/* Enhanced Action Icons - Bigger for big finger purposes */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href={`sms:${vehicle.mobileNumbers}?body=${encodeURIComponent(RELOCATION_MESSAGE)}`}
                  className="flex-1 flex items-center justify-center py-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all active:scale-95 group/icon"
                  title="Message"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </a>
                <a 
                  href={`tel:${vehicle.mobileNumbers}`}
                  className="flex-1 flex items-center justify-center py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all active:scale-95 group/icon"
                  title="Call"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleList;
