import {
  buildAlphabetIndex,
  filterGlossaryItems,
  splitAliases,
  sortGlossaryItems
} from '../utils/corporateGlossaryUtils';

describe('corporateGlossaryUtils', () => {
  it('splits aliases from strings and mixed values', () => {
    expect(splitAliases('API; Plataforma')).toEqual(['API', 'Plataforma']);
  });

  it('sorts featured items first and then by category/title', () => {
    const result = sortGlossaryItems([
      { id: '1', title: 'Beta', definition: 'd', aliases: [], featured: false, partialData: false, category: 'RRHH' },
      { id: '2', title: 'Alpha', definition: 'd', aliases: [], featured: true, partialData: false, category: 'IT' }
    ]);

    expect(result[0].id).toBe('2');
  });

  it('builds alphabet letters from titles', () => {
    expect(buildAlphabetIndex([
      { id: '1', title: 'Árbol', definition: 'd', aliases: [], featured: false, partialData: false },
      { id: '2', title: 'Beta', definition: 'd', aliases: [], featured: false, partialData: false }
    ])).toEqual(['A', 'B']);
  });

  it('filters and prioritizes exact glossary matches', () => {
    const items = filterGlossaryItems([
      { id: '1', title: 'API', definition: 'Interfaz', aliases: ['Plataforma'], category: 'IT', relatedUrl: 'https://example.com', updatedAt: undefined, featured: false, partialData: false },
      { id: '2', title: 'Portal', definition: 'Sitio', aliases: ['API'], category: 'IT', relatedUrl: 'https://example.com', updatedAt: undefined, featured: false, partialData: false }
    ], 'API', '', 'ALL', 'General');

    expect(items[0].title).toBe('API');
  });
});
