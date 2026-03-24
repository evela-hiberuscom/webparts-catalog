import { isAlertActive, limitAlerts, normalizePriority, normalizeSeverity, sameOriginUrl, sortAlerts } from './alertRules';
import type { IAlertItem } from '../models/alertModels';

describe('alertRules', () => {
  it('normalizes severity and priority', () => {
    expect(normalizeSeverity(' critical ')).toBe('critical');
    expect(normalizeSeverity('unexpected')).toBe('unknown');
    expect(normalizePriority('4')).toBe(4);
    expect(normalizePriority('not-a-number')).toBeUndefined();
  });

  it('detects active alerts using the temporal window', () => {
    const now = new Date('2026-03-23T12:00:00Z');
    const activeAlert: IAlertItem = {
      id: '1',
      severity: 'critical',
      title: 'Incidencia VPN',
      startAt: '2026-03-23T11:00:00Z',
      endAt: '2026-03-23T13:00:00Z'
    };

    const expiredAlert: IAlertItem = {
      id: '2',
      severity: 'warning',
      title: 'Aviso antiguo',
      startAt: '2026-03-22T11:00:00Z',
      endAt: '2026-03-23T11:30:00Z'
    };

    expect(isAlertActive(activeAlert, now)).toBe(true);
    expect(isAlertActive(expiredAlert, now)).toBe(false);
  });

  it('sorts by severity and priority and limits the list', () => {
    const alerts: IAlertItem[] = [
      { id: '3', severity: 'info', title: 'Info', priority: 5 },
      { id: '1', severity: 'critical', title: 'Critical', priority: 4 },
      { id: '2', severity: 'warning', title: 'Warning', priority: 1 }
    ];

    expect(sortAlerts(alerts).map((alert) => alert.id)).toEqual(['1', '2', '3']);
    expect(limitAlerts(alerts, 2).map((alert) => alert.id)).toEqual(['3', '1']);
  });

  it('keeps same-origin urls and rejects external ones', () => {
    expect(sameOriginUrl('/sites/hr/alerts.json', 'https://contoso.sharepoint.com/sites/hr')).toBe('/sites/hr/alerts.json');
    expect(sameOriginUrl('https://contoso.sharepoint.com/sites/hr/alerts.json', 'https://contoso.sharepoint.com/sites/hr')).toBe(
      '/sites/hr/alerts.json'
    );
    expect(sameOriginUrl('https://example.com/alerts.json', 'https://contoso.sharepoint.com/sites/hr')).toBeUndefined();
  });
});

