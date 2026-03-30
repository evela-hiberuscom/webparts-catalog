import type { IMiniOrgChartConfig, IOrgPerson } from '../models/miniOrgChartModels';

export interface IOrgSourceRepository {
  load(config: IMiniOrgChartConfig): Promise<IOrgPerson[]>;
}

