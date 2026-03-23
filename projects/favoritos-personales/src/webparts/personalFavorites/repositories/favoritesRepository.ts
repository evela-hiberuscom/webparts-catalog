import type { IFavoriteLoadConfig, IRawFavoriteItem } from '../models/favoritesTypes';
import { clampNumber, describeSource, parseBoolean, parseNumber, parseFavoritesJson } from '../utils/favoritesUtils';

export interface IFavoritesRepositoryResult {
  items: IRawFavoriteItem[];
  warnings: string[];
  sourceLabel: string;
  isFallback: boolean;
}

export interface IFavoritesRepository {
  load(): Promise<IFavoritesRepositoryResult>;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function mapSharePointItem(item: Record<string, unknown>): IRawFavoriteItem {
  return {
    id: typeof item.Id === 'number' ? String(item.Id) : undefined,
    title: typeof item.Title === 'string' ? item.Title : undefined,
    description: typeof item.Description === 'string' ? item.Description : undefined,
    openUrl: typeof item.OpenUrl === 'string' ? item.OpenUrl : undefined,
    icon: typeof item.Icon === 'string' ? item.Icon : undefined,
    type: typeof item.Type === 'string' ? item.Type : undefined,
    category: typeof item.Category === 'string' ? item.Category : undefined,
    featured: parseBoolean(item.Featured),
    sortOrder: parseNumber(item.SortOrder)
  };
}

class StaticFavoritesRepository implements IFavoritesRepository {
  public constructor(private readonly config: IFavoriteLoadConfig) {}

  public async load(): Promise<IFavoritesRepositoryResult> {
    const parsed = parseFavoritesJson(this.config.favoritesJson);
    return {
      items: parsed.items,
      warnings: parsed.warnings,
      sourceLabel: describeSource(this.config.dataSourceType, this.config.listTitleOrUrl),
      isFallback: parsed.warnings.length > 0
    };
  }
}

class SharePointFavoritesRepository implements IFavoritesRepository {
  public constructor(private readonly config: IFavoriteLoadConfig) {}

  public async load(): Promise<IFavoritesRepositoryResult> {
    const listTitle = this.config.listTitleOrUrl.trim();
    if (!listTitle) {
      return {
        items: [],
        warnings: ['No se indicó la lista FavoritesList.'],
        sourceLabel: describeSource(this.config.dataSourceType, listTitle),
        isFallback: true
      };
    }

    if (this.config.currentUserId <= 0) {
      return {
        items: [],
        warnings: ['No se pudo resolver el usuario actual para filtrar FavoritesList.'],
        sourceLabel: describeSource(this.config.dataSourceType, listTitle),
        isFallback: true
      };
    }

    const webUrl = trimTrailingSlash(this.config.webAbsoluteUrl);
    const safeTitle = escapeODataString(listTitle);
    const limit = clampNumber(this.config.maxItems, 1, 50);
    const endpoint = `${webUrl}/_api/web/lists/getByTitle('${safeTitle}')/items?$select=Id,Title,Description,OpenUrl,Icon,Type,Category,Featured,SortOrder,FavoriteOwnerId&$filter=FavoriteOwnerId eq ${this.config.currentUserId}&$orderby=SortOrder asc,Title asc&$top=${limit}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer FavoritesList (${response.status}).`);
    }

    const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };
    const items = Array.isArray(payload.value) ? payload.value.map(mapSharePointItem) : [];

    return {
      items,
      warnings: [],
      sourceLabel: describeSource(this.config.dataSourceType, listTitle),
      isFallback: false
    };
  }
}

export function createFavoritesRepository(config: IFavoriteLoadConfig): IFavoritesRepository {
  switch (config.dataSourceType) {
    case 'SharePointList':
      return new SharePointFavoritesRepository(config);
    case 'StaticConfig':
    default:
      return new StaticFavoritesRepository(config);
  }
}
