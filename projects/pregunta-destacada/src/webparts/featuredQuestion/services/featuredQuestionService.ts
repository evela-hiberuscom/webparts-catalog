import { IFeaturedQuestion, IFeaturedQuestionConfiguration, AsyncState } from '../models/featuredQuestionModels';
import { FeaturedQuestionRepository } from '../repositories/featuredQuestionRepository';

export class FeaturedQuestionService {
  private _repository: FeaturedQuestionRepository;
  constructor(repository: FeaturedQuestionRepository) { this._repository = repository; }

  async loadQuestion(config: IFeaturedQuestionConfiguration): Promise<AsyncState<IFeaturedQuestion[]>> {
    try {
      const questions = await this._repository.getQuestion(config);
      if (!questions?.length) return { status: 'empty' };
      const hasPartialData = questions.some(q => !q.options?.length);
      if (hasPartialData) return { status: 'partialData', data: questions, hasPartialData: true };
      return { status: 'ready', data: questions };
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
}