import {
  normalizeGuide,
  normalizeSteps,
  sortGuides
} from './howDoIDoThisUtils';

describe('howDoIDoThisUtils', () => {
  it('normalizes steps from multiline text and category fallback', () => {
    const guide = normalizeGuide(
      {
        title: 'Cómo pedir material',
        summary: 'Resumen',
        steps: '1. Abre el portal\n2. Rellena el formulario',
        relatedUrl: '/sites/purchases/material'
      },
      0,
      'https://contoso.sharepoint.com/sites/intranet'
    );

    expect(guide?.steps).toEqual(['Abre el portal', 'Rellena el formulario']);
    expect(guide?.category).toBe('General');
    expect(guide?.isPartial).toBe(true);
  });

  it('sorts featured guides before the rest', () => {
    const sorted = sortGuides([
      {
        id: 'b',
        title: 'B',
        summary: 'B',
        category: 'General',
        steps: ['One'],
        featured: false,
        isPartial: false
      },
      {
        id: 'a',
        title: 'A',
        summary: 'A',
        category: 'General',
        steps: ['One'],
        featured: true,
        isPartial: false
      }
    ]);

    expect(sorted[0].title).toBe('A');
  });

  it('supports JSON arrays for steps', () => {
    expect(normalizeSteps('["Uno","Dos"]')).toEqual(['Uno', 'Dos']);
  });
});
