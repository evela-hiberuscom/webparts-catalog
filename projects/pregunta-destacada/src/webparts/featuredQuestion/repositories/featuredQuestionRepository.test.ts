import type { IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';
import { FeaturedQuestionRepository } from './featuredQuestionRepository';

describe('FeaturedQuestionRepository', () => {
  const baseConfiguration: IFeaturedQuestionConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showVotes: true,
    allowMultipleVotes: false
  };

  it('returns the static dataset', async () => {
    const repository = new FeaturedQuestionRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getQuestion(baseConfiguration);

    expect(result).toHaveLength(1);
    expect(result[0]?.options).toHaveLength(3);
  });

  it('loads same-origin json payloads', async () => {
    const fetchClient = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'json-1',
            question: '¿Qué mejora priorizamos?',
            options: [{ text: 'Buscador', votes: 5 }]
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new FeaturedQuestionRepository({
      fetchClient,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getQuestion({
      ...baseConfiguration,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/demo/siteassets/featured-question.json'
    });

    expect(fetchClient).toHaveBeenCalled();
    expect(fetchClient).toHaveBeenCalledWith(
      'https://contoso.sharepoint.com/sites/demo/siteassets/featured-question.json',
      expect.any(Object)
    );
    expect(result[0]?.id).toBe('json-1');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new FeaturedQuestionRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    await expect(
      repository.getQuestion({
        ...baseConfiguration,
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://external.example.com/questions.json'
      })
    ).rejects.toThrow('Invalid JSON URL format');
  });
});
