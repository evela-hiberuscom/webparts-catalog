import { IApprovalLoadResult, IApprovalRecord, IApprovalsSourceConfig } from '../models/myApprovalsModels';
import { createFallbackApprovals, normalizeApprovalRecord, normalizeListTitleOrUrl } from '../utils/myApprovalsUtils';

export interface ISharePointHttpClientLike {
  get(url: string, configuration: unknown, options?: Record<string, unknown>): Promise<{
    ok: boolean;
    status: number;
    json(): Promise<{ value?: Array<Record<string, unknown>> }>;
  }>;
}

export class SharePointApprovalsRepository {
  public constructor(
    private readonly spHttpClient: ISharePointHttpClientLike,
    private readonly siteUrl: string
  ) {}

  public async loadApprovals(config: IApprovalsSourceConfig): Promise<IApprovalLoadResult> {
    const target = normalizeListTitleOrUrl(config.listTitleOrUrl, this.siteUrl);
    if (!target) {
      return {
        items: createFallbackApprovals().filter((item) => item.source === 'SharePointList'),
        hasPartialData: true,
        warnings: ['sharepoint-list-target-missing']
      };
    }

    const apiUrl = `${this.siteUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${encodeURIComponent(target.listTitle)}')/items?$select=Id,Title,Requester,Source,Status,DueDate,Created,OpenUrl,Category,Details&$top=${Math.max(1, config.maxItems) * 2}`;
    const response = await this.spHttpClient.get(apiUrl, undefined, {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      return {
        items: createFallbackApprovals().filter((item) => item.source === 'SharePointList'),
        hasPartialData: true,
        warnings: [`sharepoint-list-http-${response.status}`]
      };
    }

    const payload = await response.json();
    const rawItems: Array<Record<string, unknown>> = Array.isArray(payload?.value)
      ? payload.value as Array<Record<string, unknown>>
      : [];
    const items = rawItems.map((item: Record<string, unknown>, index: number) => {
      const normalized = normalizeApprovalRecord(item, index);
      return {
        ...normalized,
        source: 'SharePointList',
        openUrl: normalized.openUrl || target.url
      } satisfies IApprovalRecord;
    });

    return {
      items,
      hasPartialData: items.some((item) => !item.openUrl || !item.requester || !item.dueDate),
      warnings: []
    };
  }
}
