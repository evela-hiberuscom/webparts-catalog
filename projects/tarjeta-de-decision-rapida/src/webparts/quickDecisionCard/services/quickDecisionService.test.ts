import type { QuickDecisionRepository } from '../repositories/quickDecisionRepository';
import type { IQuickDecision, IQuickDecisionConfiguration } from '../models/quickDecisionModels';
import { QuickDecisionService } from './quickDecisionService';

const configuration: IQuickDecisionConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: ''
};

describe('QuickDecisionService', () => {
  it('returns error state when the repository fails', async () => {
    const repository = {
      getDecision: jest.fn<Promise<IQuickDecision[]>, [IQuickDecisionConfiguration]>().mockRejectedValue(new Error('boom'))
    } as unknown as QuickDecisionRepository;

    const state = await new QuickDecisionService(repository).loadDecision(configuration);

    expect(state).toEqual({ status: 'error', message: 'boom' });
  });
});
