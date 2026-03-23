import {
  applyMaxItems,
  filterLaunchItems,
  getLaunchCategories,
  getLaunchCatalogState,
  sortLaunchItems
} from './launchCatalogService';
import type { ILaunchItem } from '../models/launchModels';

const sampleItems: ILaunchItem[] = [
  {
    id: 'b',
    title: 'Biblioteca',
    category: 'Operaciones',
    audienceTokens: ['general'],
    description: 'Documentos útiles',
    iconName: 'Page',
    priority: 2,
    featured: false,
    openUrl: '/sites/library',
    openInNewTab: false
  },
  {
    id: 'a',
    title: 'Acceso urgente',
    category: 'RRHH',
    audienceTokens: ['hr'],
    description: 'Acceso prioritario',
    iconName: 'Contact',
    priority: 1,
    featured: true,
    openUrl: '/sites/hr',
    openInNewTab: false
  },
  {
    id: 'c',
    title: 'Caja de herramientas',
    category: 'Navegación',
    audienceTokens: ['general'],
    description: 'Atajos',
    iconName: 'Wrench',
    priority: undefined,
    featured: false,
    openUrl: '/sites/tools',
    openInNewTab: false
  }
];

describe('launchCatalogService', () => {
  it('sorts featured items first and then by priority', () => {
    const result = sortLaunchItems(sampleItems);
    expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters by query and category', () => {
    const result = filterLaunchItems(sampleItems, 'herramientas', 'Navegación', ['general']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c');
  });

  it('returns categories with All first', () => {
    expect(getLaunchCategories(sampleItems)).toEqual(['All', 'Navegación', 'Operaciones', 'RRHH']);
  });

  it('limits the number of items when requested', () => {
    expect(applyMaxItems(sampleItems, 2)).toHaveLength(2);
  });

  it('maps partial state correctly', () => {
    expect(
      getLaunchCatalogState({
        isLoading: false,
        hasError: false,
        hasPartialData: true,
        hasData: true
      })
    ).toBe('partialData');
  });
});
