import { filterChangesByType, formatDate, isPartialChange, sortChanges } from '../utils/whatChangedFeedUtils';

describe('whatChangedFeedUtils', () => {
  it('formats dates', () => {
    expect(formatDate('2026-04-08T09:00:00.000Z', 'es-ES')).toBeTruthy();
  });

  it('filters by type', () => {
    const result = filterChangesByType([
      { id: '1', title: 'A', type: 'Policy', changedAt: '2026-04-08T09:00:00.000Z', summary: 'x', featured: false },
      { id: '2', title: 'B', type: 'Document', changedAt: '2026-04-07T09:00:00.000Z', summary: 'y', featured: false }
    ], 'Policy');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('detects partial changes', () => {
    expect(isPartialChange({ id: '1', title: 'A', type: 'Policy', featured: false })).toBe(true);
  });

  it('sorts by changed date descending', () => {
    const result = sortChanges([
      { id: '1', title: 'A', type: 'Policy', changedAt: '2026-04-07T09:00:00.000Z', summary: 'x', featured: false },
      { id: '2', title: 'B', type: 'Policy', changedAt: '2026-04-08T09:00:00.000Z', summary: 'y', featured: false }
    ]);

    expect(result[0].id).toBe('2');
  });
});
