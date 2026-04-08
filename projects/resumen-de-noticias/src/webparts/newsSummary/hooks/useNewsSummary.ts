import * as React from 'react';
import type { INewsSummaryConfiguration, INewsSummaryService, INewsSummaryState } from '../models/newsSummaryModels';

export interface IUseNewsSummaryResult {
  state: INewsSummaryState;
  reload: () => void;
}

export function useNewsSummary(service: INewsSummaryService, configuration: INewsSummaryConfiguration): IUseNewsSummaryResult {
  const [state, setState] = React.useState<INewsSummaryState>({
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
    configuration.featuredFirst,
    configuration.maxItems,
    configuration.sitePagesListTitle,
    configuration.title,
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
