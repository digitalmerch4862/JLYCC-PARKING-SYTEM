
import { User, Vehicle, LogEntry } from '../types';

const STORAGE_KEYS = {
  USERS: 'jlycc_users',
  DATABASE: 'jlycc_database',
  LOGS: 'jlycc_logs',
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  { userName: 'jly', password: 'nehemiah220', email: 'rad4862@gmail.com', roleName: 'Admin' },
  { userName: 'staff', password: '123', email: 'staff@jlycc.com', roleName: 'User' },
];

const RAW_VEHICLES: Vehicle[] = [
  { vehicleModel: 'Avanza', vehicleColor: 'Gray', vehiclePicture: '', plateNumber: 'NCG6588', familyName: 'LI', firstName: 'MERRY JOYCE', middleName: 'TINIO', mobileNumbers: '09760901681' },
  { vehicleModel: 'Chevrolet', vehicleColor: 'Brown', vehiclePicture: '', plateNumber: 'NDW5789', familyName: 'MICALLER', firstName: 'ROBERTO', middleName: 'BETITA', mobileNumbers: '09178173486' },
  { vehicleModel: 'CHEVROLET CAPTIVA', vehicleColor: 'BLACK', vehiclePicture: '', plateNumber: 'ZSF767', familyName: 'AGUSTIN', firstName: 'JOY KONSTANTINE', middleName: 'GONZALES', mobileNumbers: '09176507304' },
  { vehicleModel: 'Crosswind', vehicleColor: 'N/A', vehiclePicture: '', plateNumber: 'VWL497', familyName: 'QUIÑONEZ', firstName: 'EDWIN', middleName: 'C', mobileNumbers: '09504870138' },
  { vehicleModel: 'CRV', vehicleColor: 'Blue', vehiclePicture: '', plateNumber: 'NDU5739', familyName: 'Pe benito', firstName: 'Levi', middleName: 'D', mobileNumbers: '09175933005' },
  { vehicleModel: 'Ford Eco Sport', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'DBF2I56', familyName: 'Bacsarpa', firstName: 'Montessa', middleName: 'Silva', mobileNumbers: '09661444981' },
  { vehicleModel: 'Ford Everest', vehicleColor: 'Black', vehiclePicture: '', plateNumber: 'UTO331', familyName: 'MARQUEZ', firstName: 'LEONORA', middleName: 'ABELLA', mobileNumbers: '09088630931' },
  { vehicleModel: 'Ford explorer', vehicleColor: 'Brown red', vehiclePicture: '', plateNumber: 'NGP7288', familyName: 'MA LOURDES', firstName: 'AGUSTIN', middleName: 'ANDRES', mobileNumbers: '09175929502' },
  { vehicleModel: 'Ford explorer', vehicleColor: 'Brown red', vehiclePicture: '', plateNumber: 'NGT7288', familyName: 'AGUSTIN', firstName: 'JUN VINCENT', middleName: 'GONZALES', mobileNumbers: '09173115996' },
  { vehicleModel: 'Ford Fiesta', vehicleColor: 'Candy Red', vehiclePicture: '', plateNumber: 'NCF5924', familyName: 'ARCEO', firstName: 'MARY JOYCE', middleName: 'BERNAS', mobileNumbers: '09173390688' },
  { vehicleModel: 'Ford Ranger, Toyota Fortuner, Honda Brio', vehicleColor: 'Orange, Dark Brown, Steel Gray', vehiclePicture: '', plateNumber: 'NBM4069', familyName: 'Vedasto', firstName: 'Aura Harlynne', middleName: 'Pe Benito', mobileNumbers: '09175518672' },
  { vehicleModel: 'Ford Territory', vehicleColor: 'Gold', vehiclePicture: '', plateNumber: 'NET6662', familyName: 'BERNALDEZ', firstName: 'CHARMAGNE', middleName: 'DIZA', mobileNumbers: '09498819784' },
  { vehicleModel: 'Ford Territory', vehicleColor: 'Crystal Pearl White', vehiclePicture: '', plateNumber: 'C8N849', familyName: 'Lapuz', firstName: 'Jeanette', middleName: 'Leones', mobileNumbers: '09178640074' },
  { vehicleModel: 'Fortuner', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'ZFW145', familyName: 'AGUSTIN', firstName: 'LIZ BETHANY', middleName: 'GAJOL', mobileNumbers: '09176353348' },
  { vehicleModel: 'Fortuner', vehicleColor: 'Bronze', vehiclePicture: '', plateNumber: 'NAE3651', familyName: 'QUIÑONEZ', firstName: 'MARIBETH', middleName: 'RIVAS', mobileNumbers: '09152016861' },
  { vehicleModel: 'Fortuner', vehicleColor: 'Bronze', vehiclePicture: '', plateNumber: 'NAE6351', familyName: 'QUIÑONEZ', firstName: 'JOSE', middleName: 'CONSAD', mobileNumbers: '09064523776' },
  { vehicleModel: 'Fortuner , Ford Ranger', vehicleColor: 'Silver gray , Black', vehiclePicture: '', plateNumber: 'DAI3640', familyName: 'AMACIO', firstName: 'EDUARDO', middleName: 'RAMOS', mobileNumbers: '09088958618' },
  { vehicleModel: 'Grandia', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'NDF5618', familyName: 'SAILINDAYAO', firstName: 'ROCETTE', middleName: 'SORIA', mobileNumbers: '09679223593' },
  { vehicleModel: 'Haojue', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'NG54544', familyName: 'AUSEJO', firstName: 'MARIA CECILIA', middleName: 'CABALAN', mobileNumbers: '09293933425' },
  { vehicleModel: 'Honda Beat (motorcycle)', vehicleColor: 'Black', vehiclePicture: '', plateNumber: '1380-00001270338', familyName: 'MISAJON', firstName: 'ARLENE', middleName: 'BALLENTOS', mobileNumbers: '09276171443' },
  { vehicleModel: 'Honda BRV', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'NAA4168', familyName: 'LAVAPIE', firstName: 'ABI', middleName: 'SERRA', mobileNumbers: '09175330682' },
  { vehicleModel: 'Honda click', vehicleColor: 'Black', vehiclePicture: '', plateNumber: 'CLICK-BLACK', familyName: 'PILARTA', firstName: 'KENEDY', middleName: 'CORPUZ', mobileNumbers: '09159511759' },
  { vehicleModel: 'Honda CRV', vehicleColor: 'Metallic Gray', vehiclePicture: '', plateNumber: 'APA7742', familyName: 'TADENA', firstName: 'LEAH', middleName: 'ARIPIO', mobileNumbers: '09178812014' },
  { vehicleModel: 'Hyundai Reina 2021', vehicleColor: 'Black', vehiclePicture: '', plateNumber: 'FAG5679', familyName: 'Jacobe', firstName: 'Babylyn', middleName: 'Pagkalinawan', mobileNumbers: '09178807039' },
  { vehicleModel: 'Hyundai Santa Fe', vehicleColor: 'Carbon Bronze', vehiclePicture: '', plateNumber: 'NCU9315', familyName: 'ARCEO', firstName: 'CEZAR', middleName: 'FRANCO', mobileNumbers: '09177101052' },
  { vehicleModel: 'Hyundai tribute', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'ZMD-927', familyName: 'BUNHARDT', firstName: 'RUTH', middleName: 'BERDON', mobileNumbers: '09988871557' },
  { vehicleModel: 'Innova J 2015', vehicleColor: 'Gray', vehiclePicture: '', plateNumber: 'APA9577', familyName: 'COMBATE', firstName: 'ELISA', middleName: 'RAMOS', mobileNumbers: '09171287227' },
  { vehicleModel: 'Isuzu Crosswind XL, Mitsubishi Adventure GLX', vehicleColor: 'Dark Gray, White', vehiclePicture: '', plateNumber: 'NAD6959', familyName: 'GAJOL', firstName: 'JASPER', middleName: 'SERRA', mobileNumbers: '09955233409' },
  { vehicleModel: 'Kia Picanto', vehicleColor: 'Blue', vehiclePicture: '', plateNumber: 'CAF7714', familyName: 'LOZA', firstName: 'ORENCIO', middleName: 'AUTENCIO', mobileNumbers: '09178860983' },
  { vehicleModel: 'L300', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'AAN2985', familyName: 'SALINDAYAO', firstName: 'ROMAR', middleName: 'SORIA', mobileNumbers: '09351230242' },
  { vehicleModel: 'L300', vehicleColor: 'White', vehiclePicture: '', plateNumber: 'NCT5547', familyName: 'FLORES', firstName: 'REY', middleName: 'JIMUNEZ', mobileNumbers: '0' },
  { vehicleModel: 'Mazda BT 50', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'NFD8704', familyName: 'SURIO', firstName: 'PAOLO', middleName: 'ZACARIAS', mobileNumbers: '09954385020' },
  { vehicleModel: 'Mazda Tribute, Mitsubishi L300', vehicleColor: 'White, White', vehiclePicture: '', plateNumber: 'ZMD927', familyName: 'BUNHARDT', firstName: 'STEPHANIE NICOLE', middleName: 'VERDON', mobileNumbers: '09162639760' },
  { vehicleModel: 'Mirage 2016', vehicleColor: 'Silver', vehiclePicture: '', plateNumber: 'NCJ8595', familyName: 'NEPOMUCENO', firstName: 'ALLAN', middleName: 'QUINTOS', mobileNumbers: '09669434350' },
  { vehicleModel: 'Mitsubishi Lancer Ex', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'NQK663', familyName: 'AGUSTIN', firstName: 'DAVID', middleName: 'ANDRES', mobileNumbers: '09171790428' },
  { vehicleModel: 'Mitsubishi Montero', vehicleColor: 'Silver', vehiclePicture: '', plateNumber: 'NIB9536', familyName: 'GOMEZ', firstName: 'CHARLOTTE', middleName: 'SAYSON', mobileNumbers: '09178362891' },
  { vehicleModel: 'Mitsubishi Montero', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'AAK6394', familyName: 'PARUNGAO', firstName: 'HEART AN NICCOLE', middleName: 'ALMENDRA', mobileNumbers: '09672360038' },
  { vehicleModel: 'Motorcyle', vehicleColor: 'N/A', vehiclePicture: '', plateNumber: 'MOTOR-01', familyName: 'PARICO', firstName: 'CHRISTOPHER NICK', middleName: 'NANZAN', mobileNumbers: '09062585924' },
  { vehicleModel: 'Nissan Frontier', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'XPP185', familyName: 'GATCHALIAN', firstName: 'ADRIAN', middleName: 'RIVERA', mobileNumbers: '09453777812' },
  { vehicleModel: 'Sedan', vehicleColor: 'Dark Blue', vehiclePicture: '', plateNumber: 'ZSK340', familyName: 'TABOR', firstName: 'ELIANA PSALM', middleName: 'CASTILLO', mobileNumbers: '09669746699' },
  { vehicleModel: 'Sniper 150', vehicleColor: 'Rayen Black', vehiclePicture: '', plateNumber: '5974', familyName: 'CUETO', firstName: 'MARK CEDRICK', middleName: 'BUNHARDT', mobileNumbers: '09272213294' },
  { vehicleModel: 'Suzuki Swift', vehicleColor: 'Black', vehiclePicture: '', plateNumber: 'NDZ7357', familyName: 'SOLIDUM', firstName: 'FRECEL', middleName: 'ORTIZ', mobileNumbers: '09568955254' },
  { vehicleModel: 'Toyota altis', vehicleColor: 'Gray', vehiclePicture: '', plateNumber: 'ZNF996', familyName: 'Tiongson', firstName: 'Prescy', middleName: 'F', mobileNumbers: '09255093067' },
  { vehicleModel: 'toyota fortuner', vehicleColor: 'black', vehiclePicture: '', plateNumber: 'UOV527', familyName: 'GARCIA', firstName: 'ROBERT RICH', middleName: 'DELA UMBRIA', mobileNumbers: '09062151174' },
  { vehicleModel: 'Toyota fortuner 2017', vehicleColor: 'Black', vehiclePicture: '', plateNumber: 'NCS5066', familyName: 'BERNALDEZ', firstName: 'CHRISTOPHER', middleName: 'NOLASCO', mobileNumbers: '09171576762' },
  { vehicleModel: 'Toyota Innova', vehicleColor: 'Blackish Red', vehiclePicture: '', plateNumber: 'DAI7056', familyName: 'MAICO', firstName: 'JOSEPHINE', middleName: 'CANTIGA', mobileNumbers: '09760731661' },
  { vehicleModel: 'Toyota vios', vehicleColor: 'Red', vehiclePicture: '', plateNumber: 'WON899', familyName: 'DIZA', firstName: 'CHRISTIAN JONAS', middleName: 'BALMES', mobileNumbers: '09209025932' },
  { vehicleModel: 'Toyota Vios', vehicleColor: 'Blackish Red', vehiclePicture: '', plateNumber: 'PTO977', familyName: 'MANIQUIS', firstName: 'ROMEO', middleName: 'CRUZ', mobileNumbers: '09565977886' },
  { vehicleModel: 'Vios', vehicleColor: 'Silver', vehiclePicture: '', plateNumber: 'AAN9129', familyName: 'DUMAGAT', firstName: 'MARK', middleName: 'MARK', mobileNumbers: '09266200904' },
];

