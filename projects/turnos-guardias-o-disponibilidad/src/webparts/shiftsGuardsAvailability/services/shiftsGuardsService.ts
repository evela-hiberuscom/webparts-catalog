import { IShiftEntry, IShiftsGuardsConfiguration, AsyncState } from '../models/shiftsGuardsModels';
import { ShiftsGuardsRepository } from '../repositories/shiftsGuardsRepository';

export class ShiftsGuardsService {
  private _repository: ShiftsGuardsRepository;
  constructor(repository: ShiftsGuardsRepository) { this._repository = repository; }
  async loadEntries(config: IShiftsGuardsConfiguration): Promise<AsyncState<IShiftEntry[]>> {
    try { const entries = await this._repository.getEntries(config); if (!entries?.length) return { status: 'empty' }; return { status: 'ready', data: entries }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Error' }; }
  }
}