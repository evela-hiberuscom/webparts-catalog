import type { IRecentAccessesConfig } from '../models/recentAccesses.types';
import { recentAccessesDefaults } from '../models/recentAccesses.constants';
import type { IRecentAccessesRepository } from './IRecentAccessesRepository';
import { JsonRecentAccessesRepository } from './jsonRecentAccessesRepository';
import { StaticRecentAccessesRepository } from './staticRecentAccessesRepository';

export function createRecentAccessesRepository(config: IRecentAccessesConfig): IRecentAccessesRepository {
  if (config.dataSourceMode === 'JsonUrl') {
    if (config.recentItemsJsonUrl.trim()) {
      return new JsonRecentAccessesRepository(config.recentItemsJsonUrl.trim());
    }

    return new StaticRecentAccessesRepository(
      'JSON feed missing - using fallback local data',
      false
    );
  }

  if (config.dataSourceMode === 'GraphRecent') {
    return new StaticRecentAccessesRepository('Graph recent fallback', false);
  }

  if (config.dataSourceMode === 'SharePointList') {
    return new StaticRecentAccessesRepository('SharePoint recent list fallback', false);
  }

  return new StaticRecentAccessesRepository(recentAccessesDefaults.sourceMode, false);
}
