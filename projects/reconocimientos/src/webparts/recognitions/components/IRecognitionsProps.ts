import type {
  IRecognitionsConfiguration,
  IRecognitionsService
} from '../models/recognitionsModels';

export interface IRecognitionsProps {
  configuration: IRecognitionsConfiguration;
  service: IRecognitionsService;
  localeName: string;
}
