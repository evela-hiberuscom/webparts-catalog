import type {
  IWhatChangedFeedConfiguration,
  IWhatChangedFeedRepository,
  IWhatChangedFeedService,
  IWhatChangedFeedState
} from '../models/whatChangedFeedModels';
import {
  filterChangesByType,
  isPartialChange,
  sortChanges
} from '../utils/whatChangedFeedUtils';

export class WhatChangedFeedService implements IWhatChangedFeedService {
  public constructor(private readonly repository: IWhatChangedFeedRepository) {}

  public async load(configuration: IWhatChangedFeedConfiguration): Promise<IWhatChangedFeedState> {
    try {
      const items = sortChanges(
        filterChangesByType(await this.repository.getChanges(configuration), configuration.defaultTypeFilter)
      ).slice(0, configuration.maxItems);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          hasPartialData: false
        };
      }

      const hasPartialData = items.some((item) => isPartialChange(item));

      return {
        status: hasPartialData ? 'partialData' : 'ready',
        items,
        hasPartialData
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading changes'
      };
    }
  }
}
