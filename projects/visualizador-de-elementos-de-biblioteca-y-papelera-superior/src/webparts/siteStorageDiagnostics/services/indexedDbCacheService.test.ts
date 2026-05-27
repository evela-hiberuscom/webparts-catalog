import { IndexedDbCacheService } from './indexedDbCacheService';

// Minimal IndexedDB mock for Jest/jsdom
function createFakeIndexedDB(): IDBFactory {
  const stores: Record<string, Map<string, unknown>> = {};

  const fakeObjectStore = (name: string): any => ({
    put: (value: any) => {
      const key = value.siteUrl || value.id;
      stores[name].set(key, value);
      return { onsuccess: null, onerror: null };
    },
    get: (key: string) => {
      const result = stores[name].get(key);
      const request = { result, onsuccess: null as any, onerror: null };
      setTimeout(() => request.onsuccess?.(), 0);
      return request;
    },
    getAll: () => {
      const result = Array.from(stores[name].values());
      const request = { result, onsuccess: null as any, onerror: null };
      setTimeout(() => request.onsuccess?.(), 0);
      return request;
    },
    clear: () => {
      stores[name].clear();
      return { onsuccess: null, onerror: null };
    }
  });

  const fakeTransaction = (storeNames: string | string[], mode: string): any => {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const tx = {
      objectStore: (name: string) => fakeObjectStore(name),
      oncomplete: null as any,
      onerror: null
    };
    setTimeout(() => tx.oncomplete?.(), 0);
    return tx;
  };

  const fakeDb: any = {
    objectStoreNames: { contains: (name: string) => name in stores },
    createObjectStore: (name: string) => { stores[name] = new Map(); },
    transaction: fakeTransaction
  };

  const factory: any = {
    open: () => {
      const request: any = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: fakeDb
      };
      setTimeout(() => {
        if (!stores['reports']) {
          request.onupgradeneeded?.({ target: request });
        }
        request.onsuccess?.({ target: request });
      }, 0);
      return request;
    }
  };

  return factory as IDBFactory;
}

describe('IndexedDbCacheService', () => {
  let originalIndexedDB: IDBFactory;

  beforeEach(() => {
    originalIndexedDB = (globalThis as any).indexedDB;
    (globalThis as any).indexedDB = createFakeIndexedDB();
  });

  afterEach(() => {
    (globalThis as any).indexedDB = originalIndexedDB;
  });

  it('opens without error', async () => {
    const cache = new IndexedDbCacheService();
    await expect(cache.open()).resolves.toBeUndefined();
  });

  it('saves and retrieves a report', async () => {
    const cache = new IndexedDbCacheService();
    const report = {
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
      libraries: [],
      recycleBin: { itemCount: 10, sizeBytes: 5120, isAccessible: true }
    };

    await cache.saveReport(report as any);
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
    const r1 = { siteUrl: 'https://a.com', siteTitle: 'A' };
    const r2 = { siteUrl: 'https://b.com', siteTitle: 'B' };

    await cache.saveReport(r1 as any);
    await cache.saveReport(r2 as any);
    const all = await cache.getAllReports();

    expect(all).toHaveLength(2);
  });

  it('clearReports removes all reports', async () => {
    const cache = new IndexedDbCacheService();
    await cache.saveReport({ siteUrl: 'https://x.com' } as any);
    await cache.clearReports();
    const all = await cache.getAllReports();

    expect(all).toHaveLength(0);
  });
});
