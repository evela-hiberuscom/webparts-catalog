import { ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IHighlightedIncidentsRepository,
  IHighlightedIncidentsRequest,
  IHighlightedIncidentsResult,
  IHighlightedIncidentsService,
  IncidentStatus
} from '../models/highlightedIncidentModels';
import { mapIncidentRecord, sortIncidents, truncateIncidents } from '../utils/highlightedIncidentsUtils';

function clampMaxItems(value: number): number {
  if (Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.min(value, 20);
}

function determineStatus(hasItems: boolean, hasPartialData: boolean): IHighlightedIncidentsResult['status'] {
  if (!hasItems) {
    return 'empty';
  }

  return hasPartialData ? 'partialData' : 'ready';
}

function shouldIncludeIncident(status: IncidentStatus, showResolved: boolean): boolean {
  return status === 'active' || status === 'monitoring' || (showResolved && status === 'resolved');
}

export class HighlightedIncidentsService implements IHighlightedIncidentsService {
  public constructor(private readonly repository: IHighlightedIncidentsRepository) {}

  public async loadOverview(request: IHighlightedIncidentsRequest): Promise<IHighlightedIncidentsResult> {
    const rawItems = await this.repository.loadIncidents(request);
    const normalizedItems = rawItems.map((item, index) =>
      mapIncidentRecord(
        item,
        typeof item.sourceName === 'string' && item.sourceName.trim() ? item.sourceName : request.listTitleOrUrl,
        index
      )
    );
    const visibleItems = normalizedItems.filter((item) => shouldIncludeIncident(item.status, request.showResolved));
    const sortedItems = truncateIncidents(sortIncidents(visibleItems), clampMaxItems(request.maxItems));
    const sourceCount = ensureUniqueStrings(sortedItems.map((item) => item.sourceName)).length;
    const activeCount = sortedItems.filter((item) => item.status === 'active').length;
    const monitoringCount = sortedItems.filter((item) => item.status === 'monitoring').length;
    const resolvedCount = sortedItems.filter((item) => item.status === 'resolved').length;
    const hiddenResolvedCount = request.showResolved
      ? 0
      : normalizedItems.filter((item) => item.status === 'resolved').length;
    const hasPartialData = normalizedItems.some((item) => item.isPartial);

    return {
      items: sortedItems,
      hasPartialData,
      status: determineStatus(sortedItems.length > 0, hasPartialData),
      sourceCount,
      activeCount,
      monitoringCount,
      resolvedCount,
      hiddenResolvedCount
    };
  }
}
