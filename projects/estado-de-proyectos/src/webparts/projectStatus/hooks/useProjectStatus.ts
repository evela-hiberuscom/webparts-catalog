import * as React from 'react';
import type {
  IProjectStatusRequest,
  IProjectStatusViewModel,
  IProjectStatusResult,
  ProjectStatusFilter
} from '../models/projectStatusTypes';
import { ProjectStatusService } from '../services/projectStatusService';
import { createProjectsRepository } from '../repositories/createProjectsRepository';
import { filterProjectItems } from '../utils/projectStatusUtils';

export interface IUseProjectStatusResult {
  viewModel: IProjectStatusViewModel;
  refresh: () => void;
  setStatusFilter: (filter: ProjectStatusFilter) => void;
}

export function useProjectStatus(request: IProjectStatusRequest): IUseProjectStatusResult {
  const [selectedFilter, setSelectedFilter] = React.useState<ProjectStatusFilter>(request.defaultStatusFilter ?? 'all');
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [loadStatus, setLoadStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = React.useState<IProjectStatusResult | undefined>();
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  React.useEffect(() => {
    setSelectedFilter(request.defaultStatusFilter ?? 'all');
  }, [request.defaultStatusFilter]);

  React.useEffect(() => {
    let active = true;
    const repository = createProjectsRepository(request.dataSourceType);
    const service = new ProjectStatusService(repository);

    setLoadStatus('loading');
    setErrorMessage(undefined);

    service
      .load(request)
      .then((result) => {
        if (!active) {
          return;
        }

        setResult(result);
        setLoadStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setResult(undefined);
        setLoadStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
      });

    return () => {
      active = false;
    };
  }, [
    request.dataSourceType,
    request.listTitleOrUrl,
    request.jsonUrl,
    request.maxItems,
    request.webUrl,
    request.defaultStatusFilter,
    refreshToken
  ]);

  const filteredItems = result ? filterProjectItems(result.items, selectedFilter).slice(0, request.maxItems) : [];
  const status = loadStatus === 'loading'
    ? 'loading'
    : loadStatus === 'error'
      ? 'error'
      : filteredItems.length === 0
        ? 'empty'
        : result?.hasPartialData || filteredItems.some((item) => item.hasPartialData)
          ? 'partialData'
          : 'ready';

  const viewModel: IProjectStatusViewModel = {
    status,
    items: filteredItems,
    totalCount: result?.totalCount ?? 0,
    availableFilters: result?.availableFilters ?? ['all'],
    hasPartialData: result?.hasPartialData ?? false,
    sourceLabel: result?.sourceLabel ?? (request.listTitleOrUrl || request.dataSourceType),
    selectedFilter,
    errorMessage
  };

  return {
    viewModel,
    refresh: () => setRefreshToken((current) => current + 1),
    setStatusFilter: setSelectedFilter
  };
}
