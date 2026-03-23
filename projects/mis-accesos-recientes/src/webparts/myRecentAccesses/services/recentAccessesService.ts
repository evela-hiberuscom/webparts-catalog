import type {
  IRecentAccessesConfig,
  IRecentAccessesResult
} from '../models/recentAccesses.types';
import { createRecentAccessesRepository } from '../repositories/createRecentAccessesRepository';
import {
  deriveRecentResourceTypes,
  filterRecentResources,
  mapUnknownFieldsToWarnings,
  normalizeRecentResources
} from '../utils/recentAccesses.mappers';
import { sampleRecentResources } from '../utils/recentAccesses.sample';

export async function loadRecentAccesses(config: IRecentAccessesConfig): Promise<IRecentAccessesResult> {
  const repository = createRecentAccessesRepository(config);

  try {
    const loadedItems = await repository.load();
    const normalizedItems = normalizeRecentResources(loadedItems);
    const filteredItems = filterRecentResources(
      normalizedItems,
      config.resourceTypeFilter,
      config.maxItems
    );
    const warnings = [
      ...mapUnknownFieldsToWarnings(normalizedItems),
      ...(repository.isAuthoritative ? [] : ['La vista usa datos de respaldo mientras la fuente real se conecta.'])
    ];

    return {
      items: filteredItems,
      availableTypes: deriveRecentResourceTypes(normalizedItems),
      hasPartialData: !repository.isAuthoritative || warnings.length > 0,
      sourceLabel: repository.sourceLabel,
      warnings,
      totalCount: normalizedItems.length
    };
  } catch (error) {
    if (config.dataSourceMode === 'JsonUrl' && config.recentItemsJsonUrl.trim()) {
      throw error;
    }

    const fallbackItems = filterRecentResources(sampleRecentResources, config.resourceTypeFilter, config.maxItems);
    return {
      items: fallbackItems,
      availableTypes: deriveRecentResourceTypes(sampleRecentResources),
      hasPartialData: true,
      sourceLabel: repository.sourceLabel,
      warnings: ['Se utilizo la fuente local de respaldo.'],
      totalCount: sampleRecentResources.length
    };
  }
}
