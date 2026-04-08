import * as React from 'react';
import type {
  IWhatChangedFeedConfiguration,
  IWhatChangedFeedService,
  IWhatChangedFeedState
} from '../models/whatChangedFeedModels';

export interface IUseWhatChangedFeedResult {
  state: IWhatChangedFeedState;
  reload: () => void;
}

export function useWhatChangedFeed(
  service: IWhatChangedFeedService,
  configuration: IWhatChangedFeedConfiguration
): IUseWhatChangedFeedResult {
  const [state, setState] = React.useState<IWhatChangedFeedState>({
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
    configuration.defaultTypeFilter,
    configuration.description,
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.sourceKind,
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
