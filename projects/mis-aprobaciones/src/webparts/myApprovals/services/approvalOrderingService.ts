import { ApprovalSortKey, IApprovalCounts, IApprovalItem, IApprovalRecord } from '../models/myApprovalsModels';
import { decorateApprovalRecord, limitApprovals, sortApprovalItems, summarizeApprovalCounts } from '../utils/myApprovalsUtils';

export class ApprovalOrderingService {
  public order(items: IApprovalRecord[], sortKey: ApprovalSortKey): IApprovalItem[] {
    return sortApprovalItems(items, sortKey).map((item) => decorateApprovalRecord(item));
  }

  public filterCompleted(items: IApprovalItem[], showCompleted: boolean): IApprovalItem[] {
    if (showCompleted) {
      return items;
    }

    return items.filter((item) => item.status !== 'completed');
  }

  public limit(items: IApprovalItem[], maxItems: number): IApprovalItem[] {
    return limitApprovals(items, maxItems) as IApprovalItem[];
  }

  public summarize(items: IApprovalRecord[]): IApprovalCounts {
    return summarizeApprovalCounts(items);
  }
}
