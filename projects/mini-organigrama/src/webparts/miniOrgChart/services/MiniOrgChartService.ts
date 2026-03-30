import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IMiniOrgChartConfig,
  IOrgLoadResult,
  IOrgPerson,
  MiniOrgChartDataSourceType
} from '../models/miniOrgChartModels';
import { DirectoryRepository } from '../repositories/DirectoryRepository';
import { JsonUrlRepository } from '../repositories/JsonUrlRepository';
import { OrgListRepository } from '../repositories/OrgListRepository';
import { StaticConfigRepository } from '../repositories/StaticConfigRepository';
import { mergePeople, normalizeDataSourceTypes } from '../utils/miniOrgChartUtils';

interface ISourceRunner {
  source: MiniOrgChartDataSourceType;
  load: (config: IMiniOrgChartConfig) => Promise<IOrgPerson[]>;
}

export class MiniOrgChartService {
  private readonly runners: ISourceRunner[];

  public constructor(context: WebPartContext) {
    const directoryRepository = new DirectoryRepository(context);
    const orgListRepository = new OrgListRepository(context);
    const jsonUrlRepository = new JsonUrlRepository(context);
    const staticConfigRepository = new StaticConfigRepository();

    this.runners = [
      { source: 'Directory', load: directoryRepository.load.bind(directoryRepository) },
      { source: 'SharePointList', load: orgListRepository.load.bind(orgListRepository) },
      { source: 'JsonUrl', load: jsonUrlRepository.load.bind(jsonUrlRepository) },
      { source: 'StaticConfig', load: staticConfigRepository.load.bind(staticConfigRepository) }
    ];
  }

  public async load(config: IMiniOrgChartConfig): Promise<IOrgLoadResult> {
    const selectedSources = ensureUniqueStrings(config.dataSourceTypes.length ? config.dataSourceTypes : normalizeDataSourceTypes(undefined)) as MiniOrgChartDataSourceType[];
    const people: IOrgPerson[] = [];
    const sourceSummaries: IOrgLoadResult['sourceSummaries'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const source of selectedSources) {
      const runner = this.runners.find((candidate) => candidate.source === source);
      if (!runner) {
        continue;
      }

      const sourceHasConfig = (
        source === 'Directory' ? !!config.directoryEndpoint :
        source === 'SharePointList' ? !!config.listTitleOrUrl :
        source === 'JsonUrl' ? !!config.jsonUrl :
        !!config.staticConfigJson
      );

      if (!sourceHasConfig) {
        sourceSummaries.push({ source, count: 0 });
        continue;
      }

      try {
        const sourcePeople = await runner.load(config);
        people.push(...sourcePeople);
        sourceSummaries.push({ source, count: sourcePeople.length });
      } catch (error) {
        const message = error instanceof Error ? error.message : `Failed to load ${source}`;
        sourceSummaries.push({ source, count: 0, warning: message });
        errors.push(message);
      }
    }

    return {
      people: mergePeople(people),
      sourceSummaries,
      warnings,
      errors
    };
  }
}
