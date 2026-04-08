import { NewsSummaryRepository } from '../repositories/newsSummaryRepository';

describe('newsSummaryRepository', () => {
  it('maps SharePoint page items into news items', async () => {
    const repository = new NewsSummaryRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Nueva política',
                Description: 'Resumen',
                FirstPublishedDate: '2026-04-08T09:00:00.000Z',
                FileRef: '/sites/comms/SitePages/news.aspx',
                BannerImageUrl: '/sites/comms/siteassets/news.jpg'
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/comms'
    });

    const result = await repository.getNews({
      title: 'Resumen de noticias',
      description: 'Pulso editorial.',
      sitePagesListTitle: 'Site Pages',
      maxItems: 4,
      featuredFirst: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].openUrl).toContain('/SitePages/news.aspx');
  });
});
