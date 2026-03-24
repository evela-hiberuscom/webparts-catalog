import { createProfileVariantRepository } from './profileVariantRepository';

describe('profile variant repository', () => {
  it('loads SharePoint list variants by title', async () => {
    let requestedUrl = '';
    const repository = createProfileVariantRepository({
      fetchJson: async (url) => {
        requestedUrl = url;
        return {
          value: [
            {
              Id: 1,
              Title: 'Ventas',
              AudienceTokens: 'sales,es',
              Summary: 'Resumen de ventas',
              Body: 'Contenido específico',
              IsGeneric: false,
              ContentType: 'card',
              Priority: 1,
              Tags: 'ventas,prioridad'
            }
          ]
        };
      }
    });

    const variants = await repository.loadVariants({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'ProfileVariants',
      jsonUrl: '',
      staticConfigJson: '',
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3
    });

    expect(requestedUrl).toContain("/_api/web/lists/getbytitle('ProfileVariants')/items");
    expect(variants).toHaveLength(1);
    expect(variants[0].title).toBe('Ventas');
    expect(variants[0].audienceTokens).toEqual(['sales', 'es']);
  });

  it('supports same-origin list urls', async () => {
    let requestedUrl = '';
    const repository = createProfileVariantRepository({
      fetchJson: async (url) => {
        requestedUrl = url;
        return { d: { results: [] } };
      }
    });

    await repository.loadVariants({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: '/sites/portal/lists/ProfileVariants',
      jsonUrl: '',
      staticConfigJson: '',
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3
    });

    expect(requestedUrl).toContain('/_api/web/GetList(@listUrl)/items');
  });

  it('normalizes SharePoint view urls to the list root', async () => {
    let requestedUrl = '';
    const repository = createProfileVariantRepository({
      fetchJson: async (url) => {
        requestedUrl = url;
        return { d: { results: [] } };
      }
    });

    await repository.loadVariants({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: '/sites/portal/Lists/ProfileVariants/Forms/AllItems.aspx',
      jsonUrl: '',
      staticConfigJson: '',
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3
    });

    expect(requestedUrl).toContain("%2Fsites%2Fportal%2FLists%2FProfileVariants");
    expect(requestedUrl).not.toContain('AllItems.aspx');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = createProfileVariantRepository({
      fetchJson: async () => ({})
    });

    await expect(
      repository.loadVariants({
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        title: 'Componente según tu perfil',
        description: 'Personaliza el contenido según la audiencia del usuario.',
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: '',
        jsonUrl: 'https://example.com/variants.json',
        staticConfigJson: '',
        audienceMode: 'hybrid',
        fallbackMode: 'generic',
        maxItems: 3
      })
    ).rejects.toThrow('same-origin');
  });

  it('parses static config payloads', async () => {
    const repository = createProfileVariantRepository({
      fetchJson: async () => ({})
    });

    const variants = await repository.loadVariants({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticConfigJson: JSON.stringify({
        items: [
          {
            id: 'generic',
            title: 'General',
            summary: 'Resumen general',
            body: 'Cuerpo general',
            isGeneric: true,
            contentType: 'message'
          }
        ]
      }),
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3
    });

    expect(variants[0].id).toBe('generic');
    expect(variants[0].isGeneric).toBe(true);
  });
});
