import * as React from 'react';
import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IRecycleBinSpaceCalculatorRequest,
  IRecycleBinSpaceCalculatorRuntimeContext,
  IRecycleBinSpaceCalculatorState
} from '../models/recycleBinSpaceCalculatorModels';
import { RecycleBinSpaceCalculatorService } from '../services/recycleBinSpaceCalculatorService';

function createInitialState(): IRecycleBinSpaceCalculatorState {
  return {
    status: 'loading',
    isRefreshing: false,
    viewModel: null
  };
}

export function useRecycleBinSpaceCalculator(
  request: IRecycleBinSpaceCalculatorRequest,
  runtimeContext: IRecycleBinSpaceCalculatorRuntimeContext
): IRecycleBinSpaceCalculatorState & { refresh: () => Promise<void> } {
  const [state, setState] = React.useState<IRecycleBinSpaceCalculatorState>(createInitialState);
  const requestRef = React.useRef(request);
  requestRef.current = request;

  const service = React.useMemo(() => new RecycleBinSpaceCalculatorService(runtimeContext), [runtimeContext]);

  const refresh = React.useCallback(async () => {
    setState((current) => ({ ...current, isRefreshing: true, status: current.viewModel ? current.status : 'loading' }));

    try {
      const viewModel = await service.load(requestRef.current);
      const baseStatus = classifyAsyncState({
        hasData: viewModel.totalItemCount !== null || viewModel.totalSizeBytes !== null,
        hasError: false,
        isLoading: false,
        isPartial: viewModel.hasPartialData
      });
      const status =
        viewModel.totalItemCount === 0 &&
        viewModel.totalSizeBytes === 0 &&
        !viewModel.hasPartialData
          ? 'empty'
          : baseStatus;

      setState({
        status,
        isRefreshing: false,
        viewModel
      });
    } catch (error) {
      setState({
        status: 'error',
        isRefreshing: false,
        viewModel: null,
        errorMessage: error instanceof Error ? error.message : 'No se ha podido cargar el diagnóstico.'
      });
    }
  }, [service]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  React.useEffect(() => {
    if (request.refreshIntervalSeconds <= 0) {
      return undefined;
    }

    const handle = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, request.refreshIntervalSeconds * 1000);

    return () => window.clearInterval(handle);
  }, [refresh, request.refreshIntervalSeconds]);

  return {
    ...state,
    refresh
  };
}
