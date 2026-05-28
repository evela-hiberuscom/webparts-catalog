import type { IGovernanceDashboardData, IGovernanceDashboardConfig } from '../models/governanceModels';
import { mockGovernanceDashboardData } from '../mocks/governanceMockData';

export interface IGovernanceDashboardRepository {
  load(config: Pick<IGovernanceDashboardConfig, 'maxItems'>): Promise<IGovernanceDashboardData>;
}

export class MockGovernanceDashboardRepository implements IGovernanceDashboardRepository {
  public async load(): Promise<IGovernanceDashboardData> {
    return Promise.resolve({
      ...mockGovernanceDashboardData,
      metrics: [...mockGovernanceDashboardData.metrics],
      findings: [...mockGovernanceDashboardData.findings],
      recommendations: [...mockGovernanceDashboardData.recommendations],
      limitations: [...mockGovernanceDashboardData.limitations]
    });
  }
}
