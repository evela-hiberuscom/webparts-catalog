import type { INewsByAreaConfiguration } from '../models/newsByAreaModels';
import { NewsByAreaService } from '../services/newsByAreaService';

describe('newsByAreaService', () => {
  const configuration: INewsByAreaConfiguration = {
    title: 'Noticias por área',
    description: 'Pulso de IT.',
    areaFilter: 'IT',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
    showImage: true,
    featuredFirst: true
  };

  it('returns ready when repository returns matching complete items', async () => {
    const service = new NewsByAreaService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva guardia IT',
          summary: 'Cobertura ampliada.',
          publishedAt: '2026-04-08T09:00:00.000Z',
          imageUrl: 'https://contoso.sharepoint.com/image.jpg',
          tags: ['IT'],
          openUrl: 'https://contoso.sharepoint.com/news/1',
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
    expect(result.items[0].isFeatured).toBe(true);
  });

  it('returns empty when no items match the configured area', async () => {
    const service = new NewsByAreaService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva guardia IT',
          tags: ['HR'],
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('empty');
    expect(result.items).toHaveLength(0);
  });

  it('returns partialData when matching items miss metadata', async () => {
    const service = new NewsByAreaService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva guardia IT',
          tags: ['IT'],
          isFeatured: false
        }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('partialData');
  });

  it('returns items when the area filter is empty', async () => {
    const service = new NewsByAreaService({
      getNews: jest.fn(async () => [
        {
          id: '1',
          title: 'Nueva guardia IT',
          summary: 'Cobertura ampliada.',
          publishedAt: '2026-04-08T09:00:00.000Z',
          imageUrl: 'https://contoso.sharepoint.com/image.jpg',
          tags: ['IT'],
          openUrl: 'https://contoso.sharepoint.com/news/1',
          isFeatured: false
        }
      ])
    });

    const result = await service.load({
      ...configuration,
      areaFilter: ''
    });

    expect(result.status).toBe('ready');
    expect(result.items).toHaveLength(1);
  });
});
