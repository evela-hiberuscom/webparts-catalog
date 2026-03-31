import type { ICorporateAzConfiguration } from '../models/corporateAzModels';
import type { CorporateAzService } from '../services/corporateAzService';
export interface ICorporateAzProps { configuration: ICorporateAzConfiguration; service: CorporateAzService; title?: string; }