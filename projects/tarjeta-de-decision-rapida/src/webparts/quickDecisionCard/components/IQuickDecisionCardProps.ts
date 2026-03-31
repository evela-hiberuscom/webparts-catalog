import type { IQuickDecisionConfiguration } from '../models/quickDecisionModels';
import type { QuickDecisionService } from '../services/quickDecisionService';
export interface IQuickDecisionCardProps { configuration: IQuickDecisionConfiguration; service: QuickDecisionService; title?: string; }