// Helper to remove duplicates by plate
const uniqueVehicles = RAW_VEHICLES.reduce((acc, current) => {
  const x = acc.find(item => item.plateNumber === current.plateNumber);
  if (!x) {
    return acc.concat([current]);
  } else {
    return acc;
  }
}, [] as Vehicle[]);

const DEFAULT_VEHICLES: Vehicle[] = uniqueVehicles.map(v => ({
  ...v,
  vehiclePicture: v.vehiclePicture || `https://picsum.photos/seed/${v.plateNumber}/400/300`
}));

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  },

  getDatabase: (): Vehicle[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DATABASE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DATABASE, JSON.stringify(DEFAULT_VEHICLES));
      return DEFAULT_VEHICLES;
    }
    return JSON.parse(data);
  },

  existsByPlate: (plate: string): boolean => {
    const vehicles = StorageService.getDatabase();
    return vehicles.some(v => v.plateNumber.toUpperCase() === plate.toUpperCase());
  },

  saveVehicle: (vehicle: Vehicle) => {
    const vehicles = StorageService.getDatabase();
    // Normalize to Uppercase
    const normalized = {
      ...vehicle,
      plateNumber: vehicle.plateNumber.toUpperCase(),
      vehicleModel: vehicle.vehicleModel.toUpperCase(),
      vehicleColor: vehicle.vehicleColor.toUpperCase(),
      familyName: vehicle.familyName.toUpperCase(),
      firstName: vehicle.firstName.toUpperCase(),
      middleName: vehicle.middleName.toUpperCase(),
    };
    
    const index = vehicles.findIndex(v => v.plateNumber === normalized.plateNumber);
    if (index > -1) {
      vehicles[index] = normalized;
    } else {
      vehicles.push(normalized);
    }
    localStorage.setItem(STORAGE_KEYS.DATABASE, JSON.stringify(vehicles));
  },

  getLogs: (): LogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },

  addLog: (log: Omit<LogEntry, 'id'>) => {
    const logs = StorageService.getLogs();
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    logs.push(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return newLog;
  },

  updateLog: (log: LogEntry) => {
    const logs = StorageService.getLogs();
    const index = logs.findIndex(l => l.id === log.id);
    if (index > -1) {
      logs[index] = log;
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }
  }
};
