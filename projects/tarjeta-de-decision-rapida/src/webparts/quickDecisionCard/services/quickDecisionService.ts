import { IQuickDecision, IQuickDecisionConfiguration, AsyncState } from '../models/quickDecisionModels';
import { QuickDecisionRepository } from '../repositories/quickDecisionRepository';

export class QuickDecisionService {
  private _repository: QuickDecisionRepository;
  constructor(repository: QuickDecisionRepository) { this._repository = repository; }
  async loadDecision(config: IQuickDecisionConfiguration): Promise<AsyncState<IQuickDecision[]>> {
    try { const decision = await this._repository.getDecision(config); if (!decision?.length) return { status: 'empty' }; return { status: 'ready', data: decision }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Error' }; }
  }
}