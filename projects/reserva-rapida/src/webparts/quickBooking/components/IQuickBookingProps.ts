import type { IQuickBookingContext, IQuickBookingWebPartProps } from '../models/quickBookingModels';

export interface IQuickBookingProps extends IQuickBookingWebPartProps, IQuickBookingContext {
  userDisplayName: string;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
}
