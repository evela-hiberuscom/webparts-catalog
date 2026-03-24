import type { IMeetTheTeamHostContext, IMeetTheTeamWebPartProps } from '../models/teamMemberModels';

export interface IMeetTheTeamProps {
  webPartProps: IMeetTheTeamWebPartProps;
  hostContext: IMeetTheTeamHostContext;
  isDarkTheme: boolean;
  userDisplayName: string;
}
