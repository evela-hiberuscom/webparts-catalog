import { SmartFaqRepository } from '../repositories/smartFaqRepository';

describe('smartFaqRepository', () => {
  it('maps SharePoint items into FAQ entries', async () => {
    const repository = new SmartFaqRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Cómo pedir vacaciones',
                Answer: 'Usa el portal de RRHH.',
                Category: 'HR',
                Aliases: 'vacaciones;ausencias',
                RelatedUrl: '/sites/intranet/SitePages/vacaciones.aspx',
                Modified: '2026-04-08T09:00:00.000Z',
                Featured: true
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });

    const result = await repository.getFaqs({
      title: 'FAQ inteligente',
      description: 'Soporte ligero.',
      listTitleOrUrl: 'FAQ',
      defaultCategory: 'General',
      enableSearch: true,
      maxItems: 50
    });

    expect(result).toHaveLength(1);
    expect(result[0].aliases).toContain('vacaciones');
    expect(result[0].relatedUrl).toContain('/SitePages/vacaciones.aspx');
  });
});
