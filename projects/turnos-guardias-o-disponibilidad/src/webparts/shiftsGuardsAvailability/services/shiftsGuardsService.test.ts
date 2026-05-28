import type { ShiftsGuardsRepository } from '../repositories/shiftsGuardsRepository';
import type { IShiftEntry, IShiftsGuardsConfiguration } from '../models/shiftsGuardsModels';
import { ShiftsGuardsService } from './shiftsGuardsService';

const configuration: IShiftsGuardsConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  maxItems: 5
};

describe('ShiftsGuardsService', () => {
  it('returns empty state when no shifts are available', async () => {
    const repository = {
      getEntries: jest.fn<Promise<IShiftEntry[]>, [IShiftsGuardsConfiguration]>().mockResolvedValue([])
    } as unknown as ShiftsGuardsRepository;

    const state = await new ShiftsGuardsService(repository).loadEntries(configuration);

    expect(state).toEqual({ status: 'empty' });
  });
});
