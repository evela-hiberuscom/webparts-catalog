import {
  countStaleServices,
  filterServices,
  formatDateTime,
  getLastUpdatedValue,
  isStale,
  mapServiceRecord,
  normalizeCriticality,
  normalizeStatus,
  sortServices
} from './internalServicesStatusUtils';

describe('internalServicesStatusUtils', () => {
  it('normalizes status and criticality aliases', () => {
    expect(normalizeStatus('Healthy')).toBe('ok');
    expect(normalizeStatus('planned-maintenance')).toBe('maintenance');
    expect(normalizeCriticality('P1')).toBe('high');
    expect(normalizeCriticality('minor')).toBe('low');
  });

  it('maps a source record with partial data and stale detection', () => {
    const item = mapServiceRecord(
      {
        id: 10,
        name: 'Portal comercial',
        status: 'warning',
        criticality: 'medium',
        summary: '',
        updatedAt: '2026-03-23T08:00:00.000Z',
        detailUrl: '/sites/details',
        domain: 'Comercio'
      },
      30,
      new Date('2026-03-23T09:00:00.000Z')
    );

    expect(item.id).toBe('10');
    expect(item.isPartial).toBe(true);
    expect(item.isStale).toBe(true);
    expect(item.domain).toBe('Comercio');
  });

  it('sorts services by severity and freshness', () => {
    const sorted = sortServices([
      {
        id: '1',
        name: 'B',
        status: 'ok',
        criticality: 'low',
        summary: 'B',
        updatedAt: '2026-03-23T08:00:00.000Z',
        isPartial: false,
        isStale: false
      },
      {
        id: '2',
        name: 'A',
        status: 'critical',
        criticality: 'high',
        summary: 'A',
        updatedAt: '2026-03-23T09:00:00.000Z',
        isPartial: false,
        isStale: false
      }
    ]);

    expect(sorted[0].id).toBe('2');
  });

  it('filters, counts stale items and resolves the latest timestamp', () => {
    const items = [
      {
        id: '1',
        name: 'A',
        status: 'critical',
        criticality: 'high',
        summary: 'A',
        updatedAt: '2026-03-23T08:00:00.000Z',
        isPartial: false,
        isStale: true
      },
      {
        id: '2',
        name: 'B',
        status: 'ok',
        criticality: 'low',
        summary: 'B',
        updatedAt: '2026-03-23T10:00:00.000Z',
        isPartial: false,
        isStale: false
      }
    ] as const;

    expect(filterServices(items as never, 'critical')).toHaveLength(1);
    expect(countStaleServices(items as never)).toBe(1);
    expect(getLastUpdatedValue(items as never)).toBe('2026-03-23T10:00:00.000Z');
  });

  it('formats dates and keeps invalid dates readable', () => {
    expect(formatDateTime('2026-03-23T10:00:00.000Z')).toContain('23 mar 2026');
    expect(formatDateTime('invalid')).toBe('Sin actualización');
    expect(isStale('2026-03-23T10:00:00.000Z', 0, new Date('2026-03-23T11:00:00.000Z'))).toBe(false);
  });
});
