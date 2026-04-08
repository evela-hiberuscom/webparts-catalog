import type {
  ITemplatesLibraryConfiguration,
  ITemplatesLibraryService,
  ITemplatesLibraryState,
  ITemplatesRepository
} from '../models/templatesLibraryModels';
import { isTemplatePartial, sortTemplates } from '../utils/templatesLibraryUtils';

export class TemplatesLibraryService implements ITemplatesLibraryService {
  public constructor(private readonly repository: ITemplatesRepository) {}

  public async load(configuration: ITemplatesLibraryConfiguration): Promise<ITemplatesLibraryState> {
    try {
      const items = sortTemplates(await this.repository.getTemplates(configuration)).slice(0, configuration.maxItems);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          categories: [],
          types: [],
          hasPartialData: false
        };
      }

      const categories = Array.from(new Set(items.map((item) => item.category)));
      const types = Array.from(new Set(items.map((item) => item.templateType)));
      const hasPartialData = items.some((item) => isTemplatePartial(item));

      return {
        status: hasPartialData ? 'partialData' : 'ready',
        items,
        categories,
        types,
        hasPartialData
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        categories: [],
        types: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading templates'
      };
    }
  }
}
