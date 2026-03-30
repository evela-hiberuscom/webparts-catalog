import type { IMiniOrgChartConfig, IOrgPerson } from '../models/miniOrgChartModels';
import { mapToOrgPeople } from '../utils/miniOrgChartUtils';
import type { IOrgSourceRepository } from './IOrgSourceRepository';

export class StaticConfigRepository implements IOrgSourceRepository {
  public async load(config: IMiniOrgChartConfig): Promise<IOrgPerson[]> {
    if (!config.staticConfigJson) {
      return [];
    }

    return mapToOrgPeople(JSON.parse(config.staticConfigJson) as unknown, 'StaticConfig');
  }
}

