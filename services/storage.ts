
import { User, Vehicle, LogEntry } from '../types';
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

// Mapper to convert Vehicle DB snake_case to Frontend camelCase
const mapVehicleFromDB = (record: any): Vehicle => ({
  id: record.id,
  plateNumber: record.plate_number,
  vehicleModel: record.vehicle_model,
  vehicleColor: record.vehicle_color,
  familyName: record.family_name,
  firstName: record.first_name,
  middleName: record.middle_name,
  mobileNumber: record.mobile_number,
  email: record.email
});

// Mapper to convert Vehicle Frontend camelCase to DB snake_case
const mapVehicleToDB = (v: Vehicle) => {
  const payload: any = {
    plate_number: v.plateNumber.toUpperCase().trim(),
    vehicle_model: v.vehicleModel.toUpperCase().trim(),
    vehicle_color: v.vehicleColor.toUpperCase().trim(),
    family_name: v.familyName.toUpperCase().trim(),
    first_name: v.firstName.toUpperCase().trim(),
    middle_name: v.middleName?.toUpperCase().trim() || null,
    mobile_number: v.mobileNumber.trim(),
    email: v.email?.toLowerCase().trim() || null
  };
  
  // Only include ID if it is a valid UUID string
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
  firstName: record.first_name,
  middleName: record.middle_name,
  mobileNumber: record.mobile_number,
  email: record.email,
  checkIn: record.check_in,
  checkOut: record.check_out,
  attendantName: record.attendant_name
});

const mapLogToDB = (l: Omit<LogEntry, 'id'>) => ({
  plate_number: l.plateNumber,
  vehicle_model: l.vehicleModel,
  vehicle_color: l.vehicleColor,
  family_name: l.familyName,
  first_name: l.firstName,
  middle_name: l.middleName || null,
  mobile_number: l.mobileNumber,
  email: l.email || null,
  check_in: l.checkIn,
  check_out: l.checkOut,
  attendant_name: l.attendantName
});

export const StorageService = {
  getUsers: (): User[] => {
    return [
      { userName: 'admin', roleName: 'Admin' },
      { userName: 'guest', roleName: 'Guest' }
    ];
  },

  getDatabase: async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('plate_number', { ascending: true });
    
    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
    return (data || []).map(mapVehicleFromDB);
  },

  getGroupedVehicles: async (): Promise<VehicleGroup[]> => {
    const all = await StorageService.getDatabase();
    const groups: Record<string, VehicleGroup> = {};

    all.forEach(v => {
      const plate = v.plateNumber.toUpperCase();
      if (!groups[plate]) {
        groups[plate] = {
          plateNumber: v.plateNumber,
          vehicleModel: v.vehicleModel,
          vehicleColor: v.vehicleColor,
          owners: []
        };
      }
      groups[plate].owners.push(v);
    });

    return Object.values(groups);
  },

  saveVehicle: async (vehicle: Vehicle) => {
    const payload = mapVehicleToDB(vehicle);
    
    // Explicitly use primary key for conflict resolution to ensure update works
    const { error } = await supabase
      .from('vehicles')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  deleteVehicle: async (id: string) => {
    if (!id) throw new Error("Missing ID for deletion");
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  getLogs: async (): Promise<LogEntry[]> => {
    const { data, error } = await supabase
      .from('parking_logs')
      .select('*')
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return (data || []).map(mapLogFromDB);
  },

  addLog: async (log: Omit<LogEntry, 'id'>) => {
    const payload = mapLogToDB(log);
    const { data, error } = await supabase
      .from('parking_logs')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return mapLogFromDB(data);
  },

  updateLog: async (log: LogEntry) => {
    const { error } = await supabase
      .from('parking_logs')
      .update({ check_out: log.checkOut })
      .eq('id', log.id);

    if (error) throw error;
  },

  clearLogs: async () => {
    const { error } = await supabase
      .from('parking_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) console.error('Error clearing logs:', error);
  },

  generateWeeklyCSV: async (): Promise<string> => {
    const logs = await StorageService.getLogs();
    const headers = ['Date', 'Plate', 'Model', 'Owner', 'In', 'Out', 'Attendant'];
    const rows = logs.map(l => [
      new Date(l.checkIn).toLocaleDateString(),
      l.plateNumber,
      l.vehicleModel,
      `${l.firstName} ${l.familyName}`,
      l.checkIn,
      l.checkOut || 'Active',
      l.attendantName
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  /**
   * Safe duplicate handling:
   * Groups vehicles by (Plate, Family Name, First Name, Mobile Number)
   * and identifies IDs that are redundant.
   */
  detectDuplicates: (vehicles: Vehicle[]): { uniqueCount: number, duplicateSets: string[][] } => {
    const groups = new Map<string, string[]>();
    
    vehicles.forEach(v => {
      if (!v.id) return;
      const key = `${v.plateNumber}-${v.familyName}-${v.firstName}-${v.mobileNumber}`.toUpperCase().trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(v.id);
    });

    const duplicateSets: string[][] = [];
    groups.forEach(ids => {
      if (ids.length > 1) {
        // Keep the first ID, remove the rest
        duplicateSets.push(ids.slice(1));
      }
    });

    return {
      uniqueCount: groups.size,
      duplicateSets
    };
  },

  removeDuplicates: async (idsToRemove: string[]) => {
    if (idsToRemove.length === 0) return;
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .in('id', idsToRemove);
    if (error) throw error;
  }
};
