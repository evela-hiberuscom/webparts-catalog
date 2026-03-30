jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { RequestsCatalogRepository } from './requestsCatalogRepository';

describe('RequestsCatalogRepository', () => {
  it('loads SharePoint list data and normalizes items', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Solicitar vacaciones',
            Category: 'RRHH',
            Audience: 'Empleado',
            Description: 'Inicia una solicitud de vacaciones',
            Prerequisites: 'Comprueba el saldo',
            StartUrl: '/sites/hr/requests/vacaciones',
            Featured: true,
            SortOrder: 1
          }
        ]
      })
    });

    const repository = new RequestsCatalogRepository({
      spHttpClient: { get } as never
    });

    const result = await repository.loadCatalog({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'RequestsCatalogList',
      defaultCategory: '',
      showPrerequisites: true,
      webUrl: 'https://contoso.sharepoint.com/sites/hr'
    });

    expect(get).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].actionable).toBe(true);
    expect(result.sourceLabel).toBe('SharePointList');
  });

  it('loads JsonUrl data from the same origin', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          Id: 2,
          Title: 'Abrir ticket de soporte',
          Category: 'IT',
          Description: 'Ticket',
          StartUrl: '/sites/it/requests/soporte',
          Featured: false,
          SortOrder: 2
        }
      ]
    });

    const repository = new RequestsCatalogRepository({
      spHttpClient: { get } as never
    });

    const result = await repository.loadCatalog({
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/hr/data/requests.json',
      defaultCategory: '',
      showPrerequisites: true,
      webUrl: 'https://contoso.sharepoint.com/sites/hr'
    });

    expect(get).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.sourceLabel).toBe('JsonUrl');
  });
});
