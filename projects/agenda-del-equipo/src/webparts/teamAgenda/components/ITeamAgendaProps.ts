import type { ITeamAgendaConfiguration, ITeamAgendaService } from '../models/teamAgendaModels';

export interface ITeamAgendaProps {
  configuration: ITeamAgendaConfiguration;
  service: ITeamAgendaService;
  localeName: string;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
}
