import type {
  IWhatChangedFeedConfiguration,
  IWhatChangedFeedContext,
  IWhatChangedFeedItem,
  IWhatChangedFeedRepository
} from '../models/whatChangedFeedModels';
import {
  clampMaxItems,
  resolveAbsoluteUrl,
  sanitizeText
} from '../utils/whatChangedFeedUtils';

interface ISharePointChangeItem {
  Id: number;
  Title?: string;
  Description?: string;
  Modified?: string;
  FileRef?: string;
  EncodedAbsUrl?: string;
  ChangeType?: string;
  ContentType?: string;
  File_x0020_Type?: string;
  PromotedState?: number;
  FSObjType?: number;
}

interface ISharePointItemsResponse {
  value?: ISharePointChangeItem[];
}

export class WhatChangedFeedRepository implements IWhatChangedFeedRepository {
  public constructor(private readonly context: IWhatChangedFeedContext) {}

  public async getChanges(configuration: IWhatChangedFeedConfiguration): Promise<IWhatChangedFeedItem[]> {
    const maxItems = clampMaxItems(configuration.maxItems);
    const isLibrary = configuration.sourceKind === 'library';
    const filter = isLibrary ? '&$filter=FSObjType eq 0' : '';
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(configuration.listTitleOrUrl)}')/items` +
      `?$select=Id,Title,Description,Modified,FileRef,EncodedAbsUrl,ChangeType,ContentType,File_x0020_Type,FSObjType,PromotedState` +
      `${filter}&$orderby=Modified desc&$top=${Math.max(maxItems * 3, 12)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load changes: ${response.status}`);
    }

    const payload = await response.json() as ISharePointItemsResponse;
    return (payload.value ?? []).map((item) => this.mapItem(item));
  }

  private mapItem(item: ISharePointChangeItem): IWhatChangedFeedItem {
    const type = sanitizeText(item.ChangeType) || sanitizeText(item.ContentType) || sanitizeText(item.File_x0020_Type) || 'General';
    const openUrl = resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.EncodedAbsUrl || item.FileRef);

    return {
      id: String(item.Id),
      title: sanitizeText(item.Title) || 'Elemento actualizado',
      type,
      changedAt: item.Modified,
      summary: sanitizeText(item.Description),
      openUrl,
      featured: false
    };
  }
}
