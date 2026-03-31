import { IApprovalsAggregationService, IApprovalsSourceConfig } from '../models/myApprovalsModels';

export interface IMyApprovalsProps {
  title: string;
  description?: string;
  config: IApprovalsSourceConfig;
  service?: IApprovalsAggregationService;
}
