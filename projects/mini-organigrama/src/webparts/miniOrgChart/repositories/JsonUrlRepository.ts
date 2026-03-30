import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IMiniOrgChartConfig, IOrgPerson } from '../models/miniOrgChartModels';
import { mapToOrgPeople } from '../utils/miniOrgChartUtils';
import type { IOrgSourceRepository } from './IOrgSourceRepository';

export class JsonUrlRepository implements IOrgSourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(config: IMiniOrgChartConfig): Promise<IOrgPerson[]> {
    if (!config.jsonUrl) {
      return [];
    }

    const target = new URL(config.jsonUrl, this.context.pageContext.web.absoluteUrl);
    if (target.origin !== new URL(this.context.pageContext.web.absoluteUrl).origin) {
      throw new Error('jsonUrl must be same-origin.');
    }

    const response = await this.context.spHttpClient.get(target.toString(), SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`jsonUrl request failed with ${response.status}`);
    }

    return mapToOrgPeople(await response.json(), 'JsonUrl');
  }
}

