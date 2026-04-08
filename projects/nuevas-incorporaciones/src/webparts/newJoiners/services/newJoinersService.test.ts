import type { INewJoinersConfiguration } from '../models/joinerModels';
import { NewJoinersService } from './newJoinersService';

describe('NewJoinersService', () => {
  const configuration: INewJoinersConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'NewJoiners',
    maxItems: 4,
    daysBack: 30
  };

  it('returns ready when the repository returns a complete dataset', async () => {
    const service = new NewJoinersService({
      getJoiners: async () => [
        {
          id: 'joiner-1',
          displayName: 'Ada Lovelace',
          jobTitle: 'Engineer',
          department: 'Technology',
          photoUrl: '/photo.png',
          startDate: new Date().toISOString(),
          profileUrl: '/profile',
          welcomeMessage: 'Welcome'
        }
      ]
    } as never);

    const result = await service.loadJoiners(configuration);

    expect(result.status).toBe('ready');
  });

  it('returns partialData when metadata is missing', async () => {
    const service = new NewJoinersService({
      getJoiners: async () => [
        {
          id: 'joiner-2',
          displayName: 'Grace Hopper',
          jobTitle: undefined,
          department: 'Technology',
          photoUrl: undefined,
          startDate: new Date().toISOString(),
          profileUrl: undefined,
          welcomeMessage: undefined
        }
      ]
    } as never);

    const result = await service.loadJoiners(configuration);

    expect(result.status).toBe('partialData');
  });

  it('returns error when the repository throws', async () => {
    const service = new NewJoinersService({
      getJoiners: async () => {
        throw new Error('Boom');
      }
    } as never);

    const result = await service.loadJoiners(configuration);

    expect(result.status).toBe('error');
  });
});
