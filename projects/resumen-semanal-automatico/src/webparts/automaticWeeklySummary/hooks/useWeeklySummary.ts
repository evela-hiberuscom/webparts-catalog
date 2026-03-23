import * as React from 'react';
import type {
  IWeeklySummaryRequest,
  IWeeklySummaryResult,
  IWeeklySummaryService,
  IWeeklySummaryViewState
} from '../models/weeklySummaryTypes';

export function useWeeklySummary(
  service: IWeeklySummaryService,
  request: IWeeklySummaryRequest
): IWeeklySummaryViewState & { refresh: () => void } {
  const [state, setState] = React.useState<IWeeklySummaryViewState>({
    status: 'loading',
    result: undefined,
    error: undefined
  });
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    setState({ status: 'loading', result: undefined, error: undefined });

    service
      .loadSummary(request)
      .then((result: IWeeklySummaryResult) => {
        if (!active) {
          return;
        }

        setState({
          status: result.status,
          result,
          error: undefined
        });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          status: 'error',
          result: undefined,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });

    return () => {
      active = false;
    };
  }, [
    request.periodMode,
    request.maxItems,
    request.customRangeStart,
    request.customRangeEnd,
    request.referenceDate?.getTime(),
    refreshToken,
    service
  ]);

  return {
    ...state,
    refresh: () => setRefreshToken((current) => current + 1)
  };
}
