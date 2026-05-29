import { IndexedDbCacheService } from './indexedDbCacheService';
import type { ISiteReport } from '../models/siteReport';

interface IFakeRequest<T> {
  result: T | undefined;
  onsuccess: ((event?: { target: IFakeRequest<T> }) => void) | undefined;
  onerror: ((event?: { target: IFakeRequest<T> }) => void) | undefined;
  onupgradeneeded?: ((event: { target: IFakeRequest<IFakeDb> }) => void) | undefined;
}

interface IFakeObjectStore {
  put(value: { siteUrl?: string; id?: string }): IFakeRequest<void>;
  get(key: string): IFakeRequest<unknown>;
  getAll(): IFakeRequest<unknown[]>;
  clear(): IFakeRequest<void>;
}

interface IFakeTransaction {
  objectStore(name: string): IFakeObjectStore;
  oncomplete: (() => void) | undefined;
  onerror: (() => void) | undefined;
  error: DOMException | undefined;
}

interface IFakeDb {
  objectStoreNames: { contains(name: string): boolean };
  createObjectStore(name: string): void;
  transaction(storeNames: string | string[], mode: IDBTransactionMode): IFakeTransaction;
}

function createRequest<T>(result?: T): IFakeRequest<T> {
  return {
    result,
    onsuccess: undefined,
    onerror: undefined
  };
}

// Minimal IndexedDB mock for Jest/jsdom
function createFakeIndexedDB(): IDBFactory {
  const stores: Record<string, Map<string, unknown>> = {};

  const fakeObjectStore = (name: string): IFakeObjectStore => ({
    put: (value) => {
      const key = value.siteUrl ?? value.id;
      if (!key) {
        throw new Error('Fake IndexedDB item requires siteUrl or id.');
      }
      stores[name].set(key, value);
      return createRequest<void>();
    },
    get: (key: string) => {
      const result = stores[name].get(key);
      const request = createRequest(result);
      setTimeout(() => request.onsuccess?.(), 0);
      return request;
    },
    getAll: () => {
      const result = Array.from(stores[name].values());
      const request = createRequest(result);
      setTimeout(() => request.onsuccess?.(), 0);
      return request;
    },
    clear: () => {
      stores[name].clear();
      return createRequest<void>();
    }
  });

  const fakeTransaction = (storeNames: string | string[], _mode: IDBTransactionMode): IFakeTransaction => {
    const storeName = Array.isArray(storeNames) ? storeNames[0] : storeNames;
    const tx: IFakeTransaction = {
      objectStore: () => fakeObjectStore(storeName),
      oncomplete: undefined,
      onerror: undefined,
      error: undefined
    };
    setTimeout(() => tx.oncomplete?.(), 0);
    return tx;
  };

  const fakeDb: IFakeDb = {
    objectStoreNames: { contains: (name: string) => name in stores },
    createObjectStore: (name: string) => { stores[name] = new Map(); },
    transaction: fakeTransaction
  };

  const factory = {
    open: () => {
      const request = createRequest(fakeDb);
      setTimeout(() => {
        if (!stores.reports) {
          request.onupgradeneeded?.({ target: request });
        }
        request.onsuccess?.({ target: request });
      }, 0);
      return request;
    }
  };

  return factory as unknown as IDBFactory;
}

describe('IndexedDbCacheService', () => {
  let originalIndexedDB: IDBFactory | undefined;

  beforeEach(() => {
    originalIndexedDB = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: createFakeIndexedDB()
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDB
    });
  });

  it('opens without error', async () => {
    const cache = new IndexedDbCacheService();
    await expect(cache.open()).resolves.toBeUndefined();
  });

  it('saves and retrieves a report', async () => {
    const cache = new IndexedDbCacheService();
    const report: ISiteReport = {
      siteUrl: 'https://contoso.sharepoint.com/sites/test',
      siteTitle: 'Test Site',
      scanDate: '2026-01-01T00:00:00Z',
      libraryCount: 3,
      totalLibraryItems: 100,
      recycleBinItemCount: 10,
      recycleBinSizeBytes: 5120,
      storageUsedBytes: 1073741824,
      storageQuotaBytes: 27917287424,
      healthLevel: 'ok' as const,
      flags: [],
      scanStatus: 'completed' as const,
      errorMessage: undefined,
      libraries: [],
      recycleBin: { itemCount: 10, sizeBytes: 5120, isAccessible: true, errorMessage: undefined }
    };

    await cache.saveReport(report);
    const result = await cache.getReport(report.siteUrl);

    expect(result).toEqual(report);
  });

  it('returns undefined for missing report', async () => {
    const cache = new IndexedDbCacheService();
    await cache.open();
    const result = await cache.getReport('https://nonexistent.sharepoint.com');
    expect(result).toBeUndefined();
  });

  it('saves and retrieves scan state', async () => {
    const cache = new IndexedDbCacheService();
    const state = {
      id: 'current',
      completedUrls: ['https://site1.com', 'https://site2.com'],
      pendingUrls: ['https://site3.com'],
      timestamp: '2026-01-01T12:00:00Z'
    };

    await cache.saveScanState(state);
    const result = await cache.getScanState('current');

    expect(result).toEqual(state);
  });

  it('returns undefined for missing scan state', async () => {
    const cache = new IndexedDbCacheService();
    await cache.open();
    const result = await cache.getScanState('nonexistent');
    expect(result).toBeUndefined();
  });

  it('getAllReports returns all saved reports', async () => {
    const cache = new IndexedDbCacheService();
    const r1: ISiteReport = {
      siteUrl: 'https://a.com',
      siteTitle: 'A',
      scanDate: '2026-01-01T00:00:00Z',
      libraryCount: 0,
      totalLibraryItems: 0,
      recycleBinItemCount: undefined,
      recycleBinSizeBytes: undefined,
      storageUsedBytes: undefined,
      storageQuotaBytes: undefined,
      healthLevel: 'ok',
      flags: [],
      scanStatus: 'completed',
      errorMessage: undefined,
      libraries: [],
      recycleBin: { itemCount: undefined, sizeBytes: undefined, isAccessible: true, errorMessage: undefined }
    };
    const r2: ISiteReport = { ...r1, siteUrl: 'https://b.com', siteTitle: 'B' };

    await cache.saveReport(r1);
    await cache.saveReport(r2);
    const all = await cache.getAllReports();

    expect(all).toHaveLength(2);
  });

  it('clearReports removes all reports', async () => {
    const cache = new IndexedDbCacheService();
    await cache.saveReport({
      siteUrl: 'https://x.com',
      siteTitle: 'X',
      scanDate: '2026-01-01T00:00:00Z',
      libraryCount: 0,
      totalLibraryItems: 0,
      recycleBinItemCount: undefined,
      recycleBinSizeBytes: undefined,
      storageUsedBytes: undefined,
      storageQuotaBytes: undefined,
      healthLevel: 'ok',
      flags: [],
      scanStatus: 'completed',
      errorMessage: undefined,
      libraries: [],
      recycleBin: { itemCount: undefined, sizeBytes: undefined, isAccessible: true, errorMessage: undefined }
    });
    await cache.clearReports();
    const all = await cache.getAllReports();

    expect(all).toHaveLength(0);
  });
});
