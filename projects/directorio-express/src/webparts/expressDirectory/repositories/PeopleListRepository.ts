import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { buildSharePointListEndpoint, normalizePerson } from '../utils/expressDirectoryUtils';
import type { IExpressDirectorySourceRequest, IExpressDirectorySourceResult } from '../models/expressDirectoryModels';
import type { IExpressDirectorySourceRepository } from './IExpressDirectorySourceRepository';

interface ISharePointItem {
  Id: number;
  Title?: string;
  DisplayName?: string;
  JobTitle?: string;
  Area?: string;
  Email?: string;
  ProfileUrl?: string;
  PhotoUrl?: string;
}

interface ISharePointItemsResponse {
  value?: ISharePointItem[];
}

export class PeopleListRepository implements IExpressDirectorySourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(request: IExpressDirectorySourceRequest): Promise<IExpressDirectorySourceResult> {
    const endpoint = buildSharePointListEndpoint(this.context.pageContext.web.absoluteUrl, request.listTitleOrUrl);
    const response = await this.context.spHttpClient.get(
      `${this.buildApiUrl(endpoint)}&$top=${Math.max(1, request.maxItems || 12)}`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error(`SharePoint list query failed (${response.status})`);
    }

    const body = (await response.json()) as ISharePointItemsResponse;
    const items = (body.value ?? []).map((item) =>
      normalizePerson({
        id: String(item.Id),
        displayName: item.DisplayName || item.Title || `Persona ${item.Id}`,
        jobTitle: item.JobTitle || undefined,
        area: item.Area || undefined,
        email: item.Email || undefined,
        profileUrl: item.ProfileUrl || undefined,
        photoUrl: item.PhotoUrl || undefined
      })
    );

    return {
      sourceType: 'SharePointList',
      sourceLabel: request.listTitleOrUrl ? `SharePoint list: ${request.listTitleOrUrl}` : 'SharePoint list',
      items,
      warnings: items.some((item) => !item.profileUrl || !item.photoUrl || !item.area || !item.jobTitle)
        ? ['list-partial']
        : []
    };
  }

  private buildApiUrl(relativeOrAbsoluteUrl: string): string {
    if (/^https?:\/\//i.test(relativeOrAbsoluteUrl)) {
      return relativeOrAbsoluteUrl;
    }

    return `${this.context.pageContext.web.absoluteUrl}/_api/${relativeOrAbsoluteUrl.replace(/^\/+/, '')}`;
  }
}
