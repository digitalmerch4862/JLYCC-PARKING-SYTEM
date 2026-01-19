
import { supabase } from './supabase';

export interface QueueItem {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'QUEUE_ADD' | 'QUEUE_REMOVE';
  payload: any;
  timestamp: number;
  tempId?: string; // For tracking items created offline
}

const QUEUE_KEY = 'parking_sync_queue';

export const OfflineService = {
  // Check network status
  isOnline: (): boolean => {
    return typeof navigator !== 'undefined' && navigator.onLine;
  },

  // Generate a temporary ID for offline items
  generateTempId: (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get current queue
  getQueue: (): QueueItem[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // Add item to queue
  addToQueue: (type: QueueItem['type'], payload: any, tempId?: string) => {
    const queue = OfflineService.getQueue();
    const item: QueueItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      tempId
    };
    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline] Action queued: ${type}`, payload);
  },

  // Remove specific item from queue
  removeFromQueue: (id: string) => {
    const queue = OfflineService.getQueue();
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
  },

  // Clear entire queue
  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  // Main Sync Function
  processQueue: async () => {
    if (!OfflineService.isOnline()) return;

    const queue = OfflineService.getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync] Processing ${queue.length} items...`);

    for (const item of queue) {
      try {
        let error = null;

        switch (item.type) {
          case 'CHECK_IN':
            // Remove tempId before sending if it exists in payload
            const { tempId, ...checkInPayload } = item.payload;
            const { error: inError } = await supabase.from('parking_logs').insert([checkInPayload]);
            error = inError;
            break;

          case 'CHECK_OUT':
            const { error: outError } = await supabase
              .from('parking_logs')
              .update({ check_out: item.payload.check_out })
              .eq('id', item.payload.id);
            error = outError;
            break;

          case 'QUEUE_ADD':
            const { error: qAddError } = await supabase.from('street_queue').insert([item.payload]);
            error = qAddError;
            break;

          case 'QUEUE_REMOVE':
            const { error: qRemError } = await supabase.from('street_queue').delete().eq('id', item.payload.id);
            error = qRemError;
            break;
        }

        if (error) {
          console.error(`[Sync] Failed item ${item.id}:`, error);
          // If it's a server error (5xx) keep it. If it's a validation error (4xx), maybe remove it?
          // For now, we keep it to retry unless it looks strictly malformed.
        } else {
          console.log(`[Sync] Success item ${item.id}`);
          OfflineService.removeFromQueue(item.id);
        }

      } catch (err) {
        console.error(`[Sync] Exception processing item ${item.id}`, err);
      }
    }
  },

  // Wrapper for Check In
  checkIn: async (payload: any) => {
    // If online, try direct
    if (OfflineService.isOnline()) {
      try {
        const { error } = await supabase.from('parking_logs').insert([payload]);
        if (!error) return; // Success
      } catch (e) {
        console.warn('Online check-in failed, falling back to queue');
      }
    }
    // If offline or failed, queue it
    OfflineService.addToQueue('CHECK_IN', payload, payload.tempId);
  },

  // Wrapper for Check Out
  checkOut: async (id: string) => {
    const payload = { id, check_out: new Date().toISOString() };
    
    if (OfflineService.isOnline()) {
      try {
        const { error } = await supabase
          .from('parking_logs')
          .update({ check_out: payload.check_out })
          .eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Online check-out failed, falling back to queue');
      }
    }
    OfflineService.addToQueue('CHECK_OUT', payload);
  },

  // Wrapper for Street Queue
  addToStreetQueue: async (payload: any) => {
    if (OfflineService.isOnline()) {
      try {
        const { error } = await supabase.from('street_queue').insert([payload]);
        if (!error) return;
      } catch (e) { console.warn('Online queue-add failed'); }
    }
    OfflineService.addToQueue('QUEUE_ADD', payload);
  },

  removeFromStreetQueue: async (id: string) => {
     if (OfflineService.isOnline()) {
      try {
        const { error } = await supabase.from('street_queue').delete().eq('id', id);
        if (!error) return;
      } catch (e) { console.warn('Online queue-remove failed'); }
    }
    OfflineService.addToQueue('QUEUE_REMOVE', { id });
  }
};
