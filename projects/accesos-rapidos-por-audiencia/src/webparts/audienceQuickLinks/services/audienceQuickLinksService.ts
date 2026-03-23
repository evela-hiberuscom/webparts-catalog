import type {
  IAudienceLinkRecord,
  IAudienceQuickLinksLoadRequest,
  IAudienceQuickLinksViewModel,
  AudienceQuickLinksState
} from '../models/audienceLinkModels';
import { AudienceLinksRepository } from '../repositories/audienceLinksRepository';
import { UserContextRepository } from '../repositories/userContextRepository';
import {
  ALL_CATEGORIES_LABEL,
  buildAudienceSummaryLabel,
  buildAudienceTokensByMode,
  filterByCategory,
  hasVisibleLink,
  markPartialLink,
  matchAudienceLinkTokens,
  sortAudienceLinks
} from '../utils/audienceLinkUtils';

export interface IAudienceLinksRepositoryLike {
  load(config: import('../models/audienceLinkModels').IAudienceQuickLinksWebPartProps): Promise<
    import('../models/audienceLinkModels').IAudienceLinkRepositoryResult
  >;
}

export interface IUserContextRepositoryLike {
  load(hostContext: import('../models/audienceLinkModels').IAudienceQuickLinksHostContext): Promise<
    import('../models/audienceLinkModels').IUserContextResult
  >;
}

function filterMatchingLinks(items: IAudienceLinkRecord[], resolvedTokens: string[]): IAudienceLinkRecord[] {
  const specificMatches: IAudienceLinkRecord[] = [];
  const genericMatches: IAudienceLinkRecord[] = [];

  items.forEach((item) => {
    if (item.isGeneric || item.audiences.length === 0) {
      genericMatches.push(item);
      return;
    }

    if (matchAudienceLinkTokens(item, resolvedTokens)) {
      specificMatches.push(item);
    }
  });

  if (specificMatches.length > 0) {
    return specificMatches;
  }

  return genericMatches;
}

function computeHasPartialData(
  repositoryPartial: boolean,
  userPartial: boolean,
  items: IAudienceLinkRecord[],
  fallbackUsed: boolean
): boolean {
  if (repositoryPartial || userPartial || fallbackUsed) {
    return true;
  }

  for (let index = 0; index < items.length; index += 1) {
    if (!hasVisibleLink(items[index])) {
      return true;
    }
  }

  return false;
}

function deriveViewState(visibleItems: IAudienceLinkRecord[], hasPartialData: boolean): AudienceQuickLinksState {
  if (visibleItems.length === 0) {
    return 'empty';
  }

  return hasPartialData ? 'partialData' : 'ready';
}

export interface IAudienceQuickLinksServiceDependencies {
  linksRepository?: IAudienceLinksRepositoryLike;
  userContextRepository?: IUserContextRepositoryLike;
}

export class AudienceQuickLinksService {
  constructor(private readonly dependencies: IAudienceQuickLinksServiceDependencies = {}) {}

  public async load(request: IAudienceQuickLinksLoadRequest): Promise<IAudienceQuickLinksViewModel> {
    const linksRepository =
      this.dependencies.linksRepository ?? new AudienceLinksRepository(request.hostContext.spHttpClient, request.hostContext.webUrl);
    const userContextRepository =
      this.dependencies.userContextRepository ?? new UserContextRepository(request.hostContext.spHttpClient);

    const [linkSource, userContext] = await Promise.all([
      linksRepository.load(request.webPartProps),
      userContextRepository.load(request.hostContext)
    ]);

    const resolvedAudienceTokens = buildAudienceTokensByMode(userContext.tokens, request.webPartProps.audienceMode);
    const resolvedAudienceLabel = buildAudienceSummaryLabel(resolvedAudienceTokens, request.webPartProps.audienceMode);
    const matchedItems = sortAudienceLinks(filterMatchingLinks(linkSource.items, resolvedAudienceTokens));
    const categories = [ALL_CATEGORIES_LABEL].concat(
      matchedItems.reduce((accumulator: string[], item) => {
        if (accumulator.indexOf(item.category) === -1) {
          accumulator.push(item.category);
        }

        return accumulator;
      }, [])
    );
    const selectedCategory = request.webPartProps.defaultCategory.trim() || ALL_CATEGORIES_LABEL;
    const normalizedSelectedCategory = categories.indexOf(selectedCategory) >= 0 ? selectedCategory : ALL_CATEGORIES_LABEL;
    const visibleItems = sortAudienceLinks(filterByCategory(matchedItems, normalizedSelectedCategory));
    const specificMatchesCount = linkSource.items.filter((item) => {
      if (item.isGeneric || item.audiences.length === 0) {
        return false;
      }

      return matchAudienceLinkTokens(item, resolvedAudienceTokens);
    }).length;
    const fallbackUsed = specificMatchesCount === 0 && matchedItems.length > 0;
    const hasPartialData = computeHasPartialData(
      linkSource.hasPartialData,
      userContext.hasPartialData,
      visibleItems,
      fallbackUsed
    );
    const state = deriveViewState(visibleItems, hasPartialData);

    return {
      title: request.webPartProps.title.trim() || 'Accesos rápidos por audiencia',
      description: request.webPartProps.description.trim(),
      sourceLabel: `${linkSource.sourceLabel} · ${userContext.sourceLabel}`,
      resolvedAudienceLabel,
      resolvedAudienceTokens,
      categories,
      selectedCategory: normalizedSelectedCategory,
      allItems: matchedItems.map(markPartialLink),
      visibleItems: visibleItems.map(markPartialLink),
      hasPartialData,
      state,
      notes: linkSource.notes.concat(userContext.notes)
    };
  }
}
