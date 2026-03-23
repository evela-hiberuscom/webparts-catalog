import type { IBookingResource, IQuickBookingControllerState, IQuickBookingViewModel } from '../models/quickBookingModels';
import { getResourceCategories, getResourceSites, isResourcePartial } from '../utils/bookingResourceHelpers';

function sortResources(resources: IBookingResource[]): IBookingResource[] {
  return [...resources].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.name.localeCompare(right.name);
  });
}

function filterResources(
  resources: IBookingResource[],
  selectedCategory: string,
  selectedSite: string
): IBookingResource[] {
  return resources.filter((resource) => {
    const categoryMatches = selectedCategory === 'Todos' || resource.category === selectedCategory;
    const siteMatches = selectedSite === 'Todos' || resource.site === selectedSite;

    return categoryMatches && siteMatches;
  });
}

function hasVisiblePartialData(resources: IBookingResource[], showAvailability: boolean): boolean {
  return resources.some((resource) => isResourcePartial(resource, showAvailability));
}

function createViewModel(
  resources: IBookingResource[],
  defaultCategory: string,
  selectedSite: string,
  showAvailability: boolean
): IQuickBookingViewModel {
  const sortedResources = sortResources(resources);
  const categories = getResourceCategories(sortedResources);
  const sites = getResourceSites(sortedResources);
  const selectedCategory = categories.indexOf(defaultCategory) !== -1 ? defaultCategory : categories[0] ?? 'Todos';
  const visibleResources = filterResources(sortedResources, selectedCategory, selectedSite);
  const hasPartialData = hasVisiblePartialData(visibleResources, showAvailability);

  return {
    status: visibleResources.length > 0 ? (hasPartialData ? 'partialData' : 'ready') : 'empty',
    resources: sortedResources,
    categories,
    sites,
    selectedCategory,
    selectedSite,
    errorMessage: undefined,
    hasPartialData,
    visibleResources
  };
}

export function createInitialQuickBookingState(defaultCategory: string): IQuickBookingControllerState {
  return {
    status: 'loading',
    resources: [],
    categories: ['Todos'],
    sites: ['Todos'],
    selectedCategory: defaultCategory || 'Todos',
    selectedSite: 'Todos',
    errorMessage: undefined,
    hasPartialData: false
  };
}

export function buildQuickBookingViewModel(
  resources: IBookingResource[],
  defaultCategory: string,
  showAvailability: boolean
): IQuickBookingViewModel {
  return createViewModel(resources, defaultCategory, 'Todos', showAvailability);
}

export function buildErrorViewModel(defaultCategory: string, errorMessage: string): IQuickBookingViewModel {
  return {
    status: 'error',
    resources: [],
    categories: ['Todos'],
    sites: ['Todos'],
    selectedCategory: defaultCategory || 'Todos',
    selectedSite: 'Todos',
    errorMessage,
    hasPartialData: false,
    visibleResources: []
  };
}

export function updateSelectedCategory(
  model: IQuickBookingViewModel,
  selectedCategory: string,
  showAvailability: boolean
): IQuickBookingViewModel {
  const nextVisibleResources = filterResources(model.resources, selectedCategory, model.selectedSite);
  const hasPartialData = hasVisiblePartialData(nextVisibleResources, showAvailability);

  return {
    ...model,
    selectedCategory,
    visibleResources: nextVisibleResources,
    hasPartialData,
    status: nextVisibleResources.length > 0 ? (hasPartialData ? 'partialData' : 'ready') : 'empty'
  };
}

export function updateSelectedSite(
  model: IQuickBookingViewModel,
  selectedSite: string,
  showAvailability: boolean
): IQuickBookingViewModel {
  const nextVisibleResources = filterResources(model.resources, model.selectedCategory, selectedSite);
  const hasPartialData = hasVisiblePartialData(nextVisibleResources, showAvailability);

  return {
    ...model,
    selectedSite,
    visibleResources: nextVisibleResources,
    hasPartialData,
    status: nextVisibleResources.length > 0 ? (hasPartialData ? 'partialData' : 'ready') : 'empty'
  };
}
