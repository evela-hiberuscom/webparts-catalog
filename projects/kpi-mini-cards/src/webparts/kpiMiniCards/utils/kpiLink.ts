import type { IKpiMiniCardLink, KpiBadge, KpiTrend } from '../models/kpiModels';

function isDangerousProtocol(value: string): boolean {
  return /^(javascript|data|vbscript):/i.test(value);
}

function isAllowedDirectLink(value: string): boolean {
  return /^(https?:\/\/|mailto:|tel:|\/|#|\?)/i.test(value);
}

export function sanitizeKpiUrl(url: string | undefined, openInNewTab: boolean): IKpiMiniCardLink | undefined {
  const value = typeof url === 'string' ? url.trim() : '';

  if (!value || isDangerousProtocol(value) || !isAllowedDirectLink(value)) {
    return undefined;
  }

  return {
    href: value,
    target: openInNewTab ? '_blank' : '_self',
    rel: openInNewTab ? 'noopener noreferrer' : undefined
  };
}

export function describeTrend(trend: KpiTrend): string {
  switch (trend) {
    case 'up':
      return 'Sube';
    case 'down':
      return 'Baja';
    case 'flat':
      return 'Estable';
    default:
      return 'Sin tendencia';
  }
}

export function getBadgeLabel(badge: KpiBadge): string {
  switch (badge) {
    case 'ok':
      return 'Ok';
    case 'warning':
      return 'Aviso';
    case 'critical':
      return 'Crítico';
    case 'partial':
      return 'Parcial';
    default:
      return 'Desconocido';
  }
}
