import type { IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';
import type { FeaturedQuestionService } from '../services/featuredQuestionService';
export interface IFeaturedQuestionProps { configuration: IFeaturedQuestionConfiguration; service: FeaturedQuestionService; title?: string; }