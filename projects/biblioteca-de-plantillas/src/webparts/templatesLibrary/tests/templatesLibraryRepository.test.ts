import { TemplatesLibraryRepository } from '../repositories/templatesLibraryRepository';

describe('templatesLibraryRepository', () => {
  it('maps SharePoint items into template cards', async () => {
    const repository = new TemplatesLibraryRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Plantilla Comercial',
                FileLeafRef: 'PlantillaComercial.pptx',
                FileRef: '/sites/comms/Plantillas/PlantillaComercial.pptx',
                EncodedAbsUrl: 'https://contoso.sharepoint.com/sites/comms/Plantillas/PlantillaComercial.pptx',
                Modified: '2026-04-08T09:00:00.000Z',
                Category: 'Ventas',
                TemplateType: 'PowerPoint',
                FeaturedTemplate: true
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/comms'
    });

    const result = await repository.getTemplates({
      title: 'Biblioteca de plantillas',
      description: 'Catálogo oficial',
      sourceKind: 'library',
      listTitleOrUrl: 'Plantillas',
      defaultCategory: 'General',
      maxItems: 10
    });

    expect(result).toHaveLength(1);
    expect(result[0].downloadUrl).toContain('download=1');
    expect(result[0].featured).toBe(true);
  });
});
