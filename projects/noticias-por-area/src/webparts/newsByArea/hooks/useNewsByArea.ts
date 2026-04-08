import * as React from 'react';
import type {
  INewsByAreaConfiguration,
  INewsByAreaService,
  INewsByAreaState
} from '../models/newsByAreaModels';

export interface IUseNewsByAreaResult {
  state: INewsByAreaState;
  reload: () => void;
}

export function useNewsByArea(
  service: INewsByAreaService,
  configuration: INewsByAreaConfiguration
): IUseNewsByAreaResult {
  const [state, setState] = React.useState<INewsByAreaState>({
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
    configuration.areaFilter,
    configuration.description,
    configuration.featuredFirst,
    configuration.maxItems,
    configuration.showImage,
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
