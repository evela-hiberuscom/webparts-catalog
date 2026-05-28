import type { IRecentAccessesRepository } from './IRecentAccessesRepository';
import { normalizeRecentResources } from '../utils/recentAccesses.mappers';
import type { IRecentResource } from '../models/recentAccesses.types';
import { resolveSameOriginUrl } from '@paquete/spfx-common';

type RecentItemsPayload = {
  items?: unknown[];
  value?: unknown[];
};

function getRuntimeBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return `${window.location.origin}/`;
  }

  return 'https://contoso.sharepoint.com/';
}

export class JsonRecentAccessesRepository implements IRecentAccessesRepository {
  public readonly sourceLabel = 'JSON feed';

  public readonly isAuthoritative = true;

  private readonly _url: string;

  public constructor(url: string) {
    this._url = resolveSameOriginUrl(url, getRuntimeBaseUrl());
  }

  public async load(): Promise<IRecentResource[]> {
    const response = await fetch(this._url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to read recent items JSON feed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as RecentItemsPayload | IRecentResource[];
    const rawItems = Array.isArray(payload) ? payload : payload.items ?? payload.value ?? [];
    return normalizeRecentResources(rawItems as never[]);
  }
}
