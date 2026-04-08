import type {
  ITemplatesLibraryConfiguration,
  ITemplatesLibraryService
} from '../models/templatesLibraryModels';

export interface ITemplatesLibraryProps {
  configuration: ITemplatesLibraryConfiguration;
  service: ITemplatesLibraryService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
