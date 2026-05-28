import type {
  GovernanceSeverity,
  IGovernanceDashboardConfig,
  IGovernanceDashboardViewModel,
  IGovernanceFinding
} from '../models/governanceModels';
import {
  MockGovernanceDashboardRepository,
  type IGovernanceDashboardRepository
} from '../repositories/governanceDashboardRepository';

const severityRank: Record<GovernanceSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

export function normalizeMaxItems(maxItems: number): number {
  if (!Number.isFinite(maxItems) || maxItems < 1) {
    return 5;
  }

  return Math.min(Math.floor(maxItems), 10);
}

export function sortFindingsByRisk(findings: IGovernanceFinding[]): IGovernanceFinding[] {
  return [...findings].sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return left.dueDate.localeCompare(right.dueDate);
  });
}

export function selectVisibleFindings(findings: IGovernanceFinding[], maxItems: number): IGovernanceFinding[] {
  return sortFindingsByRisk(findings).slice(0, normalizeMaxItems(maxItems));
}

export class GovernanceDashboardService {
  private readonly repository: IGovernanceDashboardRepository;

  public constructor(repository: IGovernanceDashboardRepository = new MockGovernanceDashboardRepository()) {
    this.repository = repository;
  }

  public async loadDashboard(config: IGovernanceDashboardConfig): Promise<IGovernanceDashboardViewModel> {
    const data = await this.repository.load({ maxItems: config.maxItems });
    return {
      ...data,
      visibleFindings: selectVisibleFindings(data.findings, config.maxItems)
    };
  }
}
