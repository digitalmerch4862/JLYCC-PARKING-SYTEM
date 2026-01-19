
export type Role = 'Admin' | 'Guest';

export interface User {
  userName: string;
  password?: string;
  email?: string;
  roleName: Role;
  isSuperAdmin?: boolean;
}

export interface Vehicle {
  id?: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  familyName: string;
  nickname: string;
  mobileNumber: string;
  email?: string;
}

export interface LogEntry extends Omit<Vehicle, 'id'> {
  id: string;
  checkIn: string; // ISO String
  checkOut: string | null; // ISO String or null
  attendantName: string;
}

export interface LeaderboardEntry {
  id?: string;
  userName: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export type ViewState = 'Parking' | 'CheckIn' | 'VehicleList' | 'History' | 'Training' | 'Contact' | 'Pastor' | 'Devotion' | 'Bible' | 'Sermons';
