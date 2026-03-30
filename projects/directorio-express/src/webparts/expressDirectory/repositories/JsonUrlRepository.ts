import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { buildSharePointJsonEndpoint, normalizePerson } from '../utils/expressDirectoryUtils';
import type { IExpressDirectorySourceRequest, IExpressDirectorySourceResult } from '../models/expressDirectoryModels';
import type { IExpressDirectorySourceRepository } from './IExpressDirectorySourceRepository';

interface IJsonPeoplePayload {
  items?: Array<Record<string, unknown>>;
}

export class JsonUrlRepository implements IExpressDirectorySourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(request: IExpressDirectorySourceRequest): Promise<IExpressDirectorySourceResult> {
    const endpoint = buildSharePointJsonEndpoint(this.context.pageContext.web.absoluteUrl, request.jsonUrl);
    const response = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

    if (!response.ok) {
      throw new Error(`JSON source failed (${response.status})`);
    }

    const payload = (await response.json()) as IJsonPeoplePayload | Array<Record<string, unknown>>;
    const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];
    const items = rawItems.map((item, index) =>
      normalizePerson({
        id: String(item.id ?? index + 1),
        displayName: String(item.displayName ?? item.name ?? ''),
        jobTitle: item.jobTitle === undefined ? undefined : String(item.jobTitle ?? ''),
        area: item.area === undefined ? undefined : String(item.area ?? ''),
        email: item.email === undefined ? undefined : String(item.email ?? ''),
        profileUrl: item.profileUrl === undefined ? undefined : String(item.profileUrl ?? ''),
        photoUrl: item.photoUrl === undefined ? undefined : String(item.photoUrl ?? '')
      })
    );

    return {
      sourceType: 'JsonUrl',
      sourceLabel: `JSON: ${request.jsonUrl}`,
      items,
      warnings: items.some((item) => !item.profileUrl || !item.photoUrl || !item.area || !item.jobTitle)
        ? ['json-partial']
        : []
    };
  }
}
