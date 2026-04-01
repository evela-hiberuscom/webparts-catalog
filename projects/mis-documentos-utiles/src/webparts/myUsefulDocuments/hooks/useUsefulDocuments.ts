import { useState, useEffect, useCallback } from 'react';
import type { IUsefulDocument, IUsefulDocumentsConfiguration, AsyncState } from '../models/usefulDocumentModels';
import { UsefulDocumentsService } from '../services/usefulDocumentsService';

export interface IUseUsefulDocumentsOptions {
  service: UsefulDocumentsService;
  configuration: IUsefulDocumentsConfiguration;
  autoRefreshSeconds?: number;
}

export function useUsefulDocuments(options: IUseUsefulDocumentsOptions): AsyncState<IUsefulDocument[]> {
  const { service, configuration, autoRefreshSeconds } = options;
  const [state, setState] = useState<AsyncState<IUsefulDocument[]>>({ status: 'loading' });

  const loadData = useCallback(async (): Promise<void> => {
    const newState = await service.loadDocuments(configuration);
    setState(newState);
  }, [service, configuration]);

  useEffect(() => {
    loadData().catch(() => undefined);

    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      const intervalId = setInterval(() => {
        loadData().catch(() => undefined);
      }, autoRefreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }
  }, [loadData, autoRefreshSeconds]);

  return state;
}