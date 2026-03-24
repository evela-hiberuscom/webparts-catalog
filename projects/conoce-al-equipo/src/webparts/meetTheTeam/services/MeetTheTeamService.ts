import { classifyAsyncState } from '@paquete/spfx-common';

import type {
  IMeetTheTeamRequest,
  IMeetTheTeamWebPartProps,
  ITeamMembersRepositoryResult,
  ITeamMembersViewModel
} from '../models/teamMemberModels';
import { TeamMembersRepository } from '../repositories/TeamMembersRepository';
import { normalizeMeetTheTeamWebPartProps, sortTeamMembers } from '../utils/teamMemberUtils';

interface ITeamMembersRepositoryLike {
  load(request: IMeetTheTeamRequest): Promise<ITeamMembersRepositoryResult>;
}

export interface IMeetTheTeamServiceDependencies {
  repository?: ITeamMembersRepositoryLike;
}

function buildLoadingModel(webPartProps: IMeetTheTeamWebPartProps): ITeamMembersViewModel {
  return {
    title: webPartProps.title,
    description: webPartProps.description,
    sourceLabel: 'Cargando miembros del equipo...',
    items: [],
    state: 'loading',
    hasPartialData: false,
    notes: []
  };
}

export class MeetTheTeamService {
  constructor(private readonly dependencies: IMeetTheTeamServiceDependencies = {}) {}

  public async load(request: IMeetTheTeamRequest): Promise<ITeamMembersViewModel> {
    const webPartProps = normalizeMeetTheTeamWebPartProps(request.webPartProps);
    const repository = this.dependencies.repository ?? new TeamMembersRepository(request.hostContext.spHttpClient);
    const repositoryResult = await repository.load({
      webPartProps,
      hostContext: request.hostContext
    });

    const items = sortTeamMembers(repositoryResult.items, webPartProps.sortMode).slice(0, webPartProps.maxItems);
    const hasPartialData = repositoryResult.hasPartialData || items.some((item) => item.partialData);
    const state = classifyAsyncState({
      hasData: items.length > 0,
      hasError: false,
      isLoading: false,
      isPartial: hasPartialData
    });

    return {
      title: webPartProps.title,
      description: webPartProps.description,
      sourceLabel: repositoryResult.sourceLabel,
      items,
      state,
      hasPartialData,
      notes: repositoryResult.notes
    };
  }

  public buildLoadingViewModel(webPartProps: IMeetTheTeamWebPartProps): ITeamMembersViewModel {
    return buildLoadingModel(normalizeMeetTheTeamWebPartProps(webPartProps));
  }
}
