import { KpiCatalogService, normalizeKpiCards, sortKpiCards, getKpiCatalogState } from './kpiCatalogService';

describe('kpiCatalogService', () => {
  it('sorts by priority, then severity, then label', () => {
    const items = sortKpiCards([
      {
        id: 'b',
        label: 'Beta',
        value: 10,
        unit: '',
        state: 'warning',
        trend: 'up',
        comparison: 'vs target',
        comparisonLabel: '',
        priority: 2,
        threshold: 5,
        thresholdDirection: 'above',
        badge: 'warning',
        description: '',
        openInNewTab: false,
        safeLink: undefined,
        hasPartialData: false
      },
      {
        id: 'a',
        label: 'Alpha',
        value: 10,
        unit: '',
        state: 'ok',
        trend: 'up',
        comparison: 'vs target',
        comparisonLabel: '',
        priority: 1,
        threshold: 5,
        thresholdDirection: 'above',
        badge: 'ok',
        description: '',
        openInNewTab: false,
        safeLink: undefined,
        hasPartialData: false
      }
    ]);

    expect(items.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('honours explicit state before badge and preserves empty values as partial data', () => {
    const [item] = normalizeKpiCards(
      [
        {
          id: 'kpi',
          label: 'Cobertura',
          value: undefined,
          state: 'warning',
          badge: 'ok',
          trend: 'up',
          comparison: 'vs última ejecución',
          openUrl: '/sites/quality'
        }
      ],
      {
        openInNewTab: false,
        showTrend: true
      }
    );

    expect(item.state).toBe('warning');
    expect(item.badge).toBe('ok');
    expect(item.value).toBeUndefined();
    expect(item.hasPartialData).toBe(true);
  });

  it('falls back to badge when state is omitted', () => {
    const [item] = normalizeKpiCards(
      [
        {
          id: 'kpi',
          label: 'Cobertura',
          value: 97,
          badge: 'critical',
          trend: 'up',
          comparison: 'vs objetivo',
          openUrl: '/sites/quality'
        }
      ],
      {
        openInNewTab: false,
        showTrend: true
      }
    );

    expect(item.state).toBe('critical');
  });

  it('resolves ready state from a successful repository', async () => {
    const service = new KpiCatalogService({
      load: async () => ({
        inputs: [
          {
            id: 'kpi',
            label: 'Capacidad',
            value: 82,
            unit: '%',
            trend: 'up',
            comparison: 'vs objetivo',
            openUrl: '/sites/ops'
          }
        ],
        sourceLabel: 'Static configuration',
        hasPartialData: false,
        notes: []
      })
    } as never);

    const result = await service.resolveCatalog({
      sourceType: 'StaticConfig',
      kpiCardsJson: '[]',
      jsonUrl: '',
      apiEndpointUrl: '',
      listTitleOrUrl: '',
      webUrl: '',
      showTrend: true,
      layoutMode: 'compact',
      maxItems: 20,
      openInNewTab: false
    });

    expect(result.status).toBe('ready');
    expect(result.items).toHaveLength(1);
  });

  it('maps empty data to the empty state', () => {
    expect(
      getKpiCatalogState({
        isLoading: false,
        hasError: false,
        hasPartialData: false,
        hasData: false
      })
    ).toBe('empty');
  });
});
