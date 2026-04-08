import * as React from 'react';

import type {
  IUpcomingMilestonesConfiguration,
  IUpcomingMilestonesService,
  IUpcomingMilestonesState
} from '../models/upcomingMilestonesModels';

export interface IUseUpcomingMilestonesResult {
  state: IUpcomingMilestonesState;
  reload: () => void;
}

export function useUpcomingMilestones(
  service: IUpcomingMilestonesService,
  configuration: IUpcomingMilestonesConfiguration
): IUseUpcomingMilestonesResult {
  const [state, setState] = React.useState<IUpcomingMilestonesState>({
    status: 'loading',
    items: [],
    hasPartialData: false
  });
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    setState({
      status: 'loading',
      items: [],
      hasPartialData: false
    });

    service.load(configuration)
      .then((nextState) => {
        if (isMounted) {
          setState(nextState);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setState({
            status: 'error',
            items: [],
            hasPartialData: false,
            errorMessage: error.message
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    configuration.description,
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.title,
    configuration.viewMode,
    reloadKey,
    service
  ]);

  return {
    state,
    reload: () => {
      setReloadKey((current) => current + 1);
    }
  };
}
