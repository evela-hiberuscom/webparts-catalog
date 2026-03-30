import * as React from 'react';
import type { ICelebrationServiceRequest, ICelebrationServiceResult } from '../services/celebrationService';
import { CelebrationService } from '../services/celebrationService';

export interface IUseCelebrationsResult extends ICelebrationServiceResult {
  refresh: () => void;
}

const INITIAL_STATE: ICelebrationServiceResult = {
  title: '',
  subtitle: '',
  status: 'loading',
  items: [],
  todayItems: [],
  upcomingItems: [],
  partialItems: [],
  sourceLabel: '',
  hasPartialData: false,
  notes: []
};

export function useCelebrations(
  request: ICelebrationServiceRequest,
  service: CelebrationService = new CelebrationService()
): IUseCelebrationsResult {
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [state, setState] = React.useState<ICelebrationServiceResult>(INITIAL_STATE);

  React.useEffect(() => {
    let disposed = false;

    setState((current) => ({
      ...current,
      status: 'loading',
      sourceLabel: current.sourceLabel,
      errorMessage: undefined
    }));

    const loadCelebrations = async (): Promise<void> => {
      await service
        .resolveCelebrations(request)
      .then((nextState) => {
        if (!disposed) {
          setState(nextState);
        }
      })
      .catch((error) => {
        if (!disposed) {
          const message = error instanceof Error ? error.message : String(error);
          setState({
            ...INITIAL_STATE,
            status: 'error',
            sourceLabel: '',
            errorMessage: message,
            notes: [message]
          });
        }
      });
    };

    loadCelebrations().catch((error) => {
      if (!disposed) {
        const message = error instanceof Error ? error.message : String(error);
        setState({
          ...INITIAL_STATE,
          status: 'error',
          sourceLabel: '',
          errorMessage: message,
          notes: [message]
        });
      }
    });

    return () => {
      disposed = true;
    };
  }, [
    request.dataSourceTypes.join('|'),
    request.daysAhead,
    request.directoryJsonUrl,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.showAnniversaries,
    request.showBirthdays,
    request.webAbsoluteUrl,
    request.spHttpClient,
    service,
    refreshTick
  ]);

  return {
    ...state,
    refresh: () => {
      setRefreshTick((current) => current + 1);
    }
  };
}
