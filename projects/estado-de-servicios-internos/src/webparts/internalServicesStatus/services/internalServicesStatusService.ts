import type {
  IInternalServicesStatusRequest,
  IInternalServicesStatusResult,
  IInternalServicesStatusService,
  IInternalServiceStatusRepository
} from "../models/internalServicesStatusModels";
import {
  countStaleServices,
  filterServices,
  getLastUpdatedValue,
  mapServiceRecord,
  sortServices
} from "../utils/internalServicesStatusUtils";

function hasPartialFields(
  mappedItems: ReturnType<typeof mapServiceRecord>[]
): boolean {
  return mappedItems.some((item) => item.isPartial);
}

export class InternalServicesStatusService implements IInternalServicesStatusService {
  public constructor(private readonly repository: IInternalServiceStatusRepository) {}

  public async loadSnapshot(request: IInternalServicesStatusRequest): Promise<IInternalServicesStatusResult> {
    const rawRecords = await this.repository.loadRecords(request);
    const mappedItems = rawRecords.map((record) => mapServiceRecord(record, request.staleThresholdMinutes));
    const filteredItems = filterServices(mappedItems, request.showOnlyCritical ? "critical" : "all");
    const sortedItems = sortServices(filteredItems);
    const hasPartialData = hasPartialFields(mappedItems);
    const status = !sortedItems.length ? "empty" : hasPartialData ? "partialData" : "ready";

    return {
      items: sortedItems,
      status,
      hasPartialData,
      sourceCount: rawRecords.length,
      lastUpdated: getLastUpdatedValue(sortedItems),
      staleCount: countStaleServices(sortedItems)
    };
  }
}
