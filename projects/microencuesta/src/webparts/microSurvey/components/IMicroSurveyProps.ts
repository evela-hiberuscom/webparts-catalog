import type { IMicroSurveyConfiguration } from '../models/pollModels';
import type { MicroSurveyService } from '../services/microSurveyService';

export interface IMicroSurveyProps {
  configuration: IMicroSurveyConfiguration;
  service: MicroSurveyService;
}
