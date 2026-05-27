import type { IHttpClient } from '../models/httpClient';

export interface IDiscoveredSite {
  url: string;
  title: string;
}

export interface ISiteDiscoveryOptions {
  spHttpClient: IHttpClient;
  currentSiteUrl: string;
}

export class SiteDiscoveryRepository {
  private readonly options: ISiteDiscoveryOptions;

  public constructor(options: ISiteDiscoveryOptions) {
    this.options = options;
  }

  public async discoverSites(): Promise<IDiscoveredSite[]> {
    const allSites: IDiscoveredSite[] = [];
    let startRow = 0;
    const rowLimit = 500;
    const maxPages = 20;
    let hasMore = true;
    let page = 0;

    while (hasMore && page < maxPages) {
      const batch = await this.fetchSearchPage(startRow, rowLimit);
      if (batch.sites.length === 0) break;
      allSites.push(...batch.sites);
      hasMore = batch.totalRows > startRow + rowLimit;
      startRow += rowLimit;
      page += 1;
    }

    return this.deduplicateSites(allSites);
  }

  private async fetchSearchPage(startRow: number, rowLimit: number): Promise<{ sites: IDiscoveredSite[]; totalRows: number }> {
    const queryText = encodeURIComponent("contentclass:STS_Site");
    const selectProperties = encodeURIComponent("Title,SPSiteURL,Path,SiteTitle");
    const endpoint = `${this.normalizeSiteUrl()}/_api/search/query?querytext='${queryText}'&selectproperties='${selectProperties}'&rowlimit=${rowLimit}&startrow=${startRow}&trimduplicates=true`;

    const response = await this.options.spHttpClient.get(endpoint, undefined, {
      headers: { Accept: 'application/json;odata=nometadata' }
    });

    if (!response.ok) {
      throw new Error(`Search API returned HTTP ${response.status}`);
    }

    const payload = await response.json() as {
      PrimaryQueryResult?: {
        RelevantResults?: {
          TotalRows?: number;
          Table?: {
            Rows?: Array<{ Cells: Array<{ Key: string; Value: string }> }>;
          };
        };
      };
    };

    const relevantResults = payload?.PrimaryQueryResult?.RelevantResults;
    const totalRows = relevantResults?.TotalRows ?? 0;
    const rows = relevantResults?.Table?.Rows ?? [];

    const sites: IDiscoveredSite[] = rows
      .map((row) => this.parseSearchRow(row.Cells))
      .filter((site): site is IDiscoveredSite => site !== undefined);

    return { sites, totalRows };
  }

  private parseSearchRow(cells: Array<{ Key: string; Value: string }>): IDiscoveredSite | undefined {
    const cellMap = new Map(cells.map((c) => [c.Key, c.Value]));
    const url = cellMap.get('SPSiteURL') || cellMap.get('Path') || '';
    const title = cellMap.get('SiteTitle') || cellMap.get('Title') || '';

    if (!url) {
      return undefined;
    }

    return { url: url.replace(/\/$/, ''), title };
  }

  private deduplicateSites(sites: IDiscoveredSite[]): IDiscoveredSite[] {
    const seen = new Map<string, IDiscoveredSite>();
    for (const site of sites) {
      const normalized = site.url.toLowerCase();
      if (!seen.has(normalized)) {
        seen.set(normalized, site);
      }
    }
    return Array.from(seen.values());
  }

  private normalizeSiteUrl(): string {
    return this.options.currentSiteUrl.replace(/\/$/, '');
  }
}
