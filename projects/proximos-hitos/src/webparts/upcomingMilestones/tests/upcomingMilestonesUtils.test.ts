jest.mock('UpcomingMilestonesWebPartStrings', () => ({
  NoDateLabel: 'Sin fecha'
}), { virtual: true });

import {
  formatMilestoneDate,
  isMilestoneSoon,
  mapSharePointMilestone,
  sortMilestonesByDate
} from '../utils/upcomingMilestonesUtils';

describe('upcomingMilestonesUtils', () => {
  it('sorts milestones with missing dates at the end', () => {
    const result = sortMilestonesByDate([
      { id: '3', title: 'Sin fecha' },
      { id: '2', title: 'B', date: '2026-04-11T09:00:00.000Z', type: 'Ops' },
      { id: '1', title: 'A', date: '2026-04-09T09:00:00.000Z', type: 'Ops' }
    ]);

    expect(result.map((item) => item.id)).toEqual(['1', '2', '3']);
  });

  it('marks milestones inside the next seven days as soon', () => {
    expect(isMilestoneSoon(
      { id: '1', title: 'Cierre', date: '2026-04-10T09:00:00.000Z' },
      new Date('2026-04-08T12:00:00.000Z')
    )).toBe(true);
    expect(isMilestoneSoon(
      { id: '2', title: 'Cierre', date: '2026-04-20T09:00:00.000Z' },
      new Date('2026-04-08T12:00:00.000Z')
    )).toBe(false);
  });

  it('formats missing dates as empty text', () => {
    expect(formatMilestoneDate(undefined, 'es-ES')).toBe('');
  });

  it('maps SharePoint items and resolves relative detail URLs', () => {
    const result = mapSharePointMilestone(
      { Id: 1, Title: 'Cierre', MilestoneDate: '2026-04-10T09:00:00.000Z', DetailUrl: '/sites/comms/q2' },
      'https://contoso.sharepoint.com/sites/comms'
    );

    expect(result.id).toBe('1');
    expect(result.title).toBe('Cierre');
    expect(result.detailUrl).toContain('/sites/comms/q2');
  });
});
