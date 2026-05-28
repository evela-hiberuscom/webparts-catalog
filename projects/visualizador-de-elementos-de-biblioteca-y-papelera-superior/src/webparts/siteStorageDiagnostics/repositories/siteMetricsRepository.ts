import type { IHttpClient, IHttpResponse } from '../models/httpClient';
import type { ILibraryItemMetrics, ILibraryMetrics, IRecycleBinMetrics } from '../models/siteReport';

export class ThrottledError extends Error {
  public readonly retryAfterSeconds: number;
  public constructor(retryAfter: number) {
    super(`Throttled (429). Retry after ${retryAfter}s`);
    this.retryAfterSeconds = retryAfter;
    this.name = 'ThrottledError';
    Object.setPrototypeOf(this, ThrottledError.prototype);
  }
}

export interface ISiteMetricsOptions {
  spHttpClient: IHttpClient;
}

export interface ISiteUsage {
  storageUsedBytes: number | undefined;
  storageQuotaBytes: number | undefined;
}

export class SiteMetricsRepository {
  private readonly options: ISiteMetricsOptions;

  public constructor(options: ISiteMetricsOptions) {
    this.options = options;
  }

  public async getDocumentLibraries(siteUrl: string): Promise<ILibraryMetrics[]> {
    const endpoint = `${this.normalize(siteUrl)}/_api/web/lists?$filter=BaseTemplate eq 101 and Hidden eq false&$select=Id,Title,ItemCount,LastItemModifiedDate&$top=100`;

    const response = await this.options.spHttpClient.get(endpoint, undefined, {
      headers: { Accept: 'application/json;odata=nometadata' }
    });

    this.checkThrottled(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch libraries from ${siteUrl}: HTTP ${response.status}`);
    }

    const payload = await response.json() as { value?: Array<{ Id: string; Title: string; ItemCount: number; LastItemModifiedDate: string }> };
    const items = payload?.value ?? [];

    return items.map((item) => ({
      id: item.Id,
      title: item.Title,
      itemCount: item.ItemCount,
      lastModified: item.LastItemModifiedDate || undefined
    }));
  }

  public async getLibraryItems(siteUrl: string, libraryId: string): Promise<ILibraryItemMetrics[]> {
    let endpoint = `${this.normalize(siteUrl)}/_api/web/lists(guid'${libraryId}')/items?$select=Id,Modified,Editor/Title,FileSystemObjectType,File/Name,File/ServerRelativeUrl,File/Length,Folder/Name,Folder/ServerRelativeUrl&$expand=Editor,File,Folder&$orderby=Modified desc&$top=5000`;
    const items: ILibraryItemMetrics[] = [];

    while (endpoint) {
      const response = await this.options.spHttpClient.get(endpoint, undefined, {
        headers: { Accept: 'application/json;odata=nometadata' }
      });

      this.checkThrottled(response);

      if (!response.ok) {
        throw new Error(`Failed to fetch library items from ${siteUrl}: HTTP ${response.status}`);
      }

      const payload = await response.json() as {
        value?: Array<{
          Id: number;
          Modified?: string;
          Editor?: { Title?: string };
          FileSystemObjectType?: number;
          File?: {
            Name?: string;
            ServerRelativeUrl?: string;
            Length?: number | string;
          };
          Folder?: {
            Name?: string;
            ServerRelativeUrl?: string;
          };
        }>;
        '@odata.nextLink'?: string;
      };

      for (const item of payload?.value ?? []) {
        const isFolder = item.FileSystemObjectType === 1;
        const rawSize = item.File?.Length;
        const parsedSize = typeof rawSize === 'string'
          ? parseInt(rawSize, 10)
          : rawSize;
        const relativeUrl = isFolder ? item.Folder?.ServerRelativeUrl : item.File?.ServerRelativeUrl;
        const name = isFolder ? item.Folder?.Name : item.File?.Name;

        items.push({
          id: String(item.Id),
          name: name || '(sin nombre)',
          url: relativeUrl ? this.toAbsoluteUrl(siteUrl, relativeUrl) : this.normalize(siteUrl),
          sizeBytes: isFolder ? undefined : Number.isFinite(parsedSize) ? Number(parsedSize) : undefined,
          lastModified: item.Modified || undefined,
          modifiedBy: item.Editor?.Title || undefined,
          isFolder
        });
      }

      endpoint = payload['@odata.nextLink'] || '';
    }

    return items;
  }

  public async getRecycleBinMetrics(siteUrl: string): Promise<IRecycleBinMetrics> {
    const endpoint = `${this.normalize(siteUrl)}/_api/web/RecycleBin?$top=5000&$select=Id,Size`;

    try {
      const response = await this.options.spHttpClient.get(endpoint, undefined, {
        headers: { Accept: 'application/json;odata=nometadata' }
      });

      this.checkThrottled(response);

      if (!response.ok) {
        return {
          itemCount: undefined,
          sizeBytes: undefined,
          isAccessible: false,
          errorMessage: `HTTP ${response.status}`
        };
      }

      const payload = await response.json() as { value?: Array<{ Size?: number }> };
      const items = payload?.value ?? [];

      const totalSize = items.reduce((sum, item) => {
        const size = typeof item.Size === 'number' ? item.Size : 0;
        return sum + size;
      }, 0);

      return {
        itemCount: items.length,
        sizeBytes: totalSize,
        isAccessible: true,
        errorMessage: undefined
      };
    } catch (error) {
      return {
        itemCount: undefined,
        sizeBytes: undefined,
        isAccessible: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async getSiteUsage(siteUrl: string): Promise<ISiteUsage> {
    const endpoint = `${this.normalize(siteUrl)}/_api/site/usage`;

    try {
      const response = await this.options.spHttpClient.get(endpoint, undefined, {
        headers: { Accept: 'application/json;odata=nometadata' }
      });

      this.checkThrottled(response);

      if (!response.ok) {
        console.warn(`[SiteMetricsRepository] Site usage endpoint returned HTTP ${response.status} for ${siteUrl}.`);
        return { storageUsedBytes: undefined, storageQuotaBytes: undefined };
      }

      const payload = await response.json() as { Usage?: { Storage?: number; StoragePercentageUsed?: number }; Storage?: number; StoragePercentageUsed?: number };
      const usage = payload?.Usage ?? payload;

      return {
        storageUsedBytes: typeof usage?.Storage === 'number' ? usage.Storage : undefined,
        storageQuotaBytes: undefined
      };
    } catch (error) {
      console.warn('[SiteMetricsRepository] Unable to read site usage.', error);
      return { storageUsedBytes: undefined, storageQuotaBytes: undefined };
    }
  }

  private normalize(url: string): string {
    return url.replace(/\/$/, '');
  }

  private toAbsoluteUrl(siteUrl: string, candidate: string): string {
    try {
      return new URL(candidate, this.normalize(siteUrl)).toString();
    } catch (error) {
      console.warn('[SiteMetricsRepository] Unable to convert server-relative URL to absolute URL.', error);
      return candidate;
    }
  }

  private checkThrottled(response: IHttpResponse): void {
    if (response.status === 429 || response.status === 503) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 30;
      throw new ThrottledError(Number.isFinite(retryAfter) ? retryAfter : 30);
    }
  }
}
