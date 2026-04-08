import { NewsByAreaRepository } from '../repositories/newsByAreaRepository';

describe('newsByAreaRepository', () => {
  it('maps SharePoint page items into area news items', async () => {
    const repository = new NewsByAreaRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Nueva guardia IT',
                Description: 'Cobertura ampliada.',
                FirstPublishedDate: '2026-04-08T09:00:00.000Z',
                FileRef: '/sites/comms/SitePages/news.aspx',
                BannerImageUrl: '/sites/comms/siteassets/news.jpg',
                Category: 'IT;Operaciones',
                TaxCatchAll: [{ Term: 'IT' }]
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/comms'
    });

    const result = await repository.getNews({
      title: 'Noticias por área',
      description: 'Pulso de IT.',
      areaFilter: 'IT',
      sitePagesListTitle: 'Site Pages',
      maxItems: 4,
      showImage: true,
      featuredFirst: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].tags).toContain('IT');
    expect(result[0].openUrl).toContain('/SitePages/news.aspx');
  });
});
