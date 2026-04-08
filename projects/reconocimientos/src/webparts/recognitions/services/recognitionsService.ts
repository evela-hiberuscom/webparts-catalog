import type {
  IRecognitionsConfiguration,
  IRecognitionsService,
  IRecognitionsViewModel
} from '../models/recognitionsModels';
import {
  createRecognitionsRepository,
  type IRecognitionsRepository
} from '../repositories/recognitionsRepository';
import {
  describeSource,
  limitRecognitions,
  normalizeRecognitionItem,
  sortRecognitionsByDate
} from '../utils/recognitionsUtils';

export async function loadRecognitionsViewModel(
  config: IRecognitionsConfiguration,
  repository: IRecognitionsRepository = createRecognitionsRepository(config)
): Promise<IRecognitionsViewModel> {
  try {
    const result = await repository.load();
    const items = limitRecognitions(
      sortRecognitionsByDate(
        result.items.map((item, index) => normalizeRecognitionItem(item, index, config.webAbsoluteUrl))
      ),
      config.maxItems
    );
    const hasPartialData = result.isFallback || result.warnings.length > 0 || items.some((item) => item.isPartial);

    return {
      state: items.length === 0 ? (hasPartialData ? 'partialData' : 'empty') : hasPartialData ? 'partialData' : 'ready',
      title: config.title,
      description: config.description,
      sourceLabel: result.sourceLabel || describeSource(config.dataSourceType, config.listTitleOrUrl),
      items,
      hasPartialData,
      warningMessages: result.warnings
    };
  } catch (error) {
    return {
      state: 'error',
      title: config.title,
      description: config.description,
      sourceLabel: describeSource(config.dataSourceType, config.listTitleOrUrl),
      items: [],
      hasPartialData: false,
      warningMessages: [],
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export class RecognitionsService implements IRecognitionsService {
  public async load(config: IRecognitionsConfiguration): Promise<IRecognitionsViewModel> {
    return loadRecognitionsViewModel(config);
  }
}
