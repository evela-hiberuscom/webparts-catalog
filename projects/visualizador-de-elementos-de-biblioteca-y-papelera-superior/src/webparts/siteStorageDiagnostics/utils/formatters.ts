export function formatBytes(value: number | undefined): string {
  if (value === undefined) return '—';
  if (value === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let amount = value;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const precision = amount >= 100 || unitIndex === 0 ? 0 : 1;
  return `${amount.toFixed(precision)} ${units[unitIndex]}`;
}

export function formatDate(isoString: string | undefined): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString();
}

export function formatPercent(used: number | undefined, quota: number | undefined): string {
  if (used === undefined || quota === undefined || quota === 0) return '—';
  return `${((used / quota) * 100).toFixed(1)}%`;
}
