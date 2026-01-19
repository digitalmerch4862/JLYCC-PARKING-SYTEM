import React, { useState } from 'react';
import { User, Vehicle } from '../types';
import { StorageService, maskPhone } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regData, setRegData] = useState<Vehicle>({
    plateNumber: '',
    vehicleModel: '4 WHEELS',
    vehicleColor: '',
    familyName: '',
    nickname: '',
    mobileNumber: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Conflict Handling
  const [conflictVehicle, setConflictVehicle] = useState<Vehicle | null>(null);
  const [regStep, setRegStep] = useState<'form' | 'verify_conflict' | 'update_mobile' | 'success'>('form');
  const [newMobile, setNewMobile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auth Rules:
    // 1. rad / 6244 -> Super Admin (Full Control)
    // 2. berna / neh220 -> Super Admin (Full Control)
    // 3. Any / neh220 -> Admin (Add/Edit only)
    
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isSuperRad = cleanUser === 'rad' && cleanPass === '6244';
    const isSuperBerna = cleanUser === 'berna' && cleanPass === 'neh220';

    if (isSuperRad || isSuperBerna) {
      onLogin({
        userName: username.trim(),
        roleName: 'Admin',
        isSuperAdmin: true
      });
    } else if (cleanPass === 'neh220') {
      onLogin({
        userName: username.trim() || 'Admin User',
        roleName: 'Admin',
        isSuperAdmin: false
      });
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleGuestLogin = () => {
    onLogin({
      userName: 'Guest',
      roleName: 'Guest'
    });
  };

  const handleRegisterInput = (field: keyof Vehicle, value: string) => {
    let finalValue = value;
    if (field === 'mobileNumber') {
        finalValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (field === 'plateNumber') {
        finalValue = value.replace(/\s+/g, '').toUpperCase();
    } else if (field !== 'email' && field !== 'vehicleModel') {
        finalValue = value.toUpperCase();
    }
    setRegData(prev => ({ ...prev, [field]: finalValue }));
  };

  const startRegistration = () => {
    setRegStep('form');
    setRegData({
        plateNumber: '',
        vehicleModel: '4 WHEELS',
        vehicleColor: '',
        familyName: '',
        nickname: '',
        mobileNumber: '',
        email: ''
    });
    setConflictVehicle(null);
    setShowRegModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic Validation
    if (!regData.plateNumber) { alert('Plate number is required'); return; }
    if (!/^09\d{9}$/.test(regData.mobileNumber)) { alert('Mobile number must be 09XXXXXXXXX'); return; }

    setIsSubmitting(true);
    try {
        // Check for duplicates
        const existing = await StorageService.findVehicleByPlate(regData.plateNumber);
        if (existing) {
            setConflictVehicle(existing);
            setRegStep('verify_conflict');
            setIsSubmitting(false);
            return;
        }

        // Save New
        await StorageService.saveVehicle(regData);
        setRegStep('success');
    } catch (err) {
        alert("Registration failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleConflictResolve = async (action: 'yes_valid' | 'no_update') => {
    if (!conflictVehicle) return;

    if (action === 'yes_valid') {
        // Number is valid, we assume vehicle is registered fine.
        alert("Your vehicle is already registered! You can proceed.");
        setShowRegModal(false);
    } else {
        setNewMobile('');
        setRegStep('update_mobile');
    }
  };

  const handleUpdateMobile = async () => {
    if (!conflictVehicle) return;
    if (!/^09\d{9}$/.test(newMobile)) {
        alert("Please enter a valid mobile number (09XXXXXXXXX).");
        return;
    }

    setIsSubmitting(true);
    try {
        const updated = { ...conflictVehicle, mobileNumber: newMobile };
        await StorageService.saveVehicle(updated);
        setRegStep('success');
    } catch (err) {
        alert("Update failed.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // SMS link for the developer
  const CONTACT_PHONE = "09694887065";
  const smsMessage = "hi im interested in jlycc conact me";
  const contactDevLink = `sms:${CONTACT_PHONE}?body=${encodeURIComponent(smsMessage)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1f29] px-4 font-inter transition-colors duration-500 relative">
      
      {/* Registration Modal */}
      {showRegModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                
                {regStep === 'form' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                        <div className="text-center space-y-2 mb-6">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Register Vehicle</h3>
                            <p className="text-slate-500 text-sm">Join the JLYCC Parking Registry.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
                                <input required type="text" placeholder="ABC1234" value={regData.plateNumber} onChange={e => handleRegisterInput('plateNumber', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-lg font-bold uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                    <select value={regData.vehicleModel} onChange={e => handleRegisterInput('vehicleModel', e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold uppercase">
                                        <option value="4 WHEELS">4 Wheels</option>
                                        <option value="3 WHEELS">3 Wheels</option>
                                        <option value="2 WHEELS">2 Wheels</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color</label>
                                    <input required type="text" placeholder="RED" value={regData.vehicleColor} onChange={e => handleRegisterInput('vehicleColor', e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold uppercase" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Name</label>
                                <input required type="text" placeholder="DELA CRUZ" value={regData.familyName} onChange={e => handleRegisterInput('familyName', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold uppercase" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nickname</label>
                                <input required type="text" placeholder="JUAN" value={regData.nickname} onChange={e => handleRegisterInput('nickname', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold uppercase" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <input required type="text" placeholder="09XXXXXXXXX" value={regData.mobileNumber} onChange={e => handleRegisterInput('mobileNumber', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold tracking-widest" />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Register'}
                            </button>
                        </div>
                    </form>
                )}

                {regStep === 'verify_conflict' && conflictVehicle && (
                    <div className="space-y-8 text-center">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl">⚠️</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Already Registered</h3>
                            <p className="text-slate-500">This vehicle plate exists in our records.</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase">Registered Mobile</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-widest">{maskPhone(conflictVehicle.mobileNumber)}</p>
                            <p className="text-sm font-medium text-slate-500 pt-2">Is this number still valid?</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleConflictResolve('no_update')} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl">No, Update It</button>
                            <button onClick={() => handleConflictResolve('yes_valid')} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl">Yes, It's Valid</button>
                        </div>
                    </div>
                )}

                {regStep === 'update_mobile' && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Update Contact</h3>
                            <p className="text-slate-500">Enter your new mobile number for privacy.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Mobile Number</label>
                            <input 
                                type="password" 
                                placeholder="09XXXXXXXXX"
                                value={newMobile}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                    setNewMobile(val);
                                }}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-xl font-bold tracking-widest text-center" 
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setRegStep('verify_conflict')} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl">Back</button>
                            <button onClick={handleUpdateMobile} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl">
                                {isSubmitting ? 'Updating...' : 'Save Update'}
                            </button>
                        </div>
                    </div>
                )}

                {regStep === 'success' && (
                    <div className="text-center space-y-8 py-8">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-5xl">✅</div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Success!</h3>
                            <p className="text-slate-500 text-lg">Your vehicle has been successfully registered.</p>
                        </div>
                        <button onClick={() => setShowRegModal(false)} className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl hover:bg-black transition-all uppercase">
                            Done
                        </button>
                    </div>
                )}
             </div>
          </div>
      )}

      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        <div className="mb-10 flex flex-col items-center">
          <div className="w-[100px] h-[100px] rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] mb-8">
            <img 
              src="https://lh3.googleusercontent.com/d/1fdOFajbIj--tmVyrydPhUUVh1gGaBg-s" 
              className="w-full h-full object-cover" 
              alt="JLYCC Logo" 
            />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">JLYCC</h1>
        </div>

        <div className="w-full bg-white dark:bg-[#252b36] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 transition-all duration-300">
          <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Username</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border border-slate-100 dark:border-white/5 rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-500 dark:text-[#6b7280] uppercase tracking-wider ml-1">Password</label>
                  <input
                    type="password"
                    required
                    className={`w-full px-6 py-5 bg-slate-50 dark:bg-[#2d3441] border rounded-[1.25rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] text-[16px] font-medium ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-100 dark:border-white/5'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-xs font-bold mt-1 ml-1 animate-pulse">Incorrect username or password</p>}
                </div>
                
                <button
                  type="submit"
                  className="w-full py-5 bg-[#2563eb] hover:bg-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] text-[17px]"
                >
                  Sign In
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-[1.25rem] transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-white active:scale-[0.98] text-[17px]"
                >
                  Continue as Guest
                </button>

                <button
                  type="button"
                  onClick={startRegistration}
                  className="w-full py-5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 font-black rounded-[1.25rem] transition-all border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:scale-[0.98] text-[17px]"
                >
                  Register My Vehicle
                </button>
              </form>
          </div>
        </div>

        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <a 
            href={contactDevLink} 
            className="text-[11px] font-black text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 uppercase tracking-[0.2em] transition-all underline decoration-1 underline-offset-4"
          >
            CONTACT DEV
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;