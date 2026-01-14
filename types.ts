
export type Role = 'Admin' | 'Guest';

export interface User {
  userName: string;
  password?: string;
  email?: string;
  roleName: Role;
}

export interface Vehicle {
  id?: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  familyName: string;
  firstName: string;
  middleName: string;
  mobileNumber: string;
  email?: string;
}

export interface LogEntry extends Omit<Vehicle, 'id'> {
  id: string;
  checkIn: string; // ISO String
  checkOut: string | null; // ISO String or null
  attendantName: string;
}

export type ViewState = 'Dashboard' | 'CheckIn' | 'VehicleList' | 'History';
