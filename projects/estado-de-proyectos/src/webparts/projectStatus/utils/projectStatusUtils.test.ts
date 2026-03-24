import {
  buildAvailableFilters,
  buildProjectStatusItem,
  buildProjectStatusResult,
  filterProjectItems,
  normalizeProjectRecord,
  normalizeProjectStatus,
  sortProjectItems
} from './projectStatusUtils';

describe('projectStatusUtils', () => {
  it('normalizes status labels into the supported palette', () => {
    expect(normalizeProjectStatus('at risk')).toBe('red');
    expect(normalizeProjectStatus('on track')).toBe('green');
    expect(normalizeProjectStatus('watch')).toBe('amber');
    expect(normalizeProjectStatus('')).toBe('unknown');
  });

  it('normalizes records from alternative field names', () => {
    const record = normalizeProjectRecord({
      Title: '  Programa CRM ',
      Status: 'warning',
      Owner: 'Equipo Comercial',
      RelevantDate: '2026-03-28',
      OpenUrl: '/sites/crm',
      Category: 'Comercial'
    });

    expect(record.id).toBe('Programa CRM');
    expect(record.title).toBe('Programa CRM');
    expect(record.owner).toBe('Equipo Comercial');
    expect(record.category).toBe('Comercial');
  });

  it('builds a partial item when the URL is unsafe or data is missing', () => {
    const unsafeUrl = ['java', 'script:alert(1)'].join('');

    const item = buildProjectStatusItem({
      id: '1',
      title: 'Portal interno',
      status: 'green',
      openUrl: unsafeUrl
    });

    expect(item.status).toBe('green');
    expect(item.hasPartialData).toBe(true);
    expect(item.safeLink).toBeUndefined();
  });

  it('sorts items by severity and date', () => {
    const sorted = sortProjectItems([
      buildProjectStatusItem({ id: 'c', title: 'C', status: 'green', relevantDate: '2026-04-01' }),
      buildProjectStatusItem({ id: 'a', title: 'A', status: 'red', relevantDate: '2026-04-02' }),
      buildProjectStatusItem({ id: 'b', title: 'B', status: 'amber', relevantDate: '2026-03-28' })
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters items by the selected status', () => {
    const items = [
      buildProjectStatusItem({ id: 'a', title: 'A', status: 'red' }),
      buildProjectStatusItem({ id: 'b', title: 'B', status: 'green' })
    ];

    expect(filterProjectItems(items, 'green')).toHaveLength(1);
    expect(filterProjectItems(items, 'all')).toHaveLength(2);
  });

  it('builds a result with the inferred default filter included', () => {
    const result = buildProjectStatusResult(
      {
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: 'ProjectsList',
        maxItems: 8,
        defaultStatusFilter: 'amber',
        showOwner: true
      },
      'StaticConfig',
      [
        { id: 'a', title: 'A', status: 'red' },
        { id: 'b', title: 'B', status: 'green' }
      ]
    );

    expect(result.totalCount).toBe(2);
    expect(buildAvailableFilters(result.items, 'amber')).toContain('amber');
  });
});
