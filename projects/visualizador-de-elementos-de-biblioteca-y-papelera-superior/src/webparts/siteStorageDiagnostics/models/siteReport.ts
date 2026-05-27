export type HealthLevel = 'ok' | 'warning' | 'critical' | 'unknown';
export type ScanSiteStatus = 'pending' | 'scanning' | 'completed' | 'partial' | 'error';
export type ScanGlobalStatus = 'idle' | 'discovering' | 'scanning' | 'paused' | 'completed' | 'cancelled' | 'error';

export interface ILibraryMetrics {
  id: string;
  title: string;
  itemCount: number;
  lastModified: string | undefined;
}

export interface IRecycleBinMetrics {
  itemCount: number | undefined;
  sizeBytes: number | undefined;
  isAccessible: boolean;
  errorMessage: string | undefined;
}

export interface ISiteReport {
  siteUrl: string;
  siteTitle: string;
  scanDate: string;
  libraryCount: number;
  totalLibraryItems: number;
  recycleBinItemCount: number | undefined;
  recycleBinSizeBytes: number | undefined;
  storageUsedBytes: number | undefined;
  storageQuotaBytes: number | undefined;
  healthLevel: HealthLevel;
  flags: string[];
  scanStatus: ScanSiteStatus;
  errorMessage: string | undefined;
  libraries: ILibraryMetrics[];
  recycleBin: IRecycleBinMetrics;
}

export interface ISiteReportListItem {
  SiteUrl: string;
  SiteTitle: string;
  ScanDate: string;
  LibraryCount: number;
  TotalLibraryItems: number;
  RecycleBinItemCount: number | undefined;
  RecycleBinSizeBytes: number | undefined;
  StorageUsedBytes: number | undefined;
  StorageQuotaBytes: number | undefined;
  HealthLevel: string;
  Flags: string;
  ScanStatus: string;
  ErrorMessage: string | undefined;
}

export function mapReportToListItem(report: ISiteReport): ISiteReportListItem {
  return {
    SiteUrl: report.siteUrl,
    SiteTitle: report.siteTitle,
    ScanDate: report.scanDate,
    LibraryCount: report.libraryCount,
    TotalLibraryItems: report.totalLibraryItems,
    RecycleBinItemCount: report.recycleBinItemCount,
    RecycleBinSizeBytes: report.recycleBinSizeBytes,
    StorageUsedBytes: report.storageUsedBytes,
    StorageQuotaBytes: report.storageQuotaBytes,
    HealthLevel: report.healthLevel,
    Flags: report.flags.join(';'),
    ScanStatus: report.scanStatus,
    ErrorMessage: report.errorMessage
  };
}

export function mapListItemToReport(item: ISiteReportListItem): ISiteReport {
  return {
    siteUrl: item.SiteUrl,
    siteTitle: item.SiteTitle,
    scanDate: item.ScanDate,
    libraryCount: item.LibraryCount,
    totalLibraryItems: item.TotalLibraryItems,
    recycleBinItemCount: item.RecycleBinItemCount,
    recycleBinSizeBytes: item.RecycleBinSizeBytes,
    storageUsedBytes: item.StorageUsedBytes,
    storageQuotaBytes: item.StorageQuotaBytes,
    healthLevel: item.HealthLevel as HealthLevel,
    flags: item.Flags ? item.Flags.split(';').filter(Boolean) : [],
    scanStatus: item.ScanStatus as ScanSiteStatus,
    errorMessage: item.ErrorMessage,
    libraries: [],
    recycleBin: {
      itemCount: item.RecycleBinItemCount,
      sizeBytes: item.RecycleBinSizeBytes,
      isAccessible: item.ScanStatus !== 'error',
      errorMessage: undefined
    }
  };
}
