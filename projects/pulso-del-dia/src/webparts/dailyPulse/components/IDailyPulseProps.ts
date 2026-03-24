import type { IDailyPulseWebPartProps } from '../models/dailyPulseModels';

export interface IDailyPulseProps extends IDailyPulseWebPartProps {
  userDisplayName: string;
  userLoginName?: string;
}
