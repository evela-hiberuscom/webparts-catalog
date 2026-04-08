jest.mock('UpcomingMilestonesWebPartStrings', () => ({
  NoDateLabel: 'Sin fecha'
}), { virtual: true });

import { formatMilestoneDate, isMilestoneSoon, normalizeMilestoneItem, sortMilestones } from '../utils/upcomingMilestonesUtils';

describe('upcomingMilestonesUtils', () => {
  it('sorts milestones with missing dates at the end', () => {
    const result = sortMilestones([
      { id: '3', title: 'Sin fecha', isPartial: true, isSoon: false },
      { id: '2', title: 'B', date: '2026-04-11T09:00:00.000Z', type: 'Ops', isPartial: false, isSoon: false },
      { id: '1', title: 'A', date: '2026-04-09T09:00:00.000Z', type: 'Ops', isPartial: false, isSoon: false }
    ]);

    expect(result.map((item) => item.id)).toEqual(['1', '2', '3']);
  });

  it('marks milestones inside the next seven days as soon', () => {
    expect(isMilestoneSoon('2026-04-10T09:00:00.000Z', new Date('2026-04-08T12:00:00.000Z'))).toBe(true);
    expect(isMilestoneSoon('2026-04-20T09:00:00.000Z', new Date('2026-04-08T12:00:00.000Z'))).toBe(false);
  });

  it('formats missing dates with the fallback label', () => {
    expect(formatMilestoneDate(undefined, 'es-ES')).toBe('Sin fecha');
  });

  it('normalizes raw items and flags missing type as partial', () => {
    const result = normalizeMilestoneItem(
      { id: '1', title: 'Cierre', date: '2026-04-10T09:00:00.000Z', detailUrl: '/sites/comms/q2' },
      0,
      'https://contoso.sharepoint.com/sites/comms',
      new Date('2026-04-08T12:00:00.000Z')
    );

    expect(result.isPartial).toBe(true);
    expect(result.detailUrl).toContain('/sites/comms/q2');
  });
});
