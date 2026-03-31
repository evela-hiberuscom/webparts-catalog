import { IApprovalLoadResult, IApprovalsRepository, IApprovalsSourceConfig } from '../models/myApprovalsModels';
import { createFallbackApprovals, normalizeApprovalRecord } from '../utils/myApprovalsUtils';
import { ISharePointHttpClientLike, SharePointApprovalsRepository } from './sharePointApprovalsRepository';

function isSameOrigin(url: URL, siteUrl: string): boolean {
  try {
    return url.origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

async function loadJsonApprovals(sourceUrl: string, siteUrl: string, maxItems: number): Promise<IApprovalLoadResult> {
  const resolved = new URL(sourceUrl, siteUrl);
  if (!isSameOrigin(resolved, siteUrl)) {
    return {
      items: createFallbackApprovals(),
      hasPartialData: true,
      warnings: ['json-url-cross-origin-blocked']
    };
  }

  const response = await fetch(resolved.toString(), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    return {
      items: createFallbackApprovals(),
      hasPartialData: true,
      warnings: [`json-url-http-${response.status}`]
    };
  }

  const payload = await response.json();
  const values: Array<Record<string, unknown>> = Array.isArray(payload)
    ? payload as Array<Record<string, unknown>>
    : Array.isArray(payload?.value)
      ? payload.value as Array<Record<string, unknown>>
      : [];
  const items = values.slice(0, maxItems * 2).map((item: Record<string, unknown>, index: number) => normalizeApprovalRecord(item, index));
  return {
    items,
    hasPartialData: items.some((item) => !item.openUrl || !item.requester || !item.dueDate),
    warnings: []
  };
}

export class ApprovalsRepository implements IApprovalsRepository {
  public constructor(
    private readonly spHttpClient: ISharePointHttpClientLike,
    private readonly siteUrl: string
  ) {}

  public async loadApprovals(config: IApprovalsSourceConfig): Promise<IApprovalLoadResult> {
    switch (config.dataSourceType) {
      case 'SharePointList':
        return new SharePointApprovalsRepository(this.spHttpClient, this.siteUrl).loadApprovals(config);
      case 'JsonUrl':
        if (!config.sourceUrl) {
          return {
            items: createFallbackApprovals(),
            hasPartialData: true,
            warnings: ['json-url-missing']
          };
        }
        return loadJsonApprovals(config.sourceUrl, this.siteUrl, config.maxItems);
      case 'Approvals':
      default:
        if (!config.sourceUrl) {
          return {
            items: createFallbackApprovals(),
            hasPartialData: false,
            warnings: ['approvals-fallback']
          };
        }

        return loadJsonApprovals(config.sourceUrl, this.siteUrl, config.maxItems);
    }
  }
}
