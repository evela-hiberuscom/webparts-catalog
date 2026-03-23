import {
  ALL_CATEGORIES_LABEL,
  buildAudienceSummaryLabel,
  coerceAudienceLink,
  filterByCategory,
  getAudienceCategories,
  markPartialLink,
  matchAudienceLinkTokens,
  sortAudienceLinks,
  splitAudienceTokens
} from './audienceLinkUtils';

describe('audienceLinkUtils', () => {
  it('splits audience tokens from strings and arrays', () => {
    expect(splitAudienceTokens('sales, people; general\nall')).toEqual(['sales', 'people', 'general', 'all']);
    expect(splitAudienceTokens(['Finance', 'finance', 'Ops'])).toEqual(['finance', 'ops']);
  });

  it('coerces audience links with sensible defaults', () => {
    const item = coerceAudienceLink({ title: '  Portal comercial  ', audiences: ['sales'], openUrl: '/sites/sales' }, 0, 'General');

    expect(item).toMatchObject({
      title: 'Portal comercial',
      category: 'General',
      openUrl: '/sites/sales',
      audiences: ['sales'],
      isGeneric: false,
      sourceBadge: 'personalizado'
    });
  });

  it('sorts items by priority and title and exposes categories', () => {
    const items = sortAudienceLinks([
      coerceAudienceLink({ title: 'Beta', category: 'Operaciones', priority: 2, openUrl: '/b' }, 1, 'General'),
      coerceAudienceLink({ title: 'Alpha', category: 'General', priority: 1, openUrl: '/a' }, 0, 'General'),
      coerceAudienceLink({ title: 'Gamma', category: 'Operaciones', priority: 2, openUrl: '/c' }, 2, 'General')
    ]);

    expect(items.map((item) => item.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(getAudienceCategories(items)).toEqual([ALL_CATEGORIES_LABEL, 'General', 'Operaciones']);
  });

  it('matches generic items and filters by category', () => {
    const generic = markPartialLink(coerceAudienceLink({ title: 'General', isGeneric: true, openUrl: '/g' }, 0, 'General'));
    const specific = markPartialLink(coerceAudienceLink({ title: 'Sales', audiences: ['sales'], openUrl: '/s' }, 1, 'General'));

    expect(matchAudienceLinkTokens(generic, ['anything'])).toBe(true);
    expect(matchAudienceLinkTokens(specific, ['sales'])).toBe(true);
    expect(filterByCategory([generic, specific], 'General')).toHaveLength(2);
  });

  it('builds readable audience summary labels', () => {
    expect(buildAudienceSummaryLabel([], 'group')).toBe('Audiencia general');
    expect(buildAudienceSummaryLabel(['sales', 'people'], 'hybrid')).toBe('Audiencia híbrida: sales · people');
  });
});
