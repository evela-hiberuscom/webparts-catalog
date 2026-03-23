import type { IKpiCatalogConfig } from '../models/kpiModels';
import { KpiCatalogRepository } from './kpiCatalogRepository';

function buildConfig(overrides: Partial<IKpiCatalogConfig> = {}): IKpiCatalogConfig {
  return {
    sourceType: 'StaticConfig',
    kpiCardsJson: '',
    jsonUrl: '',
    apiEndpointUrl: '',
    sharePointListTitle: '',
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    showTrend: true,
    layoutMode: 'compact',
    maxItems: 20,
    openInNewTab: false,
    ...overrides
  };
}

function createResponse(payload: unknown): { ok: boolean; status: number; json: () => Promise<unknown> } {
  return {
    ok: true,
    status: 200,
    json: async () => payload
  };
}

describe('kpiCatalogRepository', () => {
  it('treats an empty StaticConfig payload as an empty source instead of a sample set', async () => {
    const repository = new KpiCatalogRepository();
    const result = await repository.load(buildConfig());

    expect(result.inputs).toHaveLength(0);
    expect(result.sourceLabel).toBe('Static configuration (empty)');
    expect(result.hasPartialData).toBe(false);
  });

  it('rejects malformed StaticConfig JSON shapes', async () => {
    const repository = new KpiCatalogRepository();
    const result = await repository.load(
      buildConfig({
        kpiCardsJson: JSON.stringify({
          title: 'no collection here'
        })
      })
    );

    expect(result.inputs).toHaveLength(0);
    expect(result.sourceLabel).toBe('Static configuration (invalid)');
    expect(result.errorMessage).toContain('Expected an array payload or a payload with items/value/results collections');
  });

  it('loads SharePoint list results from d.results', async () => {
    const fetcher = jest.fn(async () =>
      createResponse({
        d: {
          results: [
            {
              ID: 1,
              Title: 'Capacidad',
              Value: 96,
              Trend: 'up',
              Comparison: 'vs objetivo',
              OpenUrl: '/sites/ops'
            }
          ]
        }
      })
    );

    const repository = new KpiCatalogRepository(fetcher as never);
    const result = await repository.load(
      buildConfig({
        sourceType: 'SharePointList',
        sharePointListTitle: "KPI's",
        kpiCardsJson: ''
      })
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/intranet/_api/web/lists/getbytitle('KPI''s')/items?$top=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json'
        })
      })
    );
    expect(result.inputs).toHaveLength(1);
    expect(result.inputs[0].label).toBe('Capacidad');
    expect(result.inputs[0].value).toBe(96);
    expect(result.sourceLabel).toBe("SharePoint list: KPI's");
    expect(result.hasPartialData).toBe(false);
  });

  it.each([
    {
      sourceType: 'JsonUrl' as const,
      urlKey: 'jsonUrl',
      urlValue: 'kpis.json',
      expectedLabel: 'JSON URL (same-origin)'
    },
    {
      sourceType: 'ApiEndpoint' as const,
      urlKey: 'apiEndpointUrl',
      urlValue: './_api/kpis',
      expectedLabel: 'API endpoint (same-origin)'
    }
  ])('loads $sourceType from a same-origin relative URL', async ({ sourceType, urlKey, urlValue, expectedLabel }) => {
    const fetcher = jest.fn(async () =>
      createResponse([
        {
          id: 'kpi-1',
          label: 'Cobertura',
          value: 98,
          trend: 'up',
          comparison: 'vs objetivo',
          openUrl: '/sites/quality'
        }
      ])
    );

    const repository = new KpiCatalogRepository(fetcher as never);
    const expectedUrl = new URL(urlValue, 'https://contoso.sharepoint.com/sites/intranet').toString();
    const result = await repository.load(
      buildConfig({
        sourceType,
        [urlKey]: urlValue
      })
    );

    expect(fetcher).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }));
    expect(result.inputs).toHaveLength(1);
    expect(result.sourceLabel).toBe(expectedLabel);
  });

  it.each([
    {
      sourceType: 'JsonUrl' as const,
      urlKey: 'jsonUrl',
      urlValue: 'https://evil.example.com/kpis.json',
      expectedMessage: 'jsonUrl must be same-origin or relative'
    },
    {
      sourceType: 'ApiEndpoint' as const,
      urlKey: 'apiEndpointUrl',
      urlValue: 'https://evil.example.com/api/kpis',
      expectedMessage: 'apiEndpointUrl must be same-origin or relative'
    }
  ])('rejects arbitrary hosts for $sourceType', async ({ sourceType, urlKey, urlValue, expectedMessage }) => {
    const repository = new KpiCatalogRepository();

    await expect(
      repository.load(
        buildConfig({
          sourceType,
          [urlKey]: urlValue
        })
      )
    ).rejects.toThrow(expectedMessage);
  });
});
