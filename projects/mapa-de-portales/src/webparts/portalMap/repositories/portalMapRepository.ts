import type { IPortalMapRepositoryResult, IPortalMapRequest } from '../models/portalMapModels';
import {
  buildPortalMapItemsEndpoint,
  createStaticPortalNodes,
  parsePortalCollection,
  parsePortalNode,
  resolveSameOriginUrl
} from '../utils/portalMapUtils';

interface IFetchLikeResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchLikeResponse>;

function collectSharePointHeaders(): Record<string, string> {
  return {
    Accept: 'application/json;odata=nometadata'
  };
}

function collectJsonHeaders(): Record<string, string> {
  return {
    Accept: 'application/json'
  };
}

async function fetchPayload(fetcher: Fetcher, url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetcher(url, init);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

export class PortalMapRepository {
  public constructor(
    private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher
  ) {}

  public async load(request: IPortalMapRequest): Promise<IPortalMapRepositoryResult> {
    if (request.dataSourceType === 'StaticConfig') {
      const staticItems = createStaticPortalNodes();
      return {
        items: staticItems,
        hasPartialData: staticItems.some((item) => item.partialData)
      };
    }

    if (request.dataSourceType === 'JsonUrl') {
      const endpoint = resolveSameOriginUrl(request.listTitleOrUrl, request.webUrl);
      const payload = await fetchPayload(this.fetcher, endpoint, {
        headers: collectJsonHeaders(),
        credentials: 'same-origin'
      });
      const items = parsePortalCollection(payload).map((item, index) => parsePortalNode(item, index));

      return {
        items,
        hasPartialData: items.some((item) => item.partialData)
      };
    }

    const endpoint = buildPortalMapItemsEndpoint(request.webUrl, request.listTitleOrUrl);
    const payload = await fetchPayload(this.fetcher, endpoint, {
      headers: collectSharePointHeaders(),
      credentials: 'same-origin'
    });
    const items = parsePortalCollection(payload).map((item, index) => parsePortalNode(item, index));

    return {
      items,
      hasPartialData: items.some((item) => item.partialData)
    };
  }
}
