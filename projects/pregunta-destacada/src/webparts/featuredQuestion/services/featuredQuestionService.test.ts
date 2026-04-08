import type { IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';
import type { FeaturedQuestionRepository } from '../repositories/featuredQuestionRepository';
import { FeaturedQuestionService } from './featuredQuestionService';

describe('FeaturedQuestionService', () => {
  const configuration: IFeaturedQuestionConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showVotes: true,
    allowMultipleVotes: false
  };

  it('returns ready when the repository response is complete', async () => {
    const repository = {
      getQuestion: jest.fn(async () => [
        {
          id: 'question-1',
          question: '¿Qué formato prefieres?',
          context: 'Comparte tu preferencia',
          category: 'Formación',
          authorName: 'People',
          authorPhotoUrl: undefined,
          options: [{ text: 'Online', votes: 4 }],
          expiresAt: undefined
        }
      ])
    } as unknown as FeaturedQuestionRepository;

    const service = new FeaturedQuestionService(repository);
    const result = await service.loadQuestion(configuration);

    expect(result.status).toBe('ready');
  });

  it('returns partialData when the question does not include options', async () => {
    const repository = {
      getQuestion: jest.fn(async () => [
        {
          id: 'question-2',
          question: '¿Qué formato prefieres?',
          context: undefined,
          category: undefined,
          authorName: undefined,
          authorPhotoUrl: undefined,
          options: [],
          expiresAt: undefined
        }
      ])
    } as unknown as FeaturedQuestionRepository;

    const service = new FeaturedQuestionService(repository);
    const result = await service.loadQuestion(configuration);

    expect(result.status).toBe('partialData');
  });

  it('returns error when the repository throws', async () => {
    const repository = {
      getQuestion: jest.fn(async () => {
        throw new Error('Boom');
      })
    } as unknown as FeaturedQuestionRepository;

    const service = new FeaturedQuestionService(repository);
    const result = await service.loadQuestion(configuration);

    expect(result.status).toBe('error');
  });
});
