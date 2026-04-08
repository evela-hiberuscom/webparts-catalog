import type { IRecognitionsConfiguration } from '../models/recognitionsModels';
import { createRecognitionsRepository } from './recognitionsRepository';

describe('recognitionsRepository', () => {
  const originalFetch = globalThis.fetch;

  const baseConfig: IRecognitionsConfiguration = {
    title: 'Reconocimientos',
    description: 'Feed del equipo',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'RecognitionsList',
    maxItems: 5,
    showPhotos: true,
    webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
  };

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns the static config dataset', async () => {
    const repository = createRecognitionsRepository(baseConfig);
    const result = await repository.load();

    expect(result.items).toHaveLength(3);
    expect(result.sourceLabel).toBe('Static config');
  });

  it('loads same-origin json urls', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'json-1',
            targetName: 'Ada',
            message: 'Gracias',
            date: '2026-03-20T12:00:00.000Z',
            photoUrl: '/photo.png',
            detailUrl: '/detail'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = createRecognitionsRepository({
      ...baseConfig,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/siteassets/recognitions.json'
    });

    const result = await repository.load();

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.items[0]?.targetName).toBe('Ada');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = createRecognitionsRepository({
      ...baseConfig,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: 'https://external.example.com/recognitions.json'
    });

    await expect(repository.load()).rejects.toThrow('JsonUrl no configurada o fuera del mismo origen.');
  });
});
