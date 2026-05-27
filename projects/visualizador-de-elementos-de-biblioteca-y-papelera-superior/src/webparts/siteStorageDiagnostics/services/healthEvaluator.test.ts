import { evaluateHealth } from './healthEvaluator';
import type { ISiteReport } from '../models/siteReport';

function createBaseReport(overrides: Partial<ISiteReport> = {}): ISiteReport {
  return {
    siteUrl: 'https://contoso.sharepoint.com/sites/test',
    siteTitle: 'Test Site',
    scanDate: '2026-05-27T10:00:00Z',
    libraryCount: 3,
    totalLibraryItems: 500,
    recycleBinItemCount: 50,
    recycleBinSizeBytes: 1024000,
    storageUsedBytes: 1073741824,
    storageQuotaBytes: 27917287424,
    healthLevel: 'ok',
    flags: [],
    scanStatus: 'completed',
    errorMessage: undefined,
    libraries: [],
    recycleBin: { itemCount: 50, sizeBytes: 1024000, isAccessible: true, errorMessage: undefined },
    ...overrides
  };
}

describe('healthEvaluator', () => {
  it('returns ok for healthy site', () => {
    const report = createBaseReport();
    const result = evaluateHealth(report);
    expect(result.level).toBe('ok');
    expect(result.flags).toEqual([]);
  });

  it('returns warning for high recycle bin item count', () => {
    const report = createBaseReport({ recycleBinItemCount: 1500 });
    const result = evaluateHealth(report);
    expect(result.level).toBe('warning');
    expect(result.flags).toContain('oversized-recycle-bin');
  });

  it('returns critical for very high recycle bin item count', () => {
    const report = createBaseReport({ recycleBinItemCount: 6000 });
    const result = evaluateHealth(report);
    expect(result.level).toBe('critical');
    expect(result.flags).toContain('oversized-recycle-bin');
  });

  it('returns warning for quota pressure above 80%', () => {
    const report = createBaseReport({
      storageUsedBytes: 85 * 1073741824 / 100, // ~85%
      storageQuotaBytes: 1073741824
    });
    const result = evaluateHealth(report);
    expect(result.level).toBe('warning');
    expect(result.flags).toContain('quota-pressure');
  });

  it('returns critical for quota pressure above 95%', () => {
    const report = createBaseReport({
      storageUsedBytes: 96 * 1073741824 / 100,
      storageQuotaBytes: 1073741824
    });
    const result = evaluateHealth(report);
    expect(result.level).toBe('critical');
    expect(result.flags).toContain('quota-pressure');
  });

  it('returns unknown for error status', () => {
    const report = createBaseReport({ scanStatus: 'error' });
    const result = evaluateHealth(report);
    expect(result.level).toBe('unknown');
  });

  it('detects high recycle ratio', () => {
    const report = createBaseReport({
      recycleBinItemCount: 600,
      recycleBinSizeBytes: 5000000,
      totalLibraryItems: 500
    });
    const result = evaluateHealth(report);
    expect(result.flags).toContain('high-recycle-ratio');
  });
});
