import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IMiniOrgChartConfig, IOrgPerson } from '../models/miniOrgChartModels';
import { buildSharePointListEndpoint, mapToOrgPeople } from '../utils/miniOrgChartUtils';
import type { IOrgSourceRepository } from './IOrgSourceRepository';

export class OrgListRepository implements IOrgSourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(config: IMiniOrgChartConfig): Promise<IOrgPerson[]> {
    const endpoint = buildSharePointListEndpoint(config.listTitleOrUrl, this.context.pageContext.web.absoluteUrl);
    if (!endpoint) {
      return [];
    }

    const response = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`Org list request failed with ${response.status}`);
    }

    return mapToOrgPeople(await response.json(), 'SharePointList');
  }
}

