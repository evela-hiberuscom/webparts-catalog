import { filterTemplates, normalizeCategory, sortTemplates } from '../utils/templatesLibraryUtils';

describe('templatesLibraryUtils', () => {
  it('assigns the fallback category when metadata is missing', () => {
    expect(normalizeCategory(undefined, 'General')).toBe('General');
  });

  it('sorts featured templates first and then by category and title', () => {
    const result = sortTemplates([
      { id: '1', title: 'B plantilla', templateType: 'Word', category: 'General', featured: false },
      { id: '2', title: 'A plantilla', templateType: 'PowerPoint', category: 'Brand', featured: true }
    ]);

    expect(result[0].id).toBe('2');
  });

  it('filters by query, category, and type', () => {
    const result = filterTemplates([
      { id: '1', title: 'Deck comercial', templateType: 'PowerPoint', category: 'Ventas', featured: false },
      { id: '2', title: 'Contrato', templateType: 'Word', category: 'Legal', featured: false }
    ], 'deck', 'Ventas', 'PowerPoint');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
