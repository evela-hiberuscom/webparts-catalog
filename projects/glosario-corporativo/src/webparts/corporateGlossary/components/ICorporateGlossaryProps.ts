import type {
  ICorporateGlossaryConfiguration,
  ICorporateGlossaryService
} from '../models/corporateGlossaryModels';

export interface ICorporateGlossaryProps {
  configuration: ICorporateGlossaryConfiguration;
  service: ICorporateGlossaryService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
