import type { IHttpClient } from '../models/httpClient';
import type { ISiteReportListItem } from '../models/siteReport';

export interface IReportListRepositoryOptions {
  spHttpClient: IHttpClient;
  reportListUrl: string;
}

export class ReportListRepository {
  private readonly options: IReportListRepositoryOptions;

  public constructor(options: IReportListRepositoryOptions) {
    this.options = options;
  }

  public async getReports(): Promise<ISiteReportListItem[]> {
    const endpoint = `${this.listApiBase()}items?$top=5000&$orderby=ScanDate desc`;

    const response = await this.options.spHttpClient.get(endpoint, undefined, {
      headers: { Accept: 'application/json;odata=nometadata' }
    });

    if (!response.ok) {
      throw new Error(`Failed to read report list: HTTP ${response.status}`);
    }

    const payload = await response.json() as { value?: ISiteReportListItem[] };
    return payload?.value ?? [];
  }

  public async saveReport(item: ISiteReportListItem): Promise<void> {
    const endpoint = `${this.listApiBase()}items`;

    const response = await this.options.spHttpClient.post(endpoint, undefined, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata'
      },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      throw new Error(`Failed to save report for ${item.SiteUrl}: HTTP ${response.status}`);
    }
  }

  public async saveReportsBatch(items: ISiteReportListItem[]): Promise<void> {
    for (const item of items) {
      await this.saveReport(item);
    }
  }

  private listApiBase(): string {
    const url = this.options.reportListUrl.replace(/\/$/, '');

    if (url.includes('/_api/')) {
      return url.endsWith('/') ? url : `${url}/`;
    }

    // Expect format: https://tenant.sharepoint.com/sites/admin/Lists/SiteStorageReports
    // or just a site URL that defaults to list name 'SiteStorageReports'
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/Lists/');
      if (pathParts.length === 2 && pathParts[1]) {
        const listTitle = decodeURIComponent(pathParts[1].split('/')[0]);
        const siteBase = `${parsed.origin}${pathParts[0]}`;
        return `${siteBase}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/`;
      }
      return `${parsed.origin}${parsed.pathname}/_api/web/lists/getbytitle('SiteStorageReports')/`;
    } catch {
      throw new Error(`Invalid report list URL: ${url}`);
    }
  }
}
