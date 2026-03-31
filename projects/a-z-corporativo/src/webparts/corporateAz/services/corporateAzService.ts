import { IAzEntry, ICorporateAzConfiguration, AsyncState } from '../models/corporateAzModels';
import { CorporateAzRepository } from '../repositories/corporateAzRepository';

export class CorporateAzService {
  private _repository: CorporateAzRepository;
  constructor(repository: CorporateAzRepository) { this._repository = repository; }
  async loadEntries(config: ICorporateAzConfiguration): Promise<AsyncState<IAzEntry[]>> {
    try { const entries = await this._repository.getEntries(config); if (!entries?.length) return { status: 'empty' }; return { status: 'ready', data: entries }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Error' }; }
  }
}