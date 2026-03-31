import { IApprovalSnapshot, IApprovalsAggregationService, IApprovalsRepository, IApprovalsSourceConfig } from '../models/myApprovalsModels';
import { ApprovalOrderingService } from './approvalOrderingService';

export class ApprovalsAggregationService implements IApprovalsAggregationService {
  public constructor(
    private readonly repository: IApprovalsRepository,
    private readonly orderingService: ApprovalOrderingService
  ) {}

  public async loadSnapshot(config: IApprovalsSourceConfig): Promise<IApprovalSnapshot> {
    const result = await this.repository.loadApprovals(config);
    const ordered = this.orderingService.order(result.items, config.defaultSort);
    const filtered = this.orderingService.filterCompleted(ordered, config.showCompleted);
    const limited = this.orderingService.limit(filtered, config.maxItems);

    return {
      items: limited,
      counts: this.orderingService.summarize(limited),
      hasPartialData: result.hasPartialData || limited.some((item) => item.isPartial),
      sourceWarnings: result.warnings
    };
  }
}
