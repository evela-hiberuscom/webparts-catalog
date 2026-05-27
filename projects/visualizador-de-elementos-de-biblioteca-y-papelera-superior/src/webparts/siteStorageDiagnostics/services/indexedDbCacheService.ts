import type { ISiteReport } from '../models/siteReport';

const DB_NAME = 'SiteStorageDiagnostics';
const DB_VERSION = 1;
const STORE_REPORTS = 'reports';
const STORE_SCAN_STATE = 'scanState';

export class IndexedDbCacheService {
  private db: IDBDatabase | undefined;

  public async open(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_REPORTS)) {
          db.createObjectStore(STORE_REPORTS, { keyPath: 'siteUrl' });
        }
        if (!db.objectStoreNames.contains(STORE_SCAN_STATE)) {
          db.createObjectStore(STORE_SCAN_STATE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  }

  public async saveReport(report: ISiteReport): Promise<void> {
    await this.open();
    return this.put(STORE_REPORTS, report);
  }

  public async getReport(siteUrl: string): Promise<ISiteReport | undefined> {
    await this.open();
    return this.get<ISiteReport>(STORE_REPORTS, siteUrl);
  }

  public async getAllReports(): Promise<ISiteReport[]> {
    await this.open();
    return this.getAll<ISiteReport>(STORE_REPORTS);
  }

  public async saveScanState(state: { id: string; completedUrls: string[]; pendingUrls: string[]; timestamp: string }): Promise<void> {
    await this.open();
    return this.put(STORE_SCAN_STATE, state);
  }

  public async getScanState(id: string): Promise<{ id: string; completedUrls: string[]; pendingUrls: string[]; timestamp: string } | undefined> {
    await this.open();
    return this.get(STORE_SCAN_STATE, id);
  }

  public async clearReports(): Promise<void> {
    await this.open();
    return this.clear(STORE_REPORTS);
  }

  private put<T>(storeName: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject(new Error('DB not open')); return; }
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject(new Error('DB not open')); return; }
      const tx = this.db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  private getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject(new Error('DB not open')); return; }
      const tx = this.db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  private clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject(new Error('DB not open')); return; }
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
