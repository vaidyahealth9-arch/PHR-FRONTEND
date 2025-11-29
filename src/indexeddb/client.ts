import Dexie, { Table } from 'dexie';

export interface CachedRecord {
  id: string;
  profile_id: string;
  record_type: string;
  title: string;
  description?: string;
  file_path?: string;
  file_type?: string;
  issued_date?: string;
  source_facility?: string;
  source_doctor?: string;
  tags?: string[];
  is_digitized: boolean;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface SyncQueue {
  id?: number;
  action: 'create' | 'update' | 'delete';
  resource_type: 'record' | 'profile' | 'medication';
  resource_id?: string;
  data: any;
  created_at: string;
  synced: boolean;
}

export interface UserPreference {
  key: string;
  value: any;
}

export interface LastSync {
  resource_type: string;
  timestamp: string;
}

export class PHRDatabase extends Dexie {
  cachedRecords!: Table<CachedRecord, string>;
  syncQueue!: Table<SyncQueue, number>;
  userPreferences!: Table<UserPreference, string>;
  lastSync!: Table<LastSync, string>;

  constructor() {
    super('PHRDatabase');
    
    this.version(1).stores({
      cachedRecords: 'id, profile_id, record_type, created_at, synced',
      syncQueue: '++id, resource_type, synced, created_at',
      userPreferences: 'key',
      lastSync: 'resource_type'
    });
  }
}

export const db = new PHRDatabase();

// Helper functions
export const clearAllData = async () => {
  await db.cachedRecords.clear();
  await db.syncQueue.clear();
  await db.userPreferences.clear();
  await db.lastSync.clear();
};

export const addToSyncQueue = async (
  action: 'create' | 'update' | 'delete',
  resource_type: 'record' | 'profile' | 'medication',
  data: any,
  resource_id?: string
) => {
  await db.syncQueue.add({
    action,
    resource_type,
    resource_id,
    data,
    created_at: new Date().toISOString(),
    synced: false
  });
};

export const updateLastSync = async (resource_type: string) => {
  await db.lastSync.put({
    resource_type,
    timestamp: new Date().toISOString()
  });
};

export const getUnsyncedItems = async () => {
  return await db.syncQueue.where('synced').equals(false).toArray();
};
