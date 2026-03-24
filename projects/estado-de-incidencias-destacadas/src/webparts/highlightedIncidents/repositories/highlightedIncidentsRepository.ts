import type {
  HighlightedIncidentsDataSourceType,
  IHighlightedIncidentsContext,
  IHighlightedIncidentsRepository,
  IHighlightedIncidentsRequest,
  IIncidentSourceRecord
} from '../models/highlightedIncidentModels';
import { JsonIncidentsRepository } from './jsonIncidentsRepository';
import { SharePointIncidentsRepository } from './sharePointIncidentsRepository';

class DelegatingIncidentsRepository implements IHighlightedIncidentsRepository {
  public constructor(
    private readonly context: IHighlightedIncidentsContext,
    private readonly dataSourceType: HighlightedIncidentsDataSourceType
  ) {}

  public async loadIncidents(request: IHighlightedIncidentsRequest): Promise<IIncidentSourceRecord[]> {
    const repository =
      this.dataSourceType === 'JsonUrl'
        ? new JsonIncidentsRepository()
        : new SharePointIncidentsRepository();

    return repository.loadIncidents({
      ...request,
      webUrl: this.context.webUrl
    });
  }
}

export function createHighlightedIncidentsRepository(
  context: IHighlightedIncidentsContext,
  dataSourceType: HighlightedIncidentsDataSourceType
): IHighlightedIncidentsRepository {
  return new DelegatingIncidentsRepository(context, dataSourceType);
}
