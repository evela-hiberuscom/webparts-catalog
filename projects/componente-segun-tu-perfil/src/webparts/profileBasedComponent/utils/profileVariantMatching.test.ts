import { buildCurrentProfileTokens, normalizeToken, splitTokens } from './profileTokens';
import { isSameOriginUrl, resolveProfileVariant } from './profileVariantMatching';
import type { IProfileVariant } from '../models/profileBasedComponentModels';

describe('profile token helpers', () => {
  it('normalizes and splits tokens predictably', () => {
    expect(normalizeToken('Área Comercial')).toBe('area-comercial');
    expect(splitTokens('sales, es | north')).toEqual(['sales', 'es', 'north']);
  });

  it('builds tokens from the available profile snapshot', () => {
    expect(
      buildCurrentProfileTokens(
        {
          siteUrl: 'https://contoso.sharepoint.com/sites/portal',
          displayName: 'Ana Pérez',
          email: 'ana.perez@contoso.com',
          loginName: 'i:0#.f|membership|ana.perez@contoso.com',
          profileTokens: 'sales;es'
        },
        'hybrid'
      )
    ).toContain('sales');
  });
});

describe('profile variant matching', () => {
  const genericVariant: IProfileVariant = {
    id: 'generic',
    title: 'General',
    summary: 'General summary',
    body: 'General body',
    audienceTokens: [],
    isGeneric: true,
    contentType: 'card',
    tags: ['general'],
    payload: {}
  };

  const specificVariant: IProfileVariant = {
    id: 'sales',
    title: 'Ventas',
    summary: 'Specific summary',
    body: 'Specific body',
    audienceTokens: ['sales', 'es'],
    isGeneric: false,
    contentType: 'card',
    tags: ['sales'],
    payload: {}
  };

  it('selects the specific variant when tokens match', () => {
    const result = resolveProfileVariant([genericVariant, specificVariant], ['sales', 'es'], 'generic');

    expect(result.variant?.id).toBe('sales');
    expect(result.state).toBe('ready');
    expect(result.fallbackApplied).toBe(false);
  });

  it('falls back to generic and marks partial data when no specific match exists', () => {
    const result = resolveProfileVariant([genericVariant, specificVariant], ['it'], 'generic');

    expect(result.variant?.id).toBe('generic');
    expect(result.state).toBe('partialData');
    expect(result.fallbackApplied).toBe(true);
  });

  it('returns empty when fallback mode is empty and no specific match exists', () => {
    const result = resolveProfileVariant([genericVariant, specificVariant], ['it'], 'empty');

    expect(result.state).toBe('empty');
    expect(result.variant).toBeUndefined();
  });

  it('returns empty when no variants exist', () => {
    const result = resolveProfileVariant([], ['it'], 'empty');

    expect(result.state).toBe('empty');
    expect(result.variant).toBeUndefined();
  });

  it('validates same-origin urls', () => {
    expect(isSameOriginUrl('/sites/site/variants.json', 'https://contoso.sharepoint.com/sites/site')).toBe(true);
    expect(isSameOriginUrl('https://example.com/variants.json', 'https://contoso.sharepoint.com/sites/site')).toBe(false);
  });
});
