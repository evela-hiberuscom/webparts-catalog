import type { ISiteReport } from '../models/siteReport';
import { buildReportCsv } from './reportCsv';

describe('reportCsv', () => {
  it('builds a CSV with stable headers and escaped values', () => {
    const reports: ISiteReport[] = [
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/demo',
        siteTitle: 'Portal, Demo',
        scanDate: '2026-05-27T12:00:00Z',
        libraryCount: 2,
        totalLibraryItems: 45,
        recycleBinItemCount: 3,
        recycleBinSizeBytes: 1024,
        storageUsedBytes: 4096,
        storageQuotaBytes: 8192,
        healthLevel: 'warning',
        flags: ['Storage high', 'Needs review'],
        scanStatus: 'partial',
        errorMessage: 'Missing "usage" endpoint',
        libraries: [],
        recycleBin: {
          itemCount: 3,
          sizeBytes: 1024,
          isAccessible: true,
          errorMessage: undefined
        }
      }
    ];

    const csv = buildReportCsv(reports);

    expect(csv).toContain('SiteTitle,SiteUrl,ScanStatus,HealthLevel');
    expect(csv).toContain('"Portal, Demo"');
    expect(csv).toContain('"Storage high | Needs review"');
    expect(csv).toContain('"Missing ""usage"" endpoint"');
  });
});