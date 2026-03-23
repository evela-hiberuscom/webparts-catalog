import {
  createSafeLinkProps,
  describeSource,
  getDefaultFavorites,
  isPartialFavorite,
  limitFavorites,
  normalizeFavoriteItem,
  parseFavoritesJson,
  sanitizeOpenUrl,
  sortFavorites
} from './favoritesUtils';

describe('favoritesUtils', () => {
  it('falls back to sample favorites when JSON is empty', () => {
    const result = parseFavoritesJson('');

    expect(result.items).toHaveLength(getDefaultFavorites().length);
    expect(result.warnings).toHaveLength(1);
  });

  it('normalizes favorite items with defaults', () => {
    const item = normalizeFavoriteItem({ title: ' Portal Comercial ', type: 'site', featured: 'true' }, 0);

    expect(item.id).toBe('portal-comercial');
    expect(item.title).toBe('Portal Comercial');
    expect(item.icon).toBe('Globe');
    expect(item.featured).toBe(true);
    expect(item.hasAction).toBe(false);
  });

  it('sorts featured items first and then by sort order', () => {
    const sorted = sortFavorites([
      normalizeFavoriteItem({ title: 'B', sortOrder: 2 }, 1),
      normalizeFavoriteItem({ title: 'A', featured: true, sortOrder: 3 }, 0),
      normalizeFavoriteItem({ title: 'C', sortOrder: 1 }, 2)
    ]);

    expect(sorted.map((item) => item.title)).toEqual(['A', 'C', 'B']);
  });

  it('limits favorites to the requested amount', () => {
    const limited = limitFavorites(getDefaultFavorites().map((item, index) => normalizeFavoriteItem(item, index)), 2);

    expect(limited).toHaveLength(2);
  });

  it('marks items without links as partial', () => {
    const item = normalizeFavoriteItem({ title: 'Sin enlace' }, 0);

    expect(isPartialFavorite(item)).toBe(true);
  });

  it('rejects unsafe openUrl values', () => {
    const unsafeUrl = ['java', 'script:alert(1)'].join('');

    expect(sanitizeOpenUrl(unsafeUrl)).toBeUndefined();
    expect(createSafeLinkProps(unsafeUrl)).toBeUndefined();
  });

  it('describes the configured source', () => {
    expect(describeSource('SharePointList', 'FavoritesList')).toContain('FavoritesList');
  });
});
