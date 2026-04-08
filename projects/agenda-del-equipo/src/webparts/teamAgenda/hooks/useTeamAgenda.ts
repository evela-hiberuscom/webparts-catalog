import * as React from 'react';

import type { ITeamAgendaConfiguration, ITeamAgendaService, ITeamAgendaViewModel } from '../models/teamAgendaModels';
import { applyAgendaTypeFilter } from '../utils/teamAgendaUtils';

export interface IUseTeamAgendaOptions {
  configuration: ITeamAgendaConfiguration;
  service: ITeamAgendaService;
}

function createLoadingState(configuration: ITeamAgendaConfiguration): ITeamAgendaViewModel {
  return {
    state: 'loading',
    title: configuration.title,
    description: configuration.description,
    items: [],
    availableTypes: [],
    hasPartialData: false,
    warningMessages: [],
    selectedType: configuration.defaultTypeFilter,
    visibleItems: [],
    setSelectedType: () => undefined
  };
}

export function useTeamAgenda(options: IUseTeamAgendaOptions): ITeamAgendaViewModel {
  const { configuration, service } = options;
  const [loadResult, setLoadResult] = React.useState(() => createLoadingState(configuration));
  const [selectedType, setSelectedType] = React.useState(configuration.defaultTypeFilter);

  React.useEffect(() => {
    setSelectedType(configuration.defaultTypeFilter);
  }, [configuration.defaultTypeFilter]);

  React.useEffect(() => {
    let isMounted = true;
    setLoadResult(createLoadingState(configuration));

    service.load(configuration)
      .then((result) => {
        if (isMounted) {
          setLoadResult({
            ...result,
            selectedType: configuration.defaultTypeFilter,
            visibleItems: applyAgendaTypeFilter(result.items, configuration.defaultTypeFilter),
            setSelectedType
          });
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [
    configuration.dataSourceType,
    configuration.defaultTypeFilter,
    configuration.description,
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.showPast,
    configuration.title,
    configuration.webUrl,
    service
  ]);

  const visibleItems = React.useMemo(
    () => applyAgendaTypeFilter(loadResult.items, selectedType),
    [loadResult.items, selectedType]
  );

  return {
    ...loadResult,
    selectedType,
    visibleItems,
    setSelectedType
  };
}
