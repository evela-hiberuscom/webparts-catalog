import type { ISiteReport } from '../models/siteReport';

const REPORT_HEADERS = [
  'SiteTitle',
  'SiteUrl',
  'ScanStatus',
  'HealthLevel',
  'LibraryCount',
  'TotalLibraryItems',
  'RecycleBinItemCount',
  'RecycleBinSizeBytes',
  'StorageUsedBytes',
  'StorageQuotaBytes',
  'Flags',
  'ErrorMessage',
  'ScanDate'
];

export function buildReportCsv(reports: ISiteReport[]): string {
  const rows = reports.map((report) => [
    report.siteTitle,
    report.siteUrl,
    report.scanStatus,
    report.healthLevel,
    report.libraryCount,
    report.totalLibraryItems,
    report.recycleBinItemCount,
    report.recycleBinSizeBytes,
    report.storageUsedBytes,
    report.storageQuotaBytes,
    report.flags.join(' | '),
    report.errorMessage,
    report.scanDate
  ].map(escapeCsvValue).join(','));

  return [REPORT_HEADERS.join(','), ...rows].join('\r\n');
}

export function downloadReportCsv(reports: ISiteReport[], fileName = `site-storage-diagnostics-${new Date().toISOString().slice(0, 10)}.csv`): void {
  const csv = `\uFEFF${buildReportCsv(reports)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);
}

function escapeCsvValue(value: string | number | undefined): string {
  const normalized = value === undefined ? '' : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}