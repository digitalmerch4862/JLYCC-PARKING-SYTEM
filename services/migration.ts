
import { supabase } from './supabase';

export interface MigrationResult {
  total: number;
  success: number;
  error: number;
}

const VEHICLE_DATASET = [
  { model: "Avanza", color: "Gray", plate: "NCG6588", family: "LI", first: "MERRY JOYCE", middle: "TINIO", mobile: "9760901681", email: "" },
  { model: "Avanza", color: "Gray", plate: "NCG6588", family: "LI", first: "MERRY GRACE", middle: "TINIO", mobile: "9432319766", email: "" },
  { model: "Chevrolet", color: "Brown", plate: "NDW5789", family: "MICALLER", first: "ROBERTO", middle: "BETITA", mobile: "9178173486", email: "" },
  { model: "CHEVROLET CAPTIVA", color: "BLACK", plate: "ZSF767", family: "AGUSTIN", first: "JOY KONSTANTINE", middle: "GONZALES", mobile: "09176507304", email: "" },
  { model: "Crosswind", color: "N/A", plate: "VWL497", family: "QUIÑONEZ", first: "EDWIN", middle: "C", mobile: "9504870138", email: "" },
  { model: "CRV", color: "Blue", plate: "NDU5739", family: "Pe benito", first: "Levi", middle: "D", mobile: "09175933005", email: "" },
  { model: "Ford Eco Sport", color: "Red", plate: "DBF2I56", family: "Bacsarpa", first: "Montessa", middle: "Silva", mobile: "09661444981", email: "" },
  { model: "Ford Everest", color: "Black", plate: "UTO331", family: "MARQUEZ", first: "LEONORA", middle: "ABELLA", mobile: "9088630931", email: "" },
  { model: "Ford explorer", color: "Brown red", plate: "NGP7288", family: "MA LOURDES", first: "AGUSTIN", middle: "ANDRES", mobile: "9175929502", email: "" },
  { model: "Ford explorer", color: "Brown red", plate: "NGT7288", family: "AGUSTIN", first: "JUN VINCENT", middle: "GONZALES", mobile: "9173115996", email: "" },
  { model: "Ford Fiesta", color: "Candy Red", plate: "NCF5924", family: "ARCEO", first: "MARY JOYCE", middle: "BERNAS", mobile: "9173390688", email: "" },
  { model: "Ford Ranger, Toyota Fortuner, Honda Brio", color: "Orange, Dark Brown, Steel Gray", plate: "NBM4069,DAD3798,ABH7551", family: "Vedasto", first: "Aura Harlynne", middle: "Pe Benito", mobile: "09175518672", email: "" },
  { model: "Ford Territory", color: "Gold", plate: "NET6662", family: "BERNALDEZ", first: "CHARMAGNE", middle: "DIZA", mobile: "9498819784", email: "" },
  { model: "Ford Territory", color: "Crystal Pearl White", plate: "C8N849", family: "Lapuz", first: "Jeanette", middle: "Leones", mobile: "09178640074", email: "" },
  { model: "Fortuner", color: "White", plate: "ZFW145", family: "AGUSTIN", first: "LIZ BETHANY", middle: "GAJOL", mobile: "9176353348", email: "" },
  { model: "Fortuner", color: "White", plate: "ZFW145", family: "AGUSTIN", first: "IAN RAE", middle: "GONZALES", mobile: "9236070523", email: "" },
  { model: "Fortuner", color: "Bronze", plate: "NAE3651", family: "QUIÑONEZ", first: "MARIBETH", middle: "RIVAS", mobile: "9152016861", email: "" },
  { model: "Fortuner", color: "Bronze", plate: "NAE6351", family: "QUIÑONEZ", first: "JOSE", middle: "CONSAD", mobile: "9064523776", email: "" },
  { model: "Fortuner", color: "Bronze", plate: "NAE6351", family: "QUIÑONEZ", first: "REUBEN KEM", middle: "RIVAS", mobile: "9664653121", email: "" },
  { model: "Fortuner , Ford Ranger", color: "Silver gray , Black", plate: "DAI3640,DAM8960", family: "AMACIO", first: "EDUARDO", middle: "RAMOS", mobile: "9088958618", email: "" },
  { model: "Fortuner , Ford Ranger", color: "Silver gray , Black", plate: "DAI3640,DAM8960", family: "AMACIO", first: "ROMILDA", middle: "SAN JOSE", mobile: "9175441569", email: "" },
  { model: "Fortuner toyota", color: "White", plate: "ZFW145", family: "GAJOL", first: "ALICIA", middle: "SERRA", mobile: "9176353348", email: "" },
  { model: "Grandia", color: "White", plate: "NDF5618", family: "SAILINDAYAO", first: "ROCETTE", middle: "SORIA", mobile: "9679223593", email: "" },
  { model: "Haojue", color: "Red", plate: "NG54544", family: "AUSEJO", first: "MARIA CECILIA", middle: "CABALAN", mobile: "9293933425", email: "" },
  { model: "Honda Beat (motorcycle)", color: "Black", plate: "1380-00001270338", family: "MISAJON", first: "ARLENE", middle: "BALLENTOS", mobile: "9276171443", email: "" },
  { model: "Honda BRV", color: "White", plate: "NAA4168", family: "LAVAPIE", first: "ABI", middle: "SERRA", mobile: "9175330682", email: "" },
  { model: "Honda click", color: "Black", plate: "MOTOCYCLECLICKBLACK", family: "PILARTA", first: "KENEDY", middle: "CORPUZ", mobile: "9159511759", email: "" },
  { model: "Honda CRV", color: "Metallic Gray", plate: "APA7742", family: "TADENA", first: "LEAH", middle: "ARIPIO", mobile: "9178812014", email: "" },
  { model: "Hyundai Reina 2021", color: "Black", plate: "FAG5679", family: "Jacobe", first: "Babylyn", middle: "Pagkalinawan", mobile: "09178807039", email: "" },
  { model: "Hyundai Reina 2021", color: "Black", plate: "FAG5679", family: "Jacobe", first: "Pacifico", middle: "Faytaren", mobile: "09155920683", email: "" },
  { model: "Hyundai Santa Fe", color: "Carbon Bronze", plate: "NCU9315", family: "ARCEO", first: "CEZAR", middle: "FRANCO", mobile: "9177101052", email: "" },
  { model: "Hyundai tribute", color: "White", plate: "ZMD-927", family: "BUNHARDT", first: "RUTH", middle: "BERDON", mobile: "9988871557", email: "" },
  { model: "Innova J 2015", color: "Gray", plate: "APA9577", family: "COMBATE", first: "ELISA", middle: "RAMOS", mobile: "9171287227", email: "" },
  { model: "Isuzu Crosswind XL, Mitsubishi Adventure GLX", color: "Dark Gray, White", plate: "NAD6959", family: "GAJOL", first: "JASPER", middle: "SERRA", mobile: "9955233409", email: "" },
  { model: "Kia Picanto", color: "Blue", plate: "CAF7714", family: "LOZA", first: "ORENCIO", middle: "AUTENCIO", mobile: "9178860983", email: "" },
  { model: "L300", color: "White", plate: "AAN2985", family: "SALINDAYAO", first: "ROMAR", middle: "SORIA", mobile: "9351230242", email: "" },
  { model: "L300", color: "White", plate: "NCT5547", family: "FLORES", first: "REY", middle: "JIMUNEZ", mobile: "0", email: "" },
  { model: "Mazda BT 50", color: "Red", plate: "NFD8704", family: "SURIO", first: "PAOLO", middle: "ZACARIAS", mobile: "9954385020", email: "" },
  { model: "Mazda Tribute, Mitsubishi L300", color: "White, White", plate: "ZMD927,NCT5547", family: "BUNHARDT", first: "STEPHANIE NICOLE", middle: "VERDON", mobile: "9162639760", email: "" },
  { model: "Mirage 2016", color: "Silver", plate: "NCJ8595", family: "NEPOMUCENO", first: "ALLAN", middle: "QUINTOS", mobile: "9669434350", email: "" },
  { model: "Mitsubishi Lancer Ex", color: "Red", plate: "NQK663", family: "AGUSTIN", first: "DAVID", middle: "ANDRES", mobile: "9171790428", email: "" },
  { model: "Mitsubishi Mirage", color: "Silver", plate: "NCJ8595", family: "NEPOMUCENO", first: "KATRINA JOYCE", middle: "DELA PEÑA", mobile: "9234539982", email: "" },
  { model: "Mitsubishi Montero", color: "Silver", plate: "NIB9536", family: "GOMEZ", first: "CHARLOTTE", middle: "SAYSON", mobile: "9178362891", email: "" },
  { model: "Mitsubishi Montero", color: "Red", plate: "AAK6394", family: "PARUNGAO", first: "HEART AN NICCOLE", middle: "ALMENDRA", mobile: "9672360038", email: "" },
  { model: "Mitsubishi Montero Sport", color: "Silver", plate: "NIB9536", family: "GOMEZ", first: "CHRISTIAN", middle: "SANTOS", mobile: "9173047274", email: "" },
  { model: "Montero", color: "Maroon", plate: "AAK6394", family: "PARUNGAO", first: "ABIGAIL COLLINE", middle: "ALMENDRA", mobile: "09451389183", email: "" },
  { model: "Motorcyle", color: "N/A", plate: "N/A", family: "PARICO", first: "CHRISTOPHER", middle: "NICK NANZAN", mobile: "09062585924", email: "" },
  { model: "Nissan Frontier", color: "Red", plate: "XPP185", family: "GATCHALIAN", first: "ADRIAN", middle: "RIVERA", mobile: "9453777812", email: "" },
  { model: "Nissan Frontier pick up", color: "red", plate: "XPP185", family: "GATCHALIAN", first: "ALELIN", middle: "RIVERA", mobile: "9190975450", email: "" },
  { model: "Nissan Frontier pick up", color: "red", plate: "XPP185", family: "GATCHALIAN", first: "ALLAN", middle: "ATIENZA", mobile: "9190875449", email: "" },
  { model: "Sedan", color: "Dark Blue", plate: "ZSK340", family: "TABOR", first: "ELIANA PSALM", middle: "CASTILLO", mobile: "9669746699", email: "" },
  { model: "Sedan", color: "Dark Blue", plate: "ZSK340", family: "CASTILLO-TABOR", first: "DIANE MARIE", middle: "BARRALES", mobile: "9952982019", email: "" },
  { model: "Sniper 150", color: "Rayen Black", plate: "5974", family: "CUETO", first: "MARK CEDRICK", middle: "BUNHARDT", mobile: "9272213294", email: "" },
  { model: "Suzuki Swift", color: "Black", plate: "NDZ7357", family: "SOLIDUM", first: "FRECEL", middle: "ORTIZ", mobile: "9568955254", email: "" },
  { model: "Suzuki Swit", color: "Black", plate: "NDZ7357", family: "SOLIDUM", first: "MA. CLAYCEL", middle: "ORTIZ", mobile: "9164213868", email: "" },
  { model: "Toyota altis", color: "Gray", plate: "ZNF996", family: "Tiongson", first: "Prescy", middle: "F", mobile: "09255093067", email: "" },
  { model: "Toyota Altis", color: "Gray", plate: "ZNF996", family: "Tiongson", first: "Ronaldo", middle: "M", mobile: "09189794123", email: "" },
  { model: "Toyota fortuner", color: "black", plate: "UOV527", family: "GARCIA", first: "ROBERT RICH", middle: "DELA UMBRIA", mobile: "9062151174", email: "" },
  { model: "Toyota fortuner", color: "black", plate: "UOV527", family: "GARCIA", first: "MARGE", middle: "SANANA", mobile: "9171103834", email: "" },
  { model: "Toyota fortuner 2017", color: "Black", plate: "NCS5066", family: "BERNALDEZ", first: "CHRISTOPHER", middle: "NOLASCO", mobile: "9171576762", email: "" },
  { model: "Toyota GL Grandia", color: "Pearl White", plate: "NDF5618", family: "Bacsarpa", first: "Loui", middle: "Taghoy", mobile: "09164781270", email: "" },
  { model: "Toyota Innova", color: "Blackish Red", plate: "DAI7056", family: "MAICO", first: "JOSEPHINE", middle: "CANTIGA", mobile: "9760731661", email: "" },
  { model: "Toyota Inova", color: "Blackish Red", plate: "DAI7056", family: "MAICO", first: "CATALINO", middle: "CAMPOSANO", mobile: "9506221724", email: "" },
  { model: "Toyota vios", color: "Red", plate: "WON899", family: "DIZA", first: "CHRISTIAN JONAS", middle: "BALMES", mobile: "9209025932", email: "" },
  { model: "Toyota Vios", color: "Blackish Red", plate: "PTO977", family: "MANIQUIS", first: "ROMEO", middle: "CRUZ", mobile: "9565977886", email: "" },
  { model: "Toyota Vios", color: "Blackish Red", plate: "PTO977", family: "MANIQUIS", first: "ARLENE", middle: "ARAMBULO", mobile: "9279909729", email: "" },
  { model: "Toyota Vios", color: "Blackish Red", plate: "PTO977", family: "MANIQUIS", first: "SAMANTHA", middle: "ARAMBULO", mobile: "9668756442", email: "" },
  { model: "Toyota vios, Isuzu sportivo", color: "Red", plate: "WON899,ZEU533", family: "DIZA", first: "JONALYN", middle: "BALMES", mobile: "9209025932", email: "" },
  { model: "Vios", color: "Silver", plate: "AAN9129", family: "DUMAGAT", first: "MARK", middle: "MARK", mobile: "9266200904", email: "" }
];

