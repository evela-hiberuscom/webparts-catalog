import {
  ALL_CATEGORIES_LABEL,
  buildFallbackQuickActions,
  filterQuickActions,
  hasPartialQuickAction,
  normalizeQuickAction,
  sortQuickActions,
  uniqueCategories
} from './quickActionsUtils';

describe('quickActionsUtils', () => {
  it('normalizes quick actions and skips empty titles', () => {
    expect(
      normalizeQuickAction(
        {
          title: '  Abrir soporte  ',
          description: '',
          category: '',
          icon: '',
          openUrl: '  '
        },
        0,
        'Operaciones'
      )
    ).toEqual({
      id: 'quick-action-1',
      title: 'Abrir soporte',
      description: 'Sin descripción disponible.',
      category: 'Operaciones',
      icon: 'Page',
      priority: undefined,
      openUrl: undefined
    });

    expect(normalizeQuickAction({ title: '   ' }, 1, 'General')).toBeUndefined();
  });

  it('sorts, filters and deduplicates categories', () => {
    const items = sortQuickActions(buildFallbackQuickActions());
    expect(items[0].title).toBe('Soporte');
    expect(uniqueCategories(items)).toEqual(['IT', 'Operaciones', 'RRHH', 'Documentación', 'Equipo']);
    expect(filterQuickActions(items, ALL_CATEGORIES_LABEL)).toHaveLength(items.length);
    expect(filterQuickActions(items, 'IT')).toHaveLength(1);
  });

  it('flags partial quick actions when metadata is missing', () => {
    expect(
      hasPartialQuickAction({
        id: 'x',
        title: 'Acceso',
        description: '',
        category: 'General',
        icon: 'Page',
        openUrl: undefined
      })
    ).toBe(true);
  });
});
