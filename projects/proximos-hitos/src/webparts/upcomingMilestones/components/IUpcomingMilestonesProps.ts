import type {
  IUpcomingMilestonesConfiguration,
  IUpcomingMilestonesService
} from '../models/upcomingMilestonesModels';

export interface IUpcomingMilestonesProps {
  configuration: IUpcomingMilestonesConfiguration;
  service: IUpcomingMilestonesService;
  environmentMessage: string;
  localeName: string;
}
