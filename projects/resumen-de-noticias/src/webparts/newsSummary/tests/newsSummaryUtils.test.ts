import { formatNewsDate, isNewsItemPartial, sortNewsItems } from '../utils/newsSummaryUtils';

describe('newsSummaryUtils', () => {
  it('formats published dates', () => {
    expect(formatNewsDate('2026-04-08T09:00:00.000Z', 'es-ES')).toBeTruthy();
  });

  it('detects partial items', () => {
    expect(isNewsItemPartial({ id: '1', title: 'Nueva política', isFeatured: false })).toBe(true);
  });

  it('marks the first item as featured when requested', () => {
    const result = sortNewsItems([
      { id: '1', title: 'Old', publishedAt: '2026-04-07T09:00:00.000Z', isFeatured: false },
      { id: '2', title: 'New', publishedAt: '2026-04-08T09:00:00.000Z', isFeatured: false }
    ], true);

    expect(result[0].id).toBe('2');
    expect(result[0].isFeatured).toBe(true);
  });
});
