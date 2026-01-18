
import { User, Vehicle, LogEntry, LeaderboardEntry } from '../types';
import { supabase } from './supabase';

export const MAX_CAPACITY = 25;

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 8) return phone;
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
};

export interface VehicleGroup {
  plateNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  owners: Vehicle[];
}

const mapVehicleFromDB = (record: any): Vehicle => ({
  id: record.id,
  plateNumber: record.plate_number,
  vehicleModel: record.vehicle_model,
  vehicleColor: record.vehicle_color,
  familyName: record.family_name,
  nickname: record.first_name,
  mobileNumber: record.mobile_number,
  email: record.email
});

const mapVehicleToDB = (v: Vehicle) => {
  const payload: any = {
    plate_number: v.plateNumber.toUpperCase().trim(),
    vehicle_model: v.vehicleModel.toUpperCase().trim(),
    vehicle_color: v.vehicleColor.toUpperCase().trim(),
    family_name: v.familyName.toUpperCase().trim(),
    first_name: v.nickname.toUpperCase().trim(),
    mobile_number: v.mobileNumber.trim(),
    email: v.email?.toLowerCase().trim() || null
  };
  
  if (v.id && v.id.length > 5) {
    payload.id = v.id;
  }
  
  return payload;
};

const mapLogFromDB = (record: any): LogEntry => ({
  id: record.id,
  plateNumber: record.plate_number,
  vehicleModel: record.vehicle_model,
  vehicleColor: record.vehicle_color,
  familyName: record.family_name,
  nickname: record.first_name,
  mobileNumber: record.mobile_number,
  email: record.email,
  checkIn: record.check_in,
  checkOut: record.check_out,
  attendantName: record.attendant_name,
  parkingLocation: record.parking_location
});

const mapLogToDB = (l: Omit<LogEntry, 'id'>) => ({
  plate_number: l.plateNumber,
  vehicle_model: l.vehicleModel,
  vehicle_color: l.vehicleColor,
  family_name: l.familyName,
  first_name: l.nickname,
  mobile_number: l.mobileNumber,
  email: l.email || null,
  check_in: l.checkIn,
  check_out: l.checkOut,
  attendant_name: l.attendantName,
  parking_location: l.parkingLocation
});

export const StorageService = {
  getUsers: (): User[] => [
    { userName: 'rad', roleName: 'Admin', isSuperAdmin: true },
    { userName: 'guest', roleName: 'Guest' }
  ],

  getDatabase: async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase.from('vehicles').select('*').order('plate_number', { ascending: true });
    return error ? [] : (data || []).map(mapVehicleFromDB);
  },

  getGroupedVehicles: async (): Promise<VehicleGroup[]> => {
    const all = await StorageService.getDatabase();
    const groups: Record<string, VehicleGroup> = {};
    all.forEach(v => {
      const plate = v.plateNumber.toUpperCase();
      if (!groups[plate]) {
        groups[plate] = { plateNumber: v.plateNumber, vehicleModel: v.vehicleModel, vehicleColor: v.vehicleColor, owners: [] };
      }
      groups[plate].owners.push(v);
    });
    return Object.values(groups);
  },

  saveVehicle: async (vehicle: Vehicle) => {
    const payload = mapVehicleToDB(vehicle);
    const { error } = await supabase.from('vehicles').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  deleteVehicle: async (id: string) => {
    if (!id) throw new Error("Missing ID for deletion");
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  },

  getLogs: async (): Promise<LogEntry[]> => {
    const { data, error } = await supabase.from('parking_logs').select('*').order('check_in', { ascending: false });
    return error ? [] : (data || []).map(mapLogFromDB);
  },

  addLog: async (log: Omit<LogEntry, 'id'>) => {
    const payload = mapLogToDB(log);
    const { data, error } = await supabase.from('parking_logs').insert([payload]).select().single();
    if (error) throw error;
    return mapLogFromDB(data);
  },

  updateLog: async (log: LogEntry) => {
    const { error } = await supabase.from('parking_logs').update({ check_out: log.checkOut }).eq('id', log.id);
    if (error) throw error;
  },

  clearLogs: async () => {
    const { error } = await supabase.from('parking_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('Error clearing logs:', error);
  },

  generateWeeklyCSV: async (): Promise<string> => {
    const logs = await StorageService.getLogs();
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyLogs = logs.filter(l => new Date(l.checkIn) >= lastWeek);
    
    const headers = [
      'Date', 'Plate Number', 'No. of Wheels', 'Vehicle Color', 'Nickname', 
      'Family Name', 'Mobile Number', 'Email', 'Attendant', 'Check In', 'Check Out', 'Location'
    ];
    
    const rows = weeklyLogs.map(log => [
      new Date(log.checkIn).toLocaleDateString(),
      log.plateNumber,
      log.vehicleModel,
      log.vehicleColor,
      log.nickname,
      log.familyName,
      log.mobileNumber,
      log.email || '--',
      log.attendantName || '--',
      new Date(log.checkIn).toLocaleTimeString(),
      log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'Parked',
      log.parkingLocation || '--'
    ]);

    return [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');
  },

  detectDuplicates: (vehicles: Vehicle[]): { uniqueCount: number, duplicateSets: string[][] } => {
    const groups = new Map<string, string[]>();
    vehicles.forEach(v => {
      if (!v.id) return;
      const key = `${v.plateNumber}-${v.familyName}-${v.nickname}-${v.mobileNumber}`.toUpperCase().trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(v.id);
    });
    const duplicateSets: string[][] = [];
    groups.forEach(ids => { if (ids.length > 1) duplicateSets.push(ids.slice(1)); });
    return { uniqueCount: groups.size, duplicateSets };
  },

  removeDuplicates: async (idsToRemove: string[]) => {
    if (idsToRemove.length === 0) return;
    const { error } = await supabase.from('vehicles').delete().in('id', idsToRemove);
    if (error) throw error;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('quiz_leaderboard')
      .select('*')
      .order('percentage', { ascending: false })
      .order('date', { ascending: false })
      .limit(20);
    
    if (error) {
      // Fallback for demo if table doesn't exist
      const local = localStorage.getItem('jlycc_leaderboard');
      return local ? JSON.parse(local) : [];
    }
    return data || [];
  },

  saveQuizResult: async (entry: Omit<LeaderboardEntry, 'id'>) => {
    const { error } = await supabase.from('quiz_leaderboard').insert([entry]);
    if (error) {
      // Fallback to local storage if table doesn't exist
      const local = localStorage.getItem('jlycc_leaderboard');
      const leaderboard = local ? JSON.parse(local) : [];
      leaderboard.push({ ...entry, id: Date.now().toString() });
      leaderboard.sort((a: any, b: any) => b.percentage - a.percentage);
      localStorage.setItem('jlycc_leaderboard', JSON.stringify(leaderboard.slice(0, 20)));
    }
  }
};