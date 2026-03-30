import type {
  IPlannedMaintenanceHostContext,
  IPlannedMaintenanceWebPartProps
} from '../models/plannedMaintenanceModels';

export interface IPlannedMaintenanceProps {
  webPartProps: IPlannedMaintenanceWebPartProps;
  hostContext: IPlannedMaintenanceHostContext;
}
