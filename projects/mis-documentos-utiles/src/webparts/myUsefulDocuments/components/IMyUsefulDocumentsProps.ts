import type { IUsefulDocumentsConfiguration } from '../models/usefulDocumentModels';
import type { UsefulDocumentsService } from '../services/usefulDocumentsService';

export interface IMyUsefulDocumentsProps {
  configuration: IUsefulDocumentsConfiguration;
  service: UsefulDocumentsService;
  autoRefreshSeconds?: number;
  title?: string;
}