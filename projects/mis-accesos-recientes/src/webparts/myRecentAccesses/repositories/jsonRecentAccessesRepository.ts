import type { IRecentAccessesRepository } from './IRecentAccessesRepository';
import { normalizeRecentResources } from '../utils/recentAccesses.mappers';
import type { IRecentResource } from '../models/recentAccesses.types';

type RecentItemsPayload = {
  items?: unknown[];
  value?: unknown[];
};

export class JsonRecentAccessesRepository implements IRecentAccessesRepository {
  public readonly sourceLabel = 'JSON feed';

  public readonly isAuthoritative = true;

  private readonly _url: string;

  public constructor(url: string) {
    this._url = url;
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
