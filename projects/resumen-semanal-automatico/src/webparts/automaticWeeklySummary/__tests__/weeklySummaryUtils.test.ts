import {
  addDays,
  collectSourceNames,
  formatShortDate,
  getWeeklySummaryRange,
  isDateInRange,
  normalizeHighlightType,
  parseCustomDate,
  sortHighlights,
  startOfWeek,
  toDateKey,
  truncateHighlights
} from '../utils/weeklySummaryUtils';

describe('weeklySummaryUtils', () => {
  const referenceDate = new Date(2026, 2, 25, 12, 0, 0);

  it('derives week ranges and date labels', () => {
    const currentWeek = getWeeklySummaryRange('currentWeek', referenceDate);
    const previousWeek = getWeeklySummaryRange('previousWeek', referenceDate);
    const customRange = getWeeklySummaryRange('customRange', referenceDate, '2026-03-10', '2026-03-14');

    expect(toDateKey(startOfWeek(referenceDate))).toBe('2026-03-23');
    expect(toDateKey(addDays(startOfWeek(referenceDate), 7))).toBe('2026-03-30');
    expect(currentWeek.label).toContain('Semana actual');
    expect(previousWeek.label).toContain('Semana anterior');
    expect(customRange.isCustom).toBe(true);
    expect(customRange.label).toContain('Periodo personalizado');
    expect(formatShortDate(new Date(2026, 2, 23, 12, 0, 0))).toBe('23 mar');
  });

  it('normalizes types, parses dates and filters within range', () => {
    const range = getWeeklySummaryRange('currentWeek', referenceDate);

    expect(parseCustomDate('2026-03-12')).toBeInstanceOf(Date);
    expect(parseCustomDate('invalid')).toBeUndefined();
    expect(normalizeHighlightType('hito semanal', 'Milestones')).toBe('milestone');
    expect(normalizeHighlightType(undefined, 'Incidents')).toBe('incident');
    expect(isDateInRange('2026-03-24T23:15:00Z', range)).toBe(true);
    expect(isDateInRange('2026-03-30T00:00:00Z', range)).toBe(false);
  });

  it('sorts, truncates and deduplicates source names', () => {
    const items = sortHighlights([
      {
        id: 'b',
        title: 'B',
        highlightType: 'generic',
        date: '2026-03-25',
        openUrl: '/b',
        priority: 1,
        sourceName: 'News'
      },
      {
        id: 'a',
        title: 'A',
        highlightType: 'generic',
        date: '2026-03-24',
        openUrl: '/a',
        priority: 3,
        sourceName: 'Incidents'
      },
      {
        id: 'c',
        title: 'C',
        highlightType: 'generic',
        date: '2026-03-23',
        openUrl: '/c',
        priority: 3,
        sourceName: 'Incidents'
      }
    ]);

    expect(items.map((item) => item.id)).toEqual(['a', 'c', 'b']);
    expect(truncateHighlights(items, 2).map((item) => item.id)).toEqual(['a', 'c']);
    expect(collectSourceNames(items)).toEqual(['Incidents', 'News']);
  });
});
