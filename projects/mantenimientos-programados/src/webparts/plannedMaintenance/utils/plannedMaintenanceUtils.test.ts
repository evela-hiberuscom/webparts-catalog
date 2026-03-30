import {
  classifyMaintenanceStatus,
  filterCompleted,
  normalizeListTarget,
  normalizeMaintenanceItem,
  sortMaintenanceItems
} from './plannedMaintenanceUtils';

describe('plannedMaintenanceUtils', () => {
  const now = new Date('2026-03-30T10:00:00Z');

  it('classifies upcoming, inProgress, completed and unknown', () => {
    expect(classifyMaintenanceStatus(new Date('2026-03-31T10:00:00Z'), new Date('2026-03-31T11:00:00Z'), now)).toBe('upcoming');
    expect(classifyMaintenanceStatus(new Date('2026-03-30T09:00:00Z'), new Date('2026-03-30T11:00:00Z'), now)).toBe('inProgress');
    expect(classifyMaintenanceStatus(new Date('2026-03-29T09:00:00Z'), new Date('2026-03-29T11:00:00Z'), now)).toBe('completed');
    expect(classifyMaintenanceStatus(undefined, undefined, now)).toBe('unknown');
  });

  it('marks partial data when dates or impact are missing', () => {
    const item = normalizeMaintenanceItem(
      {
        Title: 'ERP',
        StartAt: '2026-03-31T10:00:00Z',
        Impact: 'high'
      },
      'x',
      now
    );

    expect(item.partialData).toBe(true);
    expect(item.status).toBe('unknown');
  });

  it('sorts in-progress first and hides completed when asked', () => {
    const items = [
      normalizeMaintenanceItem(
        { Title: 'Completed', StartAt: '2026-03-29T09:00:00Z', EndAt: '2026-03-29T11:00:00Z', Impact: 'low' },
        'a',
        now
      ),
      normalizeMaintenanceItem(
        { Title: 'Upcoming', StartAt: '2026-03-31T09:00:00Z', EndAt: '2026-03-31T11:00:00Z', Impact: 'medium' },
        'b',
        now
      ),
      normalizeMaintenanceItem(
        { Title: 'In progress', StartAt: '2026-03-30T09:00:00Z', EndAt: '2026-03-30T11:00:00Z', Impact: 'high' },
        'c',
        now
      )
    ];

    const sorted = sortMaintenanceItems(items);
    expect(sorted[0]?.title).toBe('In progress');
    expect(filterCompleted(sorted, true).map((item) => item.title)).toEqual(['In progress', 'Upcoming']);
  });

  it('normalizes list URLs from AllItems view', () => {
    const target = normalizeListTarget(
      'https://contoso.sharepoint.com/sites/demo/Lists/MaintenanceList/Forms/AllItems.aspx',
      'https://contoso.sharepoint.com/sites/demo'
    );

    expect(target).toEqual({
      kind: 'url',
      value: '/sites/demo/Lists/MaintenanceList'
    });
  });
});