export const MigrationService = {
  importFromSheet: async (): Promise<MigrationResult> => {
    let successCount = 0;
    let errorCount = 0;

    const mappedData = VEHICLE_DATASET.map(v => {
      // Normalize phone number to start with 09
      let phone = v.mobile.trim().replace(/\D/g, '');
      if (phone.startsWith('9') && phone.length === 10) {
        phone = '0' + phone;
      }
      
      return {
        vehicle_model: v.model.toUpperCase().trim(),
        vehicle_color: v.color.toUpperCase().trim(),
        plate_number: v.plate.toUpperCase().trim(),
        family_name: v.family.toUpperCase().trim(),
        first_name: v.first.toUpperCase().trim(),
        middle_name: v.middle.toUpperCase().trim() || null,
        mobile_number: phone,
        email: v.email?.toLowerCase().trim() || null
      };
    });

    // Perform upsert in batches to avoid overwhelming the client/API
    const { error } = await supabase
      .from('vehicles')
      .upsert(mappedData, { 
        onConflict: 'plate_number,mobile_number,first_name,family_name' 
      });

    if (error) {
      console.error('Migration failed:', error);
      errorCount = VEHICLE_DATASET.length;
    } else {
      successCount = VEHICLE_DATASET.length;
    }

    return {
      total: VEHICLE_DATASET.length,
      success: successCount,
      error: errorCount
    };
  }
};
