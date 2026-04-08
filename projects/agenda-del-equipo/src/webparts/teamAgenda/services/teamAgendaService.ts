import type { ITeamAgendaConfiguration, ITeamAgendaLoadResult, ITeamAgendaService } from '../models/teamAgendaModels';
import { TeamAgendaRepository } from '../repositories/teamAgendaRepository';
import type { ITeamAgendaRepository } from '../repositories/teamAgendaRepository';
import {
  filterPastAgendaItems,
  limitAgendaItems,
  normalizeAgendaItem,
  sortAgendaItems
} from '../utils/teamAgendaUtils';

export async function loadTeamAgendaViewModel(
  configuration: ITeamAgendaConfiguration,
  repository: ITeamAgendaRepository = new TeamAgendaRepository(fetch.bind(globalThis))
): Promise<ITeamAgendaLoadResult> {
  try {
    const now = new Date();
    const response = await repository.load(configuration);
    const normalizedItems = response.items.map((item, index) =>
      normalizeAgendaItem(item, index, configuration.webUrl, now)
    );
    const items = limitAgendaItems(
      sortAgendaItems(filterPastAgendaItems(normalizedItems, configuration.showPast)),
      configuration.maxItems
    );
    const availableTypes = Array.from(
      new Set(items.map((item) => item.eventType).filter(Boolean) as string[])
    );
    const hasPartialData = response.isFallback || response.warnings.length > 0 || items.some((item) => item.isPartial);

    return {
      state: items.length === 0 ? 'empty' : hasPartialData ? 'partialData' : 'ready',
      title: configuration.title,
      description: configuration.description,
      items,
      availableTypes,
      hasPartialData,
      warningMessages: response.warnings
    };
  } catch (error) {
    return {
      state: 'error',
      title: configuration.title,
      description: configuration.description,
      items: [],
      availableTypes: [],
      hasPartialData: false,
      warningMessages: [],
      errorMessage: error instanceof Error ? error.message : 'Unexpected error loading agenda'
    };
  }
}

export class TeamAgendaService implements ITeamAgendaService {
  public constructor(private readonly repository: ITeamAgendaRepository = new TeamAgendaRepository(fetch.bind(globalThis))) {}

  public async load(configuration: ITeamAgendaConfiguration): Promise<ITeamAgendaLoadResult> {
    return loadTeamAgendaViewModel(configuration, this.repository);
  }
}
