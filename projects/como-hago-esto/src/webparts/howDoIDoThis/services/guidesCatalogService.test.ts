import { GuidesCatalogService } from './guidesCatalogService';
import { GuidesFilterService } from './guidesFilterService';

describe('GuidesCatalogService', () => {
  const baseRequest = {
    title: 'Cómo hago esto',
    description: 'Guías',
    dataSourceType: 'StaticConfig' as const,
    listTitleOrUrl: '',
    defaultCategory: 'Compras',
    maxItems: 10,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    userDisplayName: 'Ada Lovelace'
  };

  it('sorts, filters and flags partial data', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'b',
            title: 'B',
            summary: 'Resumen',
            category: 'Compras',
            steps: [],
            relatedUrl: '/b',
            featured: false,
            isPartial: true
          },
          {
            id: 'a',
            title: 'A',
            summary: 'Resumen',
            category: 'Compras',
            steps: ['Uno'],
            relatedUrl: '/a',
            featured: true,
            isPartial: false
          }
        ],
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      })
    };

    const service = new GuidesCatalogService(repository as never, new GuidesFilterService());
    const viewModel = await service.load(baseRequest);

    expect(viewModel.items[0].title).toBe('A');
    expect(viewModel.selectedCategory).toBe('Compras');
    expect(viewModel.visibleItems).toHaveLength(2);
    expect(viewModel.status).toBe('partialData');
  });

  it('returns empty when no guides are available', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
        items: [],
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      })
    };

    const service = new GuidesCatalogService(repository as never, new GuidesFilterService());
    const viewModel = await service.load(baseRequest);

    expect(viewModel.status).toBe('empty');
    expect(viewModel.visibleItems).toHaveLength(0);
  });

  it('surfaces repository errors', async () => {
    const repository = {
      load: jest.fn().mockRejectedValue(new Error('boom'))
    };

    const service = new GuidesCatalogService(repository as never, new GuidesFilterService());
    const viewModel = await service.load(baseRequest);

    expect(viewModel.status).toBe('error');
    expect(viewModel.errorMessage).toBe('boom');
  });
});
