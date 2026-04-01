import { useState, useEffect, useCallback } from 'react';
import type { IShiftEntry, IShiftsGuardsConfiguration, AsyncState } from '../models/shiftsGuardsModels';
import { ShiftsGuardsService } from '../services/shiftsGuardsService';

export function useShiftsGuards(options: { service: ShiftsGuardsService; configuration: IShiftsGuardsConfiguration }): AsyncState<IShiftEntry[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<IShiftEntry[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadEntries(configuration)); }, [service, configuration]);
  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);
  return state;
}