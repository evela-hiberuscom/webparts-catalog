import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { classifyAsyncState } from '@paquete/spfx-common';
import type {
  ExpressDirectorySourceType,
  IExpressDirectorySourceRequest,
  IExpressDirectorySourceResult,
  IExpressDirectoryState,
  IPersonItem
} from '../models/expressDirectoryModels';
import {
  collectAreas,
  dedupePeople,
  filterAndSortPeople,
  inferPartialDataFlag,
  normalizeSearchText,
  parseDataSourceTypes
} from '../utils/expressDirectoryUtils';
import { DirectoryRepository } from '../repositories/DirectoryRepository';
import { JsonUrlRepository } from '../repositories/JsonUrlRepository';
import { PeopleListRepository } from '../repositories/PeopleListRepository';
import { StaticConfigRepository } from '../repositories/StaticConfigRepository';
import type { IExpressDirectorySourceRepository } from '../repositories/IExpressDirectorySourceRepository';

export interface IExpressDirectoryDependencies {
  directory: IExpressDirectorySourceRepository;
  peopleList: IExpressDirectorySourceRepository;
  jsonUrl: IExpressDirectorySourceRepository;
  staticConfig: IExpressDirectorySourceRepository;
}

function makeDependencies(context: WebPartContext): IExpressDirectoryDependencies {
  return {
    directory: new DirectoryRepository(context),
    peopleList: new PeopleListRepository(context),
    jsonUrl: new JsonUrlRepository(context),
    staticConfig: new StaticConfigRepository()
  };
}

function selectRepository(
  dependencies: IExpressDirectoryDependencies,
  sourceType: ExpressDirectorySourceType
): IExpressDirectorySourceRepository {
  switch (sourceType) {
    case 'Directory':
      return dependencies.directory;
    case 'SharePointList':
      return dependencies.peopleList;
    case 'JsonUrl':
      return dependencies.jsonUrl;
    case 'StaticConfig':
      return dependencies.staticConfig;
    default:
      return dependencies.directory;
  }
}

function mergeWarnings(results: IExpressDirectorySourceResult[]): string[] {
  return results.reduce<string[]>((accumulator, result) => {
    result.warnings.forEach((warning) => {
      if (accumulator.indexOf(warning) === -1) {
        accumulator.push(warning);
      }
    });
    return accumulator;
  }, []);
}

export class ExpressDirectoryService {
  public constructor(
    private readonly context: WebPartContext,
    private readonly dependencies: IExpressDirectoryDependencies = makeDependencies(context)
  ) {}

  public async load(
    request: IExpressDirectorySourceRequest,
    options: { query: string; selectedArea: string }
  ): Promise<IExpressDirectoryState> {
    const requestedSourceTypes = parseDataSourceTypes(request.dataSourceTypesCsv);
    const activeSourceTypes = requestedSourceTypes.length > 0
      ? requestedSourceTypes
      : (['Directory', 'SharePointList'] as ExpressDirectorySourceType[]);
    const selectedArea = normalizeSearchText(options.selectedArea || request.defaultAreaFilter);
    const query = options.query;

    const sourceResults = await Promise.all(
      activeSourceTypes.map(async (sourceType) => {
        try {
          return await selectRepository(this.dependencies, sourceType).load(request);
        } catch (error) {
          return {
            sourceType,
            sourceLabel: sourceType,
            items: [] as IPersonItem[],
            warnings: [error instanceof Error ? error.message : `${sourceType}-source-error`]
          } as IExpressDirectorySourceResult;
        }
      })
    );

    const sourceLabels = sourceResults.map((result) => result.sourceLabel);
    const warnings = mergeWarnings(sourceResults);
    const allItems = dedupePeople(
      sourceResults.reduce<IPersonItem[]>((accumulator, result) => accumulator.concat(result.items), [])
    );
    const items = filterAndSortPeople(allItems, query, selectedArea, request.maxItems || 12);
    const areas = collectAreas(allItems);
    const hasFailures = sourceResults.some((result) => result.warnings.some((warning) => /error|failed/i.test(warning)));
    const hasPartialData = hasFailures || inferPartialDataFlag(allItems) || warnings.length > 0;
    const hasData = items.length > 0;
    const stateClass = classifyAsyncState({
      hasData,
      hasError: hasFailures && !hasData,
      isLoading: false,
      isPartial: hasPartialData
    });

    return {
      status: stateClass as IExpressDirectoryState['status'],
      items,
      areas,
      hasPartialData,
      sourceLabels,
      warnings,
      query,
      selectedArea,
      errorMessage: hasFailures && !hasData ? warnings[0] || 'directory-error' : undefined
    };
  }
}
