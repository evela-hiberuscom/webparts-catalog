import * as React from 'react';
import { IApprovalSnapshot, IApprovalsAggregationService, IApprovalsSourceConfig, IApprovalsServiceState } from '../models/myApprovalsModels';
import { useMyApprovalsContext } from '../contexts/MyApprovalsContext';

export interface IUseMyApprovalsArgs {
  config: IApprovalsSourceConfig;
  service?: IApprovalsAggregationService;
}

export interface IUseMyApprovalsResult extends IApprovalsServiceState {
  refresh: () => Promise<void>;
}

const emptySnapshot: IApprovalSnapshot = {
  items: [],
  counts: {
    overdue: 0,
    today: 0,
    upcoming: 0,
    noDate: 0,
    pending: 0,
    completed: 0,
    total: 0,
    partial: 0
  },
  hasPartialData: false,
  sourceWarnings: []
};

export function useMyApprovals(args: IUseMyApprovalsArgs): IUseMyApprovalsResult {
  const context = useMyApprovalsContext();
  const service = args.service ?? context.service;
  const [state, setState] = React.useState<IApprovalsServiceState>({
    isLoading: true,
    error: null,
    snapshot: emptySnapshot
  });

  const refresh = React.useCallback(async () => {
    if (!service) {
      setState({
        isLoading: false,
        error: 'service-missing',
        snapshot: emptySnapshot
      });
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null
    }));

    try {
      const snapshot = await service.loadSnapshot(args.config);
      setState({
        isLoading: false,
        error: null,
        snapshot
      });
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'approval-load-failed',
        snapshot: emptySnapshot
      });
    }
  }, [args.config, service]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return {
    ...state,
    refresh
  };
}
