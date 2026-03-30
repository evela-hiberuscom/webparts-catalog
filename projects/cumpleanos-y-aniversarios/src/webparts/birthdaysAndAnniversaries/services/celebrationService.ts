import { classifyAsyncState } from '@paquete/spfx-common';
import type {
  ICelebrationItem,
  ICelebrationRecord,
  ICelebrationViewModel,
  IPeopleCelebrationsRequest
} from '../models/celebrationModels';
import { PeopleCelebrationsRepository } from '../repositories/peopleCelebrationsRepository';
import {
  buildAvatarText,
  formatCelebrationDateLabel,
  getDaysRemaining,
  isTodayCelebration,
  sortCelebrationItems
} from '../utils/celebrationUtils';

export interface ICelebrationServiceRequest extends IPeopleCelebrationsRequest {
  title?: string;
  subtitle?: string;
}

export interface ICelebrationServiceResult extends ICelebrationViewModel {
  title: string;
  subtitle: string;
}

function filterByCelebrationType(record: ICelebrationRecord, showBirthdays: boolean, showAnniversaries: boolean): boolean {
  if (record.celebrationType === 'birthday') {
    return showBirthdays;
  }

  if (record.celebrationType === 'anniversary') {
    return showAnniversaries;
  }

  return showBirthdays || showAnniversaries;
}

function resolveItem(record: ICelebrationRecord, today: Date): ICelebrationItem {
  const daysRemaining = getDaysRemaining(record.date, today);
  const isToday = isTodayCelebration(daysRemaining);

  return {
    ...record,
    avatarText: buildAvatarText(record.displayName),
    dateLabel: formatCelebrationDateLabel(record.date, today),
    daysRemaining,
    isToday,
    isPartial: !record.photoUrl || !record.date || record.celebrationType === 'unknown'
  };
}

function sortAndSplitItems(items: ICelebrationItem[]): {
  todayItems: ICelebrationItem[];
  upcomingItems: ICelebrationItem[];
  partialItems: ICelebrationItem[];
} {
  const sorted = sortCelebrationItems(items);
  const todayItems = sorted.filter((item) => item.isToday);
  const upcomingItems = sorted.filter((item) => !item.isToday && item.daysRemaining !== undefined);
  const partialItems = sorted.filter((item) => item.daysRemaining === undefined);

  return {
    todayItems,
    upcomingItems,
    partialItems
  };
}

export function buildCelebrationViewModel(input: {
  title: string;
  subtitle: string;
  sourceLabel: string;
  items: ICelebrationRecord[];
  hasPartialData: boolean;
  notes: string[];
  request: ICelebrationServiceRequest;
  today?: Date;
  errorMessage?: string;
}): ICelebrationServiceResult {
  const today = input.today ?? new Date();
  const maxDaysAhead = Number.isFinite(input.request.daysAhead) && input.request.daysAhead > 0 ? input.request.daysAhead : 14;
  const normalizedItems = input.items
    .filter((record) => filterByCelebrationType(record, input.request.showBirthdays, input.request.showAnniversaries))
    .map((record) => resolveItem(record, today))
    .filter((item) => item.daysRemaining === undefined || item.daysRemaining <= maxDaysAhead);

  const { todayItems, upcomingItems, partialItems } = sortAndSplitItems(normalizedItems);
  const hasData = normalizedItems.length > 0;
  const status = classifyAsyncState({
    hasData,
    hasError: Boolean(input.errorMessage),
    isPartial: input.hasPartialData || partialItems.length > 0,
    isLoading: false
  });

  return {
    title: input.title,
    subtitle: input.subtitle,
    status,
    items: sortCelebrationItems(normalizedItems),
    todayItems,
    upcomingItems,
    partialItems,
    sourceLabel: input.sourceLabel,
    hasPartialData: input.hasPartialData || partialItems.length > 0,
    notes: input.notes,
    errorMessage: input.errorMessage
  };
}

export class CelebrationService {
  constructor(private readonly repository = new PeopleCelebrationsRepository()) {}

  public async resolveCelebrations(request: ICelebrationServiceRequest): Promise<ICelebrationServiceResult> {
    try {
      const repositoryResult = await this.repository.load(request);

      return buildCelebrationViewModel({
        title: request.title ?? 'Cumpleaños y aniversarios',
        subtitle: request.subtitle ?? 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
        sourceLabel: repositoryResult.sourceLabel,
        items: repositoryResult.items,
        hasPartialData: repositoryResult.hasPartialData,
        notes: repositoryResult.notes,
        request
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        title: request.title ?? 'Cumpleaños y aniversarios',
        subtitle: request.subtitle ?? 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
        status: 'error',
        items: [],
        todayItems: [],
        upcomingItems: [],
        partialItems: [],
        sourceLabel: 'Error',
        hasPartialData: false,
        notes: [message],
        errorMessage: message
      };
    }
  }
}
