import { CorporateGlossaryRepository } from '../repositories/corporateGlossaryRepository';

describe('corporateGlossaryRepository', () => {
  it('maps SharePoint items into glossary entries', async () => {
    const repository = new CorporateGlossaryRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'API',
                Definition: 'Interfaz de programación',
                Category: 'IT',
                Aliases: 'Interfaz; Plataforma',
                RelatedUrl: '/sites/intranet/SitePages/api.aspx',
                Featured: true,
                UpdatedAt: '2026-04-08T09:00:00.000Z'
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });

    const result = await repository.getGlossary({
      title: 'Glosario corporativo',
      description: 'Términos internos.',
      listTitle: 'Glossary',
      defaultCategory: 'General',
      maxItems: 50,
      enableAlphabetNav: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].aliases).toEqual(['Interfaz', 'Plataforma']);
    expect(result[0].relatedUrl).toContain('/SitePages/api.aspx');
  });
});
