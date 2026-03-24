import * as React from 'react';

import type { IMeetTheTeamRequest, ITeamMembersViewModel } from '../models/teamMemberModels';
import { MeetTheTeamService } from '../services/MeetTheTeamService';

interface IUseMeetTheTeamOptions {
  service?: MeetTheTeamService;
}

export interface IUseMeetTheTeamResult {
  viewModel: ITeamMembersViewModel;
  reload: () => void;
}

export function useMeetTheTeam(request: IMeetTheTeamRequest, options: IUseMeetTheTeamOptions = {}): IUseMeetTheTeamResult {
  const service = React.useMemo(() => options.service ?? new MeetTheTeamService(), [options.service]);
  const [reloadCounter, setReloadCounter] = React.useState(0);
  const [viewModel, setViewModel] = React.useState<ITeamMembersViewModel>(() => service.buildLoadingViewModel(request.webPartProps));

  React.useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      setViewModel(service.buildLoadingViewModel(request.webPartProps));

      try {
        const nextViewModel = await service.load(request);
        if (!isMounted) {
          return;
        }

        setViewModel(nextViewModel);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setViewModel({
          title: request.webPartProps.title,
          description: request.webPartProps.description,
          sourceLabel: 'No se han podido cargar los miembros.',
          items: [],
          state: 'error',
          hasPartialData: false,
          notes: [`pendiente de validar: ${(error as Error).message}`]
        });
      }
    }

    load().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [
    reloadCounter,
    request.hostContext.siteUrl,
    request.hostContext.webUrl,
    request.webPartProps.dataSourceType,
    request.webPartProps.dataSourceTypesCsv,
    request.webPartProps.description,
    request.webPartProps.directoryEndpoint,
    request.webPartProps.jsonUrl,
    request.webPartProps.listTitleOrUrl,
    request.webPartProps.maxItems,
    request.webPartProps.sortMode,
    request.webPartProps.staticMembersJson,
    request.webPartProps.title,
    service
  ]);

  const reload = React.useCallback(() => {
    setReloadCounter((current) => current + 1);
  }, []);

  return {
    viewModel,
    reload
  };
}
