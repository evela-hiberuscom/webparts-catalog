import type { IBookingResource, IQuickBookingContext, IQuickBookingWebPartProps } from '../models/quickBookingModels';
import {
  normalizeBookingResources,
  parseBookingResourcesJson,
  type IRawBookingResource
} from '../utils/bookingResourceHelpers';

export interface IBookingResourcesRepository {
  getResources(): Promise<IBookingResource[]>;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

interface IODataBookingResource {
  Id?: unknown;
  Title?: unknown;
  Category?: unknown;
  Site?: unknown;
  BookingUrl?: unknown;
  Availability?: unknown;
  Rules?: unknown;
  Featured?: unknown;
  Priority?: unknown;
}

function resolveSameOriginUrl(resourcesUrl: string, baseUrl: string): string {
  const resolvedUrl = new URL(resourcesUrl, baseUrl);
  const baseOrigin = new URL(baseUrl).origin;

  if (resolvedUrl.origin !== baseOrigin) {
    throw new Error('JsonUrl debe ser relativa o mantener el mismo origen que el sitio actual.');
  }

  if (resolvedUrl.protocol !== 'http:' && resolvedUrl.protocol !== 'https:') {
    throw new Error('JsonUrl solo admite recursos HTTP o HTTPS en el mismo sitio.');
  }

  return resolvedUrl.toString();
}

class StaticBookingResourcesRepository implements IBookingResourcesRepository {
  public constructor(private readonly resourcesJson: string) {}

  public async getResources(): Promise<IBookingResource[]> {
    return parseBookingResourcesJson(this.resourcesJson);
  }
}

class JsonUrlBookingResourcesRepository implements IBookingResourcesRepository {
  public constructor(private readonly baseWebUrl: string, private readonly resourcesUrl: string) {}

  public async getResources(): Promise<IBookingResource[]> {
    const endpoint = resolveSameOriginUrl(this.resourcesUrl, this.baseWebUrl);
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`JSON URL returned ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    if (Array.isArray(payload)) {
      return normalizeBookingResources(payload as IRawBookingResource[]);
    }

    if (payload && typeof payload === 'object' && 'resources' in payload && Array.isArray((payload as { resources?: unknown }).resources)) {
      return normalizeBookingResources((payload as { resources: IRawBookingResource[] }).resources);
    }

    throw new Error('JsonUrl debe devolver un array o un objeto con la propiedad resources.');
  }
}

class SharePointListBookingResourcesRepository implements IBookingResourcesRepository {
  public constructor(private readonly context: IQuickBookingContext, private readonly listTitle: string) {}

  public async getResources(): Promise<IBookingResource[]> {
    try {
      const listTitle = encodeURIComponent(escapeODataString(this.listTitle));
      const select = 'Id,Title,Category,Site,BookingUrl,Availability,Rules,Featured,Priority';
      const endpoint = `${this.context.webUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=${select}&$top=100`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json;odata=nometadata'
        }
      });

      if (!response.ok) {
        throw new Error(`SharePoint list returned ${response.status}`);
      }

      const payload = (await response.json()) as { value?: IODataBookingResource[]; d?: { results?: IODataBookingResource[] } };
      const items = payload.value ?? payload.d?.results ?? [];
      return normalizeBookingResources(
        items.map((item) => ({
          id: item.Id,
          name: item.Title,
          category: item.Category,
          site: item.Site,
          bookingUrl: item.BookingUrl,
          availability: item.Availability,
          rules: item.Rules,
          featured: item.Featured,
          priority: item.Priority
        }))
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('No se han podido cargar los recursos desde SharePoint.');
    }
  }
}

export function createBookingResourcesRepository(
  context: IQuickBookingContext,
  props: IQuickBookingWebPartProps
): IBookingResourcesRepository {
  const sourceValue = props.listTitleOrUrl.trim();

  if (props.dataSourceType === 'JsonUrl') {
    if (!sourceValue) {
      throw new Error('JsonUrl requiere una URL relativa o del mismo origen.');
    }

    return new JsonUrlBookingResourcesRepository(context.webUrl, sourceValue);
  }

  if (props.dataSourceType === 'SharePointList') {
    if (!sourceValue) {
      throw new Error('SharePointList requiere el titulo de la lista.');
    }

    return new SharePointListBookingResourcesRepository(context, sourceValue);
  }

  return new StaticBookingResourcesRepository(props.resourcesJson);
}
