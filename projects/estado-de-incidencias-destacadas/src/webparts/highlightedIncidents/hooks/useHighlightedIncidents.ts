import * as React from 'react';
import {
  type IHighlightedIncidentsViewState,
  type IHighlightedIncidentsRequest
} from '../models/highlightedIncidentModels';
import { HighlightedIncidentsService } from '../services/highlightedIncidentsService';
import { createHighlightedIncidentsRepository } from '../repositories/highlightedIncidentsRepository';

export interface IUseHighlightedIncidentsResult extends IHighlightedIncidentsViewState {
  refresh: () => void;
}

export function useHighlightedIncidents(request: IHighlightedIncidentsRequest): IUseHighlightedIncidentsResult {
  const [state, setState] = React.useState<IHighlightedIncidentsViewState>({
    status: 'loading'
  });
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    setState({ status: 'loading' });

    const repository = createHighlightedIncidentsRepository(
      { webUrl: request.webUrl },
      request.dataSourceType
    );
    const service = new HighlightedIncidentsService(repository);

    service
      .loadOverview(request)
      .then((result) => {
        if (!active) {
          return;
        }

        setState({
          status: result.status,
          result
        });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });

    return () => {
      active = false;
    };
  }, [
    request.webUrl,
    request.dataSourceType,
    request.listTitleOrUrl,
    request.showResolved,
    request.maxItems,
    refreshToken
  ]);

  return {
    ...state,
    refresh: () => setRefreshToken((current) => current + 1)
  };
}
