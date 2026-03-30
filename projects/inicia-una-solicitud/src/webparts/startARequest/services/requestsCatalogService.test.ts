import { RequestsCatalogService } from './requestsCatalogService';

describe('RequestsCatalogService', () => {
  it('sorts and filters items by the default category', async () => {
    const repository = {
      loadCatalog: jest.fn().mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Pedir material',
            category: 'Operaciones',
            featured: false,
            order: 2,
            actionable: true,
            partialData: false
          },
          {
            id: '2',
            title: 'Solicitar vacaciones',
            category: 'RRHH',
            featured: true,
            order: 1,
            actionable: true,
            partialData: false
          }
        ],
        sourceLabel: 'SharePointList',
        notes: [],
        hasPartialData: false
      })
    };

    const service = new RequestsCatalogService(repository as never);
    const result = await service.resolve({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'RequestsCatalogList',
      defaultCategory: 'RRHH',
      showPrerequisites: true,
      webUrl: 'https://contoso.sharepoint.com/sites/hr'
    });

    expect(repository.loadCatalog).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('ready');
    expect(result.filteredItems).toHaveLength(1);
    expect(result.filteredItems[0].title).toBe('Solicitar vacaciones');
    expect(result.categories).toEqual(['Operaciones', 'RRHH']);
  });
});
