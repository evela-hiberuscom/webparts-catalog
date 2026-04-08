import type { ICorporateGlossaryConfiguration } from '../models/corporateGlossaryModels';
import { CorporateGlossaryService } from '../services/corporateGlossaryService';

describe('corporateGlossaryService', () => {
  const configuration: ICorporateGlossaryConfiguration = {
    title: 'Glosario corporativo',
    description: 'Términos internos.',
    listTitle: 'Glossary',
    defaultCategory: 'General',
    maxItems: 50,
    enableAlphabetNav: true
  };

  it('returns ready when glossary items are complete', async () => {
    const service = new CorporateGlossaryService({
      getGlossary: jest.fn(async () => [
        {
          id: '1',
          title: 'API',
          definition: 'Interfaz',
          category: 'IT',
          aliases: [],
          relatedUrl: 'https://contoso.sharepoint.com/api',
          updatedAt: '2026-04-08T09:00:00.000Z',
          featured: true,
          partialData: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
    expect(result.categories).toContain('IT');
  });

  it('returns partialData when related links are missing', async () => {
    const service = new CorporateGlossaryService({
      getGlossary: jest.fn(async () => [
        {
          id: '1',
          title: 'API',
          definition: 'Interfaz',
          aliases: [],
          featured: false,
          partialData: true
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('partialData');
  });
});
