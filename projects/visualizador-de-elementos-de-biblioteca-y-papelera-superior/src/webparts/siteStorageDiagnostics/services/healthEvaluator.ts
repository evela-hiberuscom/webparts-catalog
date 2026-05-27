import type { ISiteReport, HealthLevel } from '../models/siteReport';

export interface IHealthThresholds {
  warningRecycleBinItems: number;
  criticalRecycleBinItems: number;
  warningStoragePercent: number;
  criticalStoragePercent: number;
}

const DEFAULT_THRESHOLDS: IHealthThresholds = {
  warningRecycleBinItems: 1000,
  criticalRecycleBinItems: 5000,
  warningStoragePercent: 80,
  criticalStoragePercent: 95
};

export function evaluateHealth(report: ISiteReport, thresholds: IHealthThresholds = DEFAULT_THRESHOLDS): { level: HealthLevel; flags: string[] } {
  const flags: string[] = [];
  let level: HealthLevel = 'ok';

  if (report.recycleBinItemCount !== undefined) {
    if (report.recycleBinItemCount >= thresholds.criticalRecycleBinItems) {
      level = 'critical';
      flags.push('oversized-recycle-bin');
    } else if (report.recycleBinItemCount >= thresholds.warningRecycleBinItems) {
      level = worstLevel(level, 'warning');
      flags.push('oversized-recycle-bin');
    }
  }

  if (report.storageUsedBytes !== undefined && report.storageQuotaBytes !== undefined && report.storageQuotaBytes > 0) {
    const percent = (report.storageUsedBytes / report.storageQuotaBytes) * 100;
    if (percent >= thresholds.criticalStoragePercent) {
      level = 'critical';
      flags.push('quota-pressure');
    } else if (percent >= thresholds.warningStoragePercent) {
      level = worstLevel(level, 'warning');
      flags.push('quota-pressure');
    }
  }

  if (report.recycleBinSizeBytes !== undefined && report.totalLibraryItems > 0) {
    const recycleBinRatio = report.recycleBinItemCount !== undefined
      ? report.recycleBinItemCount / report.totalLibraryItems
      : 0;
    if (recycleBinRatio > 1) {
      level = worstLevel(level, 'warning');
      flags.push('high-recycle-ratio');
    }
  }

  if (report.scanStatus === 'error') {
    level = 'unknown';
  }

  return { level, flags };
}

function worstLevel(current: HealthLevel, candidate: HealthLevel): HealthLevel {
  const order: Record<HealthLevel, number> = { ok: 0, unknown: 1, warning: 2, critical: 3 };
  return order[candidate] > order[current] ? candidate : current;
}
