import {
  extractMatchedTags,
  formatNewsDate,
  isNewsByAreaItemPartial,
  sortNewsByAreaItems
} from '../utils/newsByAreaUtils';

describe('newsByAreaUtils', () => {
  it('matches tags against the normalized area filter', () => {
    expect(extractMatchedTags(['Área IT', 'HR'], 'area it')).toEqual(['Área IT']);
  });

  it('formats published dates', () => {
    expect(formatNewsDate('2026-04-08T09:00:00.000Z', 'es-ES')).toBeTruthy();
  });

  it('detects partial items', () => {
    expect(isNewsByAreaItemPartial({ id: '1', title: 'Nueva guardia IT', tags: [], isFeatured: false })).toBe(true);
  });

  it('marks the first item as featured when requested', () => {
    const result = sortNewsByAreaItems([
      { id: '1', title: 'Old', tags: ['IT'], publishedAt: '2026-04-07T09:00:00.000Z', isFeatured: false },
      { id: '2', title: 'New', tags: ['IT'], publishedAt: '2026-04-08T09:00:00.000Z', isFeatured: false }
    ], true);

    expect(result[0].id).toBe('2');
    expect(result[0].isFeatured).toBe(true);
  });
});
