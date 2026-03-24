import * as React from 'react';
import type { IAlertBarRequest, IAlertBarService, IAlertBarState } from '../models/alertModels';

interface IUseAlertBarOptions {
  service: IAlertBarService;
  request: IAlertBarRequest;
}

export function useAlertBar(options: IUseAlertBarOptions): IAlertBarState & { refresh: () => void } {
  const { service, request } = options;
  const [state, setState] = React.useState<IAlertBarState>({
    status: 'loading',
    items: [],
    hasPartialData: false
  });
  const [reloadToken, setReloadToken] = React.useState(0);
  const requestIdRef = React.useRef(0);

  const refresh = (): void => {
    setReloadToken((value) => value + 1);
    setState({
      status: 'loading',
      items: [],
      hasPartialData: false
    });
  };

  React.useEffect(() => {
    let isMounted = true;
    const requestId = ++requestIdRef.current;

    setState({
      status: 'loading',
      items: [],
      hasPartialData: false
    });

    service
      .load(request)
      .then((viewModel) => {
        if (!isMounted || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: viewModel.items.length > 0 ? 'ready' : 'empty',
          items: viewModel.items,
          hasPartialData: viewModel.hasPartialData,
          sourceLabel: viewModel.sourceLabel
        });
      })
      .catch((error: Error) => {
        if (!isMounted || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: 'error',
          items: [],
          hasPartialData: false,
          errorMessage: error.message || 'No se han podido cargar los avisos urgentes.'
        });
      });

    return () => {
      isMounted = false;
    };
  }, [
    request.dataSourceType,
    request.dismissible,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.maxAlerts,
    request.staticConfigJson,
    request.webAbsoluteUrl,
    service,
    reloadToken
  ]);

  return {
    ...state,
    refresh
  };
}
