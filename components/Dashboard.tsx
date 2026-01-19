import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, User, Vehicle } from '../types';
import { MAX_CAPACITY, maskPhone } from '../services/storage';
import { supabase } from '../services/supabase';
import { OfflineService, QueueItem } from '../services/offline';
import { useClientOnly, safeDateFormat, safeDateDay } from '../utils/safety';
import TrainingView from './TrainingView';

// --- Global Type Definition for Speech Recognition ---
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface DashboardProps {
  user: User;
  onAction: () => void;
}

interface QueueCandidate {
  id: string;
  plate_number: string;
  mobile_number: string;
  vehicle_model: string;
  entry_time: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onAction }) => {
  const isMounted = useClientOnly();
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);
  const [streetQueueCount, setStreetQueueCount] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestPlate, setGuestPlate] = useState('');
  const [errorNote, setErrorNote] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Queue Management State
  const [queueCandidate, setQueueCandidate] = useState<QueueCandidate | null>(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [resolvingQueue, setResolvingQueue] = useState(false);

  // Voice Input State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceStep, setVoiceStep] = useState<'listening' | 'processing' | 'verify' | 'action'>('listening');
  const [recognizedText, setRecognizedText] = useState('');
  const [suggestedAction, setSuggestedAction] = useState<'in' | 'out' | null>(null);
  
  // Refs
  const recognitionRef = useRef<any>(null);

  const isAdmin = user.roleName === 'Admin';
  const isSuper = user.isSuperAdmin === true;
  const MAP_URL = "https://maps.app.goo.gl/NXSLHHjoF3P3ByF89";
  const ADMIN_PHONE = "09694887065";

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const { data: logsData } = await supabase
        .from('parking_logs')
        .select('*')
        .is('check_out', null)
        .order('check_in', { ascending: false });

      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*');

      const { count: queueCount } = await supabase
        .from('street_queue')
        .select('*', { count: 'exact', head: true });

      const offlineQueue = OfflineService.getQueue();
      
      let mergedLogs = (logsData || []).map((record: any) => ({
        id: record.id,
        plateNumber: record.plate_number,
        vehicleModel: record.vehicle_model,
        vehicleColor: record.vehicle_color,
        familyName: record.family_name,
        nickname: record.first_name,
        mobileNumber: record.mobile_number,
        email: record.email,
        checkIn: record.check_in,
        checkOut: null,
        attendantName: record.attendant_name
      }));

      const offlineCheckIns = offlineQueue
        .filter(q => q.type === 'CHECK_IN')
        .map(q => ({
          id: q.payload.tempId || 'temp-id',
          plateNumber: q.payload.plate_number,
          vehicleModel: q.payload.vehicle_model,
          vehicleColor: q.payload.vehicle_color,
          familyName: q.payload.family_name,
          nickname: q.payload.first_name,
          mobileNumber: q.payload.mobile_number,
          email: q.payload.email,
          checkIn: q.payload.check_in,
          checkOut: null,
          attendantName: q.payload.attendant_name
        }));

      const offlineCheckOutIds = new Set(
        offlineQueue
        .filter(q => q.type === 'CHECK_OUT')
        .map(q => q.payload.id)
      );

      const finalLogs = [...mergedLogs, ...offlineCheckIns].filter(
        log => !offlineCheckOutIds.has(log.id)
      );

      const mappedVehicles = (vehiclesData || []).map((record: any) => ({
        id: record.id,
        plateNumber: record.plate_number,
        vehicleModel: record.vehicle_model,
        vehicleColor: record.vehicle_color,
        familyName: record.family_name,
        nickname: record.first_name,
        mobileNumber: record.mobile_number,
        email: record.email
      }));

      const offlineQueueAdds = offlineQueue.filter(q => q.type === 'QUEUE_ADD').length;
      const offlineQueueRemoves = offlineQueue.filter(q => q.type === 'QUEUE_REMOVE').length;
      const finalQueueCount = Math.max(0, (queueCount || 0) + offlineQueueAdds - offlineQueueRemoves);

      setActiveLogs(finalLogs);
      setVehicles(mappedVehicles);
      setStreetQueueCount(finalQueueCount);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
      setIsOnline(navigator.onLine);
    };

    if (isMounted) init();

    const handleOnline = () => {
      setIsOnline(true);
      OfflineService.processQueue().then(() => fetchData());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        OfflineService.processQueue().then(() => fetchData());
      }
    }, 10000);

    const logsSub = supabase
      .channel('dashboard_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_logs' }, () => fetchData())
      .subscribe();

    const queueSub = supabase
      .channel('dashboard_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'street_queue' }, () => fetchData())
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
      supabase.removeChannel(logsSub);
      supabase.removeChannel(queueSub);
    };
  }, [isMounted]);

  // --- Voice Logic ---

  const smartFormatPlate = (text: string) => {
    // 1. Convert common phonetic numbers to digits
    const replacements: { [key: string]: string } = {
      'ZERO': '0', 'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4',
      'FIVE': '5', 'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9'
    };
    
    let upperText = text.toUpperCase();
    
    Object.keys(replacements).forEach(word => {
      // Replace whole words only
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      upperText = upperText.replace(regex, replacements[word]);
    });

    // 2. Remove spaces and non-alphanumeric characters
    return upperText.replace(/[^A-Z0-9]/g, '');
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    setIsVoiceOpen(true);
    setVoiceStep('listening');
    setRecognizedText('');
    setSuggestedAction(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const formatted = smartFormatPlate(transcript);
      setRecognizedText(formatted);
      processFoundPlate(formatted);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice error', event.error);
      if (event.error === 'no-speech') {
        alert("No speech detected. Please try again.");
        closeVoice();
      }
    };

    recognition.onend = () => {
      // If we didn't get a result, close or stay open based on logic, but usually we just stop loading UI
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const closeVoice = () => {
    stopListening();
    setIsVoiceOpen(false);
  };

  const processFoundPlate = (plate: string) => {
    // Basic validation
    if (!plate || plate.length < 2) {
      setVoiceStep('verify'); // Too short, force manual
      return;
    }

    // Check Logic
    const isActive = activeLogs.some(log => log.plateNumber === plate);
    const isRegistered = vehicles.some(v => v.plateNumber === plate);

    if (isActive) {
      setSuggestedAction('out');
      setVoiceStep('action');
    } else if (isRegistered) {
      setSuggestedAction('in');
      setVoiceStep('action');
    } else {
      // Unknown -> Verify manually
      setVoiceStep('verify');
    }
  };

  const handleVoiceAction = async (type: 'in' | 'out') => {
    const plate = recognizedText;
    
    if (type === 'out') {
      const log = activeLogs.find(l => l.plateNumber === plate);
      if (log) {
        await handleCheckOut(log.id);
        closeVoice();
      } else {
        alert(`Vehicle ${plate} not found in active logs.`);
      }
    } else {
      // Check In
      if (activeLogs.some(l => l.plateNumber === plate)) {
        alert(`Vehicle ${plate} is already checked in.`);
        return;
      }

      const registeredVehicle = vehicles.find(v => v.plateNumber === plate);
      
      if (!registeredVehicle) {
        alert(`Vehicle ${plate} not found in registry. Use Manual Check-In.`);
        setVoiceStep('verify');
        return;
      }

      const isFull = (activeLogs.length + (availableSlots > 0 ? 0 : streetQueueCount)) >= MAX_CAPACITY;
      const basePayload = {
        plate_number: registeredVehicle.plateNumber,
        mobile_number: registeredVehicle.mobileNumber,
        vehicle_model: registeredVehicle.vehicleModel,
        attendant_name: user.userName,
      };

      try {
        if (isFull) {
          await OfflineService.addToStreetQueue(basePayload);
          alert(`Parking full! ${plate} queued.`);
        } else {
           const logPayload = {
            ...basePayload,
            tempId: OfflineService.generateTempId(),
            vehicle_color: registeredVehicle.vehicleColor,
            family_name: registeredVehicle.familyName,
            first_name: registeredVehicle.nickname,
            email: registeredVehicle.email || null,
            check_in: new Date().toISOString()
          };
          await OfflineService.checkIn(logPayload);
        }
        closeVoice();
      } catch (err) {
        alert("Error saving check-in.");
      }
    }
  };

  // --- Standard Check Out/Queue Logic ---
  const handleCheckOut = async (logId: string) => {
    setActiveLogs(prev => prev.filter(log => log.id !== logId));
    try {
      await OfflineService.checkOut(logId);
      if (navigator.onLine) await checkForQueue();
    } catch (err) { console.error("Checkout error", err); }
  };

  const checkForQueue = async () => {
    const { data } = await supabase.from('street_queue').select('*').order('entry_time', { ascending: true }).limit(1);
    if (data && data.length > 0) {
      setQueueCandidate(data[0]);
      setIsQueueModalOpen(true);
    }
  };

  const handleQueueDecision = async (action: 'accept' | 'reject') => {
    if (!queueCandidate) return;
    setResolvingQueue(true);
    try {
      if (action === 'accept') {
        const ownerDetails = vehicles.find(v => v.plateNumber === queueCandidate.plate_number) || {
          vehicleColor: 'UNKNOWN', familyName: 'GUEST', nickname: 'GUEST', email: null
        };
        const logPayload = {
          plate_number: queueCandidate.plate_number,
          mobile_number: queueCandidate.mobile_number,
          vehicle_model: queueCandidate.vehicle_model,
          vehicle_color: ownerDetails.vehicleColor || 'UNKNOWN',
          family_name: ownerDetails.familyName || 'GUEST',
          first_name: ownerDetails.nickname || 'GUEST',
          email: ownerDetails.email || null,
          attendant_name: user.userName,
          check_in: new Date().toISOString()
        };
        const newLog: LogEntry = {
            id: 'temp-q-' + Date.now(),
            plateNumber: logPayload.plate_number,
            mobileNumber: logPayload.mobile_number,
            vehicleModel: logPayload.vehicle_model,
            vehicleColor: logPayload.vehicle_color,
            familyName: logPayload.family_name,
            nickname: logPayload.first_name,
            email: logPayload.email || undefined,
            attendantName: logPayload.attendant_name,
            checkIn: logPayload.check_in,
            checkOut: null
        };
        setActiveLogs(prev => [newLog, ...prev]);
        setStreetQueueCount(prev => Math.max(0, prev - 1));
        await OfflineService.checkIn(logPayload);
        await OfflineService.removeFromStreetQueue(queueCandidate.id);
        setIsQueueModalOpen(false);
        setQueueCandidate(null);
      } else {
        await OfflineService.removeFromStreetQueue(queueCandidate.id);
        if (navigator.onLine) await checkForQueue();
        else setIsQueueModalOpen(false);
      }
    } catch (err) { alert("Queue error"); } finally { setResolvingQueue(false); }
  };

  const getOwnersForPlate = (plate: string) => vehicles.filter(v => v.plateNumber.toUpperCase() === plate.toUpperCase());

  const verifyAndContact = (type: 'call' | 'sms') => {
    if (typeof window === 'undefined') return;
    const isCheckedIn = activeLogs.some(log => log.plateNumber.toUpperCase() === guestPlate.toUpperCase().trim());
    if (!isCheckedIn || guestPlate.trim() === '') {
      setErrorNote(true);
      setTimeout(() => setErrorNote(false), 5000);
      return;
    }
    window.location.href = type === 'call' ? `tel:${ADMIN_PHONE}` : `sms:${ADMIN_PHONE}`;
  };

  if (!isMounted) return null;

  const activeCount = activeLogs.length; 
  const availableSlots = Math.max(0, MAX_CAPACITY - activeCount);
  const displayQueueCount = availableSlots > 0 ? 0 : streetQueueCount;
  const totalOccupancy = activeCount + displayQueueCount;
  const wheels4 = activeLogs.filter(l => l.vehicleModel === '4 WHEELS').length;
  const wheels3 = activeLogs.filter(l => l.vehicleModel === '3 WHEELS').length;
  const wheels2 = activeLogs.filter(l => l.vehicleModel === '2 WHEELS').length;

  const getOccupancyColorClasses = () => {
    if (availableSlots === 0) return 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-900/50 dark:text-red-400';
    if (availableSlots <= 5) return 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-900/50 dark:text-amber-400';
    return 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-900/50 dark:text-emerald-400';
  };

  const getQueueMessageLink = () => {
    if (!queueCandidate) return '#';
    const owner = vehicles.find(v => v.plateNumber === queueCandidate.plate_number);
    const nickname = owner ? owner.nickname : 'Guest';
    const message = `Hi ${nickname}, this is Berna (Property Manager, JLYCC). Vacant parking slot available for ${queueCandidate.plate_number}. Reply YES to claim.`;
    return `sms:${queueCandidate.mobile_number}?body=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 relative">
      
      {errorNote && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border-4 border-blue-600 animate-in slide-in-from-top-10 duration-300">
          <div className="flex items-start gap-4">
             <div className="bg-blue-600 p-2 rounded-xl shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
             <div><p className="font-black uppercase text-xs tracking-widest text-blue-400 mb-1">Access Denied</p><p className="text-sm font-bold leading-relaxed">Note: This function is designated for checked-in vehicles only.</p></div>
          </div>
        </div>
      )}

      {/* --- Voice Input Modal --- */}
      {isVoiceOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
           {/* Close Button */}
           <button onClick={closeVoice} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 z-50">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>

           <div className="w-full max-w-md flex flex-col items-center">
              
              {voiceStep === 'listening' && (
                <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
                   <h3 className="text-white text-2xl font-black tracking-tight">Listening...</h3>
                   <div className="relative">
                      {/* Pulsing Rings */}
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-[ping_1.5s_ease-in-out_infinite]"></span>
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-10 animate-[ping_2s_ease-in-out_infinite] delay-150"></span>
                      
                      {/* Main Mic Icon */}
                      <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                         <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                           <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                         </svg>
                      </div>
                   </div>
                   <p className="text-slate-400 text-sm font-medium">Say the license plate (e.g. "Alpha Bravo One Two Three")</p>
                </div>
              )}

              {(voiceStep === 'verify' || voiceStep === 'action') && (
                 <div className="w-full bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-bottom-10 duration-300">
                    <div className="text-center space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate Detected</label>
                       <input 
                         type="text" 
                         value={recognizedText}
                         onChange={(e) => {
                             const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                             setRecognizedText(val);
                             // If user manually changes text, re-eval logic roughly or just let them confirm manual entry
                             if(val.length > 2) setSuggestedAction(null); // Reset suggestion on manual edit
                         }}
                         className="w-full bg-transparent text-5xl font-black text-white text-center outline-none border-b-2 border-slate-700 focus:border-blue-500 py-4 uppercase tracking-wider"
                         autoFocus
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                       {voiceStep === 'verify' ? (
                         <>
                           <button onClick={startListening} className="py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-slate-700">Retry</button>
                           <button onClick={onAction} className="py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200">Manual Form</button>
                         </>
                       ) : (
                          <>
                             {suggestedAction === 'in' ? (
                               <button 
                                 onClick={() => handleVoiceAction('in')}
                                 className="col-span-2 py-5 bg-blue-600 text-white text-xl font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-900/40 uppercase tracking-wide"
                               >
                                 Confirm Check In
                               </button>
                             ) : (
                               <button 
                                 onClick={() => handleVoiceAction('out')}
                                 className="col-span-2 py-5 bg-emerald-600 text-white text-xl font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-900/40 uppercase tracking-wide"
                               >
                                 Confirm Check Out
                               </button>
                             )}
                          </>
                       )}
                    </div>
                    
                    {/* Fallback actions if auto-detect was wrong or user edited */}
                    {!suggestedAction && (
                       <div className="grid grid-cols-2 gap-4 mt-2">
                          <button onClick={() => handleVoiceAction('in')} className="py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-blue-600">Force In</button>
                          <button onClick={() => handleVoiceAction('out')} className="py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-emerald-600">Force Out</button>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Queue Resolution Modal */}
      {isQueueModalOpen && queueCandidate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="text-center space-y-2 mb-8 mt-2">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest mb-2 shadow-sm">Next in Line</div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Slot Available!</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Notify the next driver in the queue.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle Plate</p>
                       <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{queueCandidate.plate_number}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Queued</p>
                       <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{new Date(queueCandidate.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <a href={getQueueMessageLink()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl font-black text-sm uppercase hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> SMS Invite
                    </a>
                    <a href={`tel:${queueCandidate.mobile_number}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> Call
                    </a>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => handleQueueDecision('reject')} disabled={resolvingQueue} className="py-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all uppercase text-sm">Reject / Next</button>
                 <button onClick={() => handleQueueDecision('accept')} disabled={resolvingQueue} className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase text-sm">Claim Spot</button>
              </div>
              <button onClick={() => setIsQueueModalOpen(false)} className="w-full mt-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300">Close & Ignore</button>
           </div>
        </div>
      )}

      {/* Main Dashboard UI */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
               {isAdmin ? 'System Overview' : 'Parking Availability'}
             </h2>
             <div className="relative flex items-center justify-center w-5 h-5">
               <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isOnline ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
               <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isSuper ? 'Master Console: Complete system authority.' : isAdmin ? 'Staff Dashboard: Manage arrivals and records.' : 'Real-time parking status for JLYCC.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 w-full sm:w-auto">
             {/* Voice Input Button (Replaces Scanner) */}
             <button 
                onClick={startListening}
                className="flex items-center justify-center px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-[1.25rem] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20 group"
                title="Voice Input"
             >
                <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
             </button>
             
             <button 
                onClick={onAction}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black rounded-[1.25rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 active:scale-95"
             >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Check-In
             </button>
          </div>
        )}
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="space-y-6 w-full max-w-[200px]">
            <p className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Covered Parking</p>
            <div className={`w-full py-10 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-sm ${getOccupancyColorClasses()}`}>
              <span className="text-8xl font-black leading-none tracking-tighter">{availableSlots}</span>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="contents lg:flex lg:flex-col lg:gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 space-y-6">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Parking Assistance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Contact admin for help or inquiries.</p>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Plate Number</label>
                  <input 
                    type="text" 
                    value={guestPlate} 
                    onChange={(e) => setGuestPlate(e.target.value.replace(/,/g, '').toUpperCase())}
                    placeholder="Ex: ABC123"
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase"
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => verifyAndContact('sms')} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20">Message</button>
                  <button onClick={() => verifyAndContact('call')} className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98] text-xs uppercase tracking-wider">Call</button>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Visit JLYCC Main</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Find your way to our main facility.</p>
              </div>
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all active:scale-[0.98] text-sm tracking-wide uppercase shadow-lg shadow-blue-500/10">Open Map</a>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-6 flex-1">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">On-Street parking queue</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{displayQueueCount}</p>
              </div>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 flex flex-col text-left flex-1 relative overflow-hidden group min-h-[360px]">
               <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-blue-100 text-xs font-black uppercase tracking-widest">Live Occupancy</p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-auto">
                     <p className="text-white text-7xl font-black tracking-tighter">{totalOccupancy}</p>
                     <p className="text-blue-200 text-xl font-bold">Total Vehicles</p>
                  </div>
                  <div className="space-y-3 mt-8 w-full">
                     <div className="flex justify-between items-center h-20 px-8 bg-white/20 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-lg shadow-blue-900/10">
                        <span className="text-blue-50 text-sm font-black uppercase tracking-widest">Covered</span>
                        <span className="text-white text-3xl font-black">{activeCount}</span>
                     </div>
                     <div className="flex justify-between items-center h-20 px-8 bg-white/20 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-lg shadow-blue-900/10">
                        <span className="text-blue-50 text-sm font-black uppercase tracking-widest">On-Street</span>
                        <span className="text-white text-3xl font-black">{displayQueueCount}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="w-full grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">4 Wheels</p><p className="text-2xl font-black text-slate-900 dark:text-white">{wheels4}</p></div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z M7 10V7a3 3 0 013-3h4a3 3 0 013 3v3 M7 16a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">3 Wheels</p><p className="text-2xl font-black text-slate-900 dark:text-white">{wheels3}</p></div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h12l2-4H6l-2 4zm0 0v6a2 2 0 002 2h8a2 2 0 002-2v-6M6 18a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" /></svg></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">2 Wheels</p><p className="text-2xl font-black text-slate-900 dark:text-white">{wheels2}</p></div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 18a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8zm-9-4h2a2 2 0 012 2v2m4-2h-2m-4-6h6l2 4h-8z" /></svg></div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Active Vehicle Sessions</h3>
            <span className="flex items-center space-x-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr><th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plate Group</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Registered Contacts</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entry Time</th><th className="px-6 sm:px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {activeLogs.length === 0 ? (<tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 italic">No vehicles currently active.</td></tr>) : (
                  activeLogs.map((log) => {
                    const owners = getOwnersForPlate(log.plateNumber);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 sm:px-8 py-5"><div><p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">{log.plateNumber}</p><p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{log.vehicleModel} • {log.vehicleColor}</p></div></td>
                        <td className="px-6 py-5 hidden sm:table-cell"><div className="flex flex-wrap gap-1">{owners.length > 0 ? owners.map((owner, idx) => (<span key={idx} className="inline-flex flex-col px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{owner.nickname} {owner.familyName}</span><span className="text-[8px] text-slate-500 font-bold">{maskPhone(owner.mobileNumber)}</span></span>)) : (<span className="text-[10px] text-slate-400 italic">Guest / Unknown</span>)}</div></td>
                        <td className="px-6 py-5"><p className="text-sm text-slate-900 dark:text-300 font-black">{safeDateFormat(log.checkIn)}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{safeDateDay(log.checkIn)}</p></td>
                        <td className="px-6 sm:px-8 py-5 text-right"><button onClick={() => handleCheckOut(log.id)} className="px-5 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Check Out</button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
           <TrainingView />
        </div>
      )}
    </div>
  );
};

export default Dashboard;