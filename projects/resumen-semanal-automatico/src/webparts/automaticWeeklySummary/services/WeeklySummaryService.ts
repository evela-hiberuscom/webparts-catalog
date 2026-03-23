import type {
  IWeeklyHighlight,
  IWeeklySummaryRequest,
  IWeeklySummaryResult,
  IWeeklySummaryService,
  IWeeklySummarySourceRepository
} from '../models/weeklySummaryTypes';
import {
  collectSourceNames,
  getWeeklySummaryRange,
  isDateInRange,
  normalizeHighlightType,
  sortHighlights,
  truncateHighlights
} from '../utils/weeklySummaryUtils';

function normalizeHighlight(item: IWeeklyHighlight): IWeeklyHighlight {
  return {
    ...item,
    highlightType: normalizeHighlightType(item.highlightType, item.sourceName),
    summary: item.summary ?? item.title,
    isPartial: item.isPartial ?? (!item.openUrl || !item.date)
  };
}

function determineStatus(items: IWeeklyHighlight[], hasPartialData: boolean): IWeeklySummaryResult['status'] {
  if (!items.length) {
    return 'empty';
  }

  return hasPartialData ? 'partialData' : 'ready';
}

export class WeeklySummaryService implements IWeeklySummaryService {
  public constructor(private readonly repository: IWeeklySummarySourceRepository) {}

  public async loadSummary(request: IWeeklySummaryRequest): Promise<IWeeklySummaryResult> {
    const referenceDate = request.referenceDate ?? new Date();
    const range = getWeeklySummaryRange(
      request.periodMode,
      referenceDate,
      request.customRangeStart,
      request.customRangeEnd
    );
    const rawItems = await this.repository.loadHighlights(request);
    const normalizedItems = rawItems.map(normalizeHighlight);
    const filteredItems = normalizedItems.filter((item) => isDateInRange(item.date, range));
    const sortedItems = truncateHighlights(sortHighlights(filteredItems), request.maxItems);
    const hasPartialData =
      normalizedItems.some((item) => item.isPartial) ||
      rawItems.some((item) => !item.date || !item.openUrl) ||
      (request.periodMode === 'customRange' && (!request.customRangeStart || !request.customRangeEnd));

    return {
      items: sortedItems,
      periodLabel: range.label,
      hasPartialData,
      status: determineStatus(sortedItems, hasPartialData),
      sourceCount: collectSourceNames(sortedItems).length,
      range
    };
  }
}
