import * as React from 'react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IMiniOrgChartConfig, IOrgLoadResult } from '../models/miniOrgChartModels';
import { MiniOrgChartService } from '../services/MiniOrgChartService';

export interface IUseMiniOrgChartResult {
  isLoading: boolean;
  loadResult: IOrgLoadResult;
  reload: () => void;
}

const emptyResult: IOrgLoadResult = {
  people: [],
  sourceSummaries: [],
  warnings: [],
  errors: []
};

export function useMiniOrgChart(context: WebPartContext, config: IMiniOrgChartConfig): IUseMiniOrgChartResult {
  const [loadResult, setLoadResult] = React.useState<IOrgLoadResult>(emptyResult);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [reloadToken, setReloadToken] = React.useState<number>(0);
  const configSignature = React.useMemo(
    () => JSON.stringify({
      dataSourceTypes: [...config.dataSourceTypes].sort(),
      listTitleOrUrl: config.listTitleOrUrl ?? '',
      rootPersonId: config.rootPersonId ?? '',
      directoryEndpoint: config.directoryEndpoint ?? '',
      jsonUrl: config.jsonUrl ?? '',
      staticConfigJson: config.staticConfigJson ?? ''
    }),
    [config.dataSourceTypes, config.listTitleOrUrl, config.rootPersonId, config.directoryEndpoint, config.jsonUrl, config.staticConfigJson]
  );

  React.useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const service = new MiniOrgChartService(context);
        const result = await service.load(config);
        if (!cancelled) {
          setLoadResult(result);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadResult({
            ...emptyResult,
            errors: [error instanceof Error ? error.message : 'Unexpected error']
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [context, configSignature, reloadToken]);

  return {
    isLoading,
    loadResult,
    reload: (): void => setReloadToken((value) => value + 1)
  };
}
