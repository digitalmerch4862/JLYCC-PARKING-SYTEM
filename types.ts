
export type Role = 'Admin' | 'User';

export interface User {
  userName: string;
  password?: string;
  email: string;
  roleName: Role;
}

export interface Vehicle {
  plateNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePicture: string;
  familyName: string;
  firstName: string;
  middleName: string;
  mobileNumbers: string;
}

export interface LogEntry extends Vehicle {
  id: string;
  checkIn: string; // ISO String
  checkOut: string | null; // ISO String or null
  lastFollowUpSentAt?: string; // ISO String to track 24h notifications
  attendantName: string;
}

export type ViewState = 'Dashboard' | 'CheckIn' | 'VehicleList' | 'History';
