import type {
  IRecycleBinItem,
  IRecycleBinHttpClient,
  IRecycleBinStageDiagnostics,
  RecycleBinStage
} from '../models/recycleBinSpaceCalculatorModels';
import { aggregateStage, buildRecycleBinUrl, coerceRecycleBinItem, createUnavailableStage, extractArray } from '../utils/recycleBinSpaceCalculatorUtils';

export interface IRecycleBinSpaceCalculatorRepositoryOptions {
  siteUrl: string;
  spHttpClient: IRecycleBinHttpClient;
}

export class RecycleBinSpaceCalculatorRepository {
  public constructor(private readonly options: IRecycleBinSpaceCalculatorRepositoryOptions) {}

  public async loadStage(stage: RecycleBinStage): Promise<IRecycleBinStageDiagnostics> {
    const endpoint = buildRecycleBinUrl(this.options.siteUrl, stage);

    try {
      const response = await this.options.spHttpClient.get(endpoint, undefined);

      if (!response.ok) {
        return createUnavailableStage(stage, `HTTP ${response.status} al leer la papelera de nivel ${stage}.`);
      }

      const payload = await response.json();
      const rawItems = extractArray(payload);
      const items = rawItems
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => coerceRecycleBinItem(item, stage));

      return aggregateStage(items, stage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al leer la papelera.';
      return createUnavailableStage(stage, message);
    }
  }
}

export function isPartialStage(stage: IRecycleBinStageDiagnostics): boolean {
  return !stage.isAccessible || stage.precision === 'partial';
}

export function hasAnyItemSizes(items: IRecycleBinItem[]): boolean {
  return items.some((item) => item.sizeBytes !== null);
}
