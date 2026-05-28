import * as React from 'react';
import type { IGovernanceDashboardConfig, IGovernanceDashboardViewModel } from '../models/governanceModels';
import { GovernanceDashboardService } from '../services/governanceDashboardService';

export type GovernanceDashboardStatus = 'loading' | 'ready' | 'empty' | 'error';

export interface IUseGovernanceDashboardResult {
  data?: IGovernanceDashboardViewModel;
  status: GovernanceDashboardStatus;
  errorMessage: string;
  reload: () => void;
}

export function useGovernanceDashboard(
  config: IGovernanceDashboardConfig,
  service: GovernanceDashboardService
): IUseGovernanceDashboardResult {
  const [data, setData] = React.useState<IGovernanceDashboardViewModel | undefined>();
  const [status, setStatus] = React.useState<GovernanceDashboardStatus>('loading');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [reloadToken, setReloadToken] = React.useState<number>(0);

  React.useEffect(() => {
    let isDisposed = false;
    setStatus('loading');
    setErrorMessage('');

    void service.loadDashboard(config)
      .then((nextData) => {
        if (isDisposed) {
          return;
        }

        setData(nextData);
        setStatus(nextData.visibleFindings.length > 0 || nextData.metrics.length > 0 ? 'ready' : 'empty');
      })
      .catch((error: Error) => {
        if (isDisposed) {
          return;
        }

        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => {
      isDisposed = true;
    };
  }, [config.maxItems, config.showDetails, config.subtitle, config.title, reloadToken, service]);

  const reload = React.useCallback((): void => {
    setReloadToken((current) => current + 1);
  }, []);

  return { data, status, errorMessage, reload };
}
