import type { INewsSummaryConfiguration } from '../models/newsSummaryModels';
import { NewsSummaryService } from '../services/newsSummaryService';

describe('newsSummaryService', () => {
  const configuration: INewsSummaryConfiguration = {
    title: 'Resumen de noticias',
    description: 'Pulso editorial.',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
    featuredFirst: true
  };

  it('returns ready when repository returns complete items', async () => {
    const service = new NewsSummaryService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva política',
          summary: 'Resumen',
          publishedAt: '2026-04-08T09:00:00.000Z',
          imageUrl: 'https://contoso.sharepoint.com/image.jpg',
          openUrl: 'https://contoso.sharepoint.com/news/1',
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
    expect(result.items[0].isFeatured).toBe(true);
  });

  it('returns partialData when metadata is missing', async () => {
    const service = new NewsSummaryService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva política',
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('partialData');
  });
});
