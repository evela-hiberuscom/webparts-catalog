import { HighlightedIncidentsService } from '../services/highlightedIncidentsService';
import type { IHighlightedIncidentsRepository } from '../models/highlightedIncidentModels';

describe('HighlightedIncidentsService', () => {
  function createRepository(items: Array<Record<string, unknown>>): IHighlightedIncidentsRepository {
    return {
      loadIncidents: jest.fn().mockResolvedValue(items)
    };
  }

  it('filters resolved items when configured and tracks partial data', async () => {
    const repository = createRepository([
      {
        Id: 101,
        Title: 'Critica',
        Severity: 'Critical',
        Impact: 'Impacto importante',
        Status: 'Active',
        Workaround: 'Usar plan alternativo',
        ETA: '2026-03-25T10:30:00Z',
        DetailUrl: '/incidents/critical',
        SourceName: 'IncidentsList'
      },
      {
        Id: 102,
        Title: 'Resuelta',
        Severity: 'Medium',
        Impact: 'Impacto menor',
        Status: 'Resolved',
        Workaround: 'No aplica',
        ETA: '2026-03-24T12:00:00Z',
        DetailUrl: '/incidents/resolved',
        SourceName: 'IncidentsList'
      },
      {
        Id: 103,
        Title: 'Parcial',
        Severity: 'Low',
        Status: 'Monitoring',
        SourceName: 'IncidentsList'
      },
      {
        Id: 104,
        Title: 'Desconocida',
        Severity: 'Low',
        Status: 'Paused',
        SourceName: 'IncidentsList'
      }
    ]);

    const service = new HighlightedIncidentsService(repository);
    const result = await service.loadOverview({
      title: 'Estado de incidencias destacadas',
      subtitle: 'Seguimiento compacto',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'IncidentsList',
      showResolved: false,
      maxItems: 5
    });

    expect(result.items.map((item) => item.title)).toEqual(['Critica', 'Parcial']);
    expect(result.items.map((item) => item.id)).toEqual(['101', '103']);
    expect(result.resolvedCount).toBe(0);
    expect(result.hiddenResolvedCount).toBe(1);
    expect(result.hasPartialData).toBe(true);
    expect(result.status).toBe('partialData');
    expect(result.activeCount).toBe(1);
  });

  it('includes resolved items only when the configuration allows it', async () => {
    const repository = createRepository([
      {
        Id: 201,
        Title: 'Resuelta',
        Severity: 'High',
        Impact: 'Impacto controlado',
        Status: 'Resolved',
        Workaround: 'No aplica',
        ETA: '2026-03-24T12:00:00Z',
        DetailUrl: '/incidents/resolved',
        SourceName: 'IncidentsList'
      }
    ]);
    const service = new HighlightedIncidentsService(repository);

    const result = await service.loadOverview({
      title: 'Estado de incidencias destacadas',
      subtitle: 'Seguimiento compacto',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'IncidentsList',
      showResolved: true,
      maxItems: 5
    });

    expect(result.items.map((item) => item.id)).toEqual(['201']);
    expect(result.resolvedCount).toBe(1);
    expect(result.hiddenResolvedCount).toBe(0);
    expect(result.status).toBe('ready');
  });

  it('returns empty when the source has no visible items', async () => {
    const repository = createRepository([]);
    const service = new HighlightedIncidentsService(repository);

    const result = await service.loadOverview({
      title: 'Estado de incidencias destacadas',
      subtitle: 'Seguimiento compacto',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/portal/data/incidents.json',
      showResolved: false,
      maxItems: 5
    });

    expect(result.items).toEqual([]);
    expect(result.status).toBe('empty');
    expect(result.hasPartialData).toBe(false);
  });
});
