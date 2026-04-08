import type { ISmartFaqConfiguration } from '../models/smartFaqModels';
import { SmartFaqService } from '../services/smartFaqService';

describe('smartFaqService', () => {
  const configuration: ISmartFaqConfiguration = {
    title: 'FAQ inteligente',
    description: 'Soporte ligero.',
    listTitleOrUrl: 'FAQ',
    defaultCategory: 'General',
    enableSearch: true,
    maxItems: 50
  };

  it('returns ready with categories', async () => {
    const service = new SmartFaqService({
      getFaqs: jest.fn(async () => [
        {
          id: '1',
          question: 'Cómo pedir vacaciones',
          answer: 'Usa el portal.',
          category: 'HR',
          aliases: ['vacaciones'],
          relatedUrl: 'https://contoso.sharepoint.com/vacaciones',
          isFeatured: true
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
    expect(result.categories).toContain('HR');
  });

  it('returns ready when related link is missing but core FAQ data exists', async () => {
    const service = new SmartFaqService({
      getFaqs: jest.fn(async () => [
        {
          id: '1',
          question: 'Cómo pedir vacaciones',
          answer: 'Usa el portal.',
          category: 'HR',
          aliases: [],
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
  });
});
