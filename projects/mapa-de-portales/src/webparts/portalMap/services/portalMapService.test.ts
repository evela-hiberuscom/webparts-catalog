jest.mock(
  'PortalMapWebPartStrings',
  () => ({
    SourceLabelStaticConfig: 'Static sample',
    SourceLabelJsonUrl: 'JSON',
    SourceLabelSharePointList: 'SharePoint list',
    PartialNoActionWarning: 'Some nodes are informative only.',
    PartialUnknownTypeWarning: 'Some nodes do not define a supported type.',
    PartialOrphanWarning: 'Some nodes do not have a valid parent.',
    PartialCycleWarning: 'A cyclic relationship was detected.',
    PartialDepthWarning: 'The configured maximum depth trims deeper levels.',
    StateErrorMessage: 'Review the configured source and try again later.'
  }),
  { virtual: true }
);

import { PortalMapService } from './portalMapService';
import type { IPortalMapRepositoryResult, IPortalMapRequest } from '../models/portalMapModels';

function createRequest(overrides: Partial<IPortalMapRequest> = {}): IPortalMapRequest {
  return {
    dataSourceType: 'SharePointList',
    listTitleOrUrl: 'PortalMapList',
    viewMode: 'tree',
    maxDepth: 4,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    ...overrides
  };
}

describe('PortalMapService', () => {
  it('returns partialData when orphan nodes exist', async () => {
    const repository = {
      load: jest.fn<Promise<IPortalMapRepositoryResult>, [IPortalMapRequest]>().mockResolvedValue({
        hasPartialData: false,
        items: [
          {
            id: 'hub-1',
            title: 'Hub Comercial',
            nodeType: 'hub',
            openUrl: '/sites/sales-hub',
            featured: true,
            sortOrder: 1,
            partialData: false
          },
          {
            id: 'site-1',
            title: 'Portal Clientes',
            nodeType: 'site',
            parentId: 'missing-parent',
            openUrl: '/sites/clientes',
            featured: false,
            sortOrder: 2,
            partialData: false
          }
        ]
      })
    };
    const service = new PortalMapService(repository as never);

    const snapshot = await service.resolve(createRequest());

    expect(snapshot.state).toBe('partialData');
    expect(snapshot.notes).toContain('Some nodes do not have a valid parent.');
  });

  it('falls back to grouped view when a cycle is detected', async () => {
    const repository = {
      load: jest.fn<Promise<IPortalMapRepositoryResult>, [IPortalMapRequest]>().mockResolvedValue({
        hasPartialData: false,
        items: [
          {
            id: 'a',
            title: 'A',
            nodeType: 'hub',
            parentId: 'c',
            openUrl: '/a',
            featured: false,
            sortOrder: 1,
            partialData: false
          },
          {
            id: 'b',
            title: 'B',
            nodeType: 'site',
            parentId: 'a',
            openUrl: '/b',
            featured: false,
            sortOrder: 2,
            partialData: false
          },
          {
            id: 'c',
            title: 'C',
            nodeType: 'area',
            parentId: 'b',
            openUrl: '/c',
            featured: false,
            sortOrder: 3,
            partialData: false
          }
        ]
      })
    };
    const service = new PortalMapService(repository as never);

    const snapshot = await service.resolve(createRequest());

    expect(snapshot.state).toBe('partialData');
    expect(snapshot.resolvedViewMode).toBe('grouped');
  });

  it('returns empty when the repository yields no items', async () => {
    const repository = {
      load: jest.fn<Promise<IPortalMapRepositoryResult>, [IPortalMapRequest]>().mockResolvedValue({
        hasPartialData: false,
        items: []
      })
    };
    const service = new PortalMapService(repository as never);

    const snapshot = await service.resolve(createRequest());

    expect(snapshot.state).toBe('empty');
    expect(snapshot.flatItems).toEqual([]);
  });
});
