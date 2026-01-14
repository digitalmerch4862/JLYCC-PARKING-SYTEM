
import { StorageService } from './storage';

const RECIPIENT_EMAIL = 'digitalmerch4862@gmail.com';

export const AutomationService = {
  processScheduledTasks: async () => {
    const now = new Date();
    
    // 1. Weekly Email Report - Monday 00:00
    if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
      await AutomationService.sendWeeklyReport();
    }

    // 2. Monthly Clear - Last Day 23:59
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isLastDay = tomorrow.getDate() === 1;

    if (isLastDay && now.getHours() === 23 && now.getMinutes() === 59) {
      await AutomationService.performMonthlyPurge();
    }
  },

  sendWeeklyReport: async () => {
    const csvData = await StorageService.generateWeeklyCSV();
    const logs = await StorageService.getLogs();
    const logCount = logs.length;
    
    console.log(`[AUTOMATION: EMAIL SENT]`);
    console.log(`To: ${RECIPIENT_EMAIL}`);
    console.log(`Subject: JLYCC Weekly Parking Logs`);
    console.log(`Body: Weekly report generated with ${logCount} total logs.`);
    console.log(`Attachment: CSV Data...`);
  },

  performMonthlyPurge: async () => {
    console.log(`[AUTOMATION: PURGE STARTED] Last day of month reached.`);
    await StorageService.clearLogs();
  }
};
