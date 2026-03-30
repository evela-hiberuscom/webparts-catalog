import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IMiniOrgChartConfig, IOrgPerson } from '../models/miniOrgChartModels';
import { mapToOrgPeople } from '../utils/miniOrgChartUtils';
import type { IOrgSourceRepository } from './IOrgSourceRepository';

export class DirectoryRepository implements IOrgSourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(config: IMiniOrgChartConfig): Promise<IOrgPerson[]> {
    if (!config.directoryEndpoint) {
      return [];
    }

    const response = await this.context.spHttpClient.get(config.directoryEndpoint, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`Directory endpoint failed with ${response.status}`);
    }

    return mapToOrgPeople(await response.json(), 'Directory');
  }
}

