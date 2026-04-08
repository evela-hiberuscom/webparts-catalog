import type { ITemplatesLibraryConfiguration } from '../models/templatesLibraryModels';
import { TemplatesLibraryService } from '../services/templatesLibraryService';

describe('templatesLibraryService', () => {
  const configuration: ITemplatesLibraryConfiguration = {
    title: 'Biblioteca de plantillas',
    description: 'Catálogo oficial',
    sourceKind: 'library',
    listTitleOrUrl: 'Plantillas',
    defaultCategory: 'General',
    maxItems: 10
  };

  it('returns ready with categories and types', async () => {
    const service = new TemplatesLibraryService({
      getTemplates: jest.fn(async () => [
        {
          id: '1',
          title: 'Plantilla Comercial',
          templateType: 'PowerPoint',
          category: 'Ventas',
          openUrl: 'https://contoso.sharepoint.com/file.pptx',
          downloadUrl: 'https://contoso.sharepoint.com/file.pptx?download=1',
          featured: true
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
    expect(result.categories).toEqual(['Ventas']);
    expect(result.types).toEqual(['PowerPoint']);
  });

  it('returns partialData when template actions are missing', async () => {
    const service = new TemplatesLibraryService({
      getTemplates: jest.fn(async () => [
        {
          id: '1',
          title: 'Plantilla',
          templateType: 'Word',
          category: 'General',
          featured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('partialData');
  });
});
