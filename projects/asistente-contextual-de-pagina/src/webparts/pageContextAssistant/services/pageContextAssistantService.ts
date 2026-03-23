import type {
  IContextHelpRecord,
  IPageContextAssistantRequest,
  IPageContextAssistantRepository,
  IPageContextAssistantResult,
  IPageContextAssistantService
} from "../models/pageContextAssistantModels";
import {
  normalizeContextKey,
  normalizeHelpRecord,
  shouldUseGenericFallback
} from "../utils/pageContextAssistantUtils";

function sortHelpRecords(records: IContextHelpRecord[]): IContextHelpRecord[] {
  return [...records].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
}

function pickHelpRecord(
  records: IContextHelpRecord[],
  request: IPageContextAssistantRequest
): { help?: IContextHelpRecord; matchedCount: number; usedFallback: boolean } {
  const requestedContext = normalizeContextKey(request.contextKeyOverride ?? request.pageContextKey);
  const exactMatch = records.find((record) => {
    const recordContext = normalizeContextKey(record.contextKey);
    return recordContext === requestedContext || normalizeContextKey(record.title) === requestedContext;
  });

  if (exactMatch) {
    return {
      help: exactMatch,
      matchedCount: 1,
      usedFallback: false
    };
  }

  if (!shouldUseGenericFallback(request.fallbackMode)) {
    return {
      matchedCount: 0,
      usedFallback: false
    };
  }

  const generic = records.find((record) => record.isGeneric || normalizeContextKey(record.contextKey) === "generic");
  if (generic) {
    return {
      help: generic,
      matchedCount: 0,
      usedFallback: true
    };
  }

  return {
    matchedCount: 0,
    usedFallback: true
  };
}

export class PageContextAssistantService implements IPageContextAssistantService {
  public constructor(private readonly repository: IPageContextAssistantRepository) {}

  public async loadHelp(request: IPageContextAssistantRequest): Promise<IPageContextAssistantResult> {
    const rawRecords = await this.repository.loadRecords(request);
    const normalizedRecords = rawRecords.map((record, index) =>
      normalizeHelpRecord(record, request.dataSourceType, index)
    );
    const sortedRecords = sortHelpRecords(normalizedRecords);
    const selected = pickHelpRecord(sortedRecords, request);
    const hasPartialData = sortedRecords.some((record) => record.isPartial) || (selected.usedFallback && sortedRecords.length > 0);

    if (!sortedRecords.length) {
      return {
        status: "empty",
        items: [],
        sourceCount: 0,
        matchedCount: 0,
        usedFallback: false
      };
    }

    if (!selected.help) {
      return {
        status: "empty",
        items: sortedRecords,
        sourceCount: sortedRecords.length,
        matchedCount: 0,
        usedFallback: selected.usedFallback
      };
    }

    return {
      status: hasPartialData ? "partialData" : "ready",
      items: sortedRecords,
      help: selected.help,
      sourceCount: sortedRecords.length,
      matchedCount: selected.matchedCount,
      usedFallback: selected.usedFallback
    };
  }
}
