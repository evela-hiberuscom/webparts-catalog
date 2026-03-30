import { createSafeExternalLink, classifyAsyncState } from '@paquete/spfx-common/utils';
import * as strings from 'EventCountdownWebPartStrings';
import type {
  ICountdownItem,
  ICountdownRepositoryResult,
  ICountdownSnapshot,
  ICountdownViewModel,
  ICountdownWebPartConfig
} from '../models/eventCountdownModels';
import { CountdownConfigRepository } from '../repositories/countdownConfigRepository';
import { calculateRemaining, deriveCountdownPhase, formatEventDate, formatRemainingSummary, parseCountdownDate } from '../utils/countdownUtils';

function buildEmptyViewModel(sourceLabel: string, notes: string[], reason: string): ICountdownViewModel {
  return {
    state: 'empty',
    phase: 'unknown',
    item: undefined,
    remaining: undefined,
    sourceLabel,
    hasPartialData: false,
    notes,
    phaseLabel: strings.EmptyPhaseLabel,
    supportingText: reason,
    emptyReason: reason
  };
}

function buildErrorViewModel(sourceLabel: string, notes: string[], errorMessage: string): ICountdownViewModel {
  return {
    state: 'error',
    phase: 'unknown',
    item: undefined,
    remaining: undefined,
    sourceLabel,
    hasPartialData: false,
    notes,
    phaseLabel: strings.ErrorPhaseLabel,
    supportingText: errorMessage,
    errorMessage
  };
}

function buildSourceSnapshot(result: ICountdownRepositoryResult): ICountdownSnapshot {
  return {
    ...result
  };
}

function buildCtaLink(item: ICountdownItem): ICountdownViewModel['ctaLink'] {
  return item.detailUrl ? createSafeExternalLink(item.detailUrl) : undefined;
}

function buildPhaseLabel(phase: ICountdownItem['state']): string {
  switch (phase) {
    case 'countdown':
      return strings.CountdownPhaseLabel;
    case 'live':
      return strings.LivePhaseLabel;
    case 'completed':
      return strings.CompletedPhaseLabel;
    default:
      return strings.UnknownPhaseLabel;
  }
}

function buildSupportingText(item: ICountdownItem, phase: ICountdownItem['state'], formattedDate: string, remainingSummary?: string): string {
  switch (phase) {
    case 'countdown':
      return `${strings.CountdownSupportingPrefix} ${remainingSummary} ${strings.CountdownSupportingConnector} ${item.title}.`;
    case 'live':
      return `${strings.LiveSupportingPrefix} ${item.title} ${strings.LiveSupportingConnector} ${formattedDate}.`;
    case 'completed':
      return `${strings.CompletedSupportingPrefix} ${item.title} ${strings.CompletedSupportingConnector} ${formattedDate}.`;
    default:
      return item.title;
  }
}

export class CountdownService {
  constructor(private readonly repository: Pick<CountdownConfigRepository, 'load'> = new CountdownConfigRepository()) {}

  public async loadSnapshot(config: ICountdownWebPartConfig): Promise<ICountdownSnapshot> {
    try {
      const result = await this.repository.load(config);
      return buildSourceSnapshot(result);
    } catch (error) {
      return {
        item: undefined,
        sourceLabel: this.resolveSourceLabel(config),
        hasPartialData: false,
        notes: [],
        errorMessage: (error as Error).message
      };
    }
  }

  public buildViewModel(snapshot: ICountdownSnapshot, config: ICountdownWebPartConfig, now: Date = new Date()): ICountdownViewModel {
    if (snapshot.errorMessage) {
      return buildErrorViewModel(snapshot.sourceLabel, snapshot.notes, snapshot.errorMessage);
    }

    if (!snapshot.item) {
      return buildEmptyViewModel(snapshot.sourceLabel, snapshot.notes, strings.EmptyEventMessage);
    }

    const targetDate = parseCountdownDate(snapshot.item.targetDate);
    if (!targetDate) {
      return buildErrorViewModel(snapshot.sourceLabel, snapshot.notes, strings.InvalidTargetDateMessage);
    }

    const phase = deriveCountdownPhase(snapshot.item, now);
    if (phase === 'completed' && !config.showCompleted) {
      return buildEmptyViewModel(snapshot.sourceLabel, snapshot.notes, strings.CompletedHiddenMessage);
    }

    const remaining = phase === 'countdown' ? calculateRemaining(targetDate, now) : undefined;
    const state = classifyAsyncState({
      hasData: Boolean(snapshot.item),
      hasError: false,
      isLoading: false,
      isPartial: snapshot.hasPartialData
    });

    const formattedDate = formatEventDate(snapshot.item.targetDate);
    const remainingSummary = remaining ? formatRemainingSummary(remaining) : undefined;

    return {
      state,
      phase,
      item: snapshot.item,
      remaining,
      sourceLabel: snapshot.sourceLabel,
      hasPartialData: snapshot.hasPartialData,
      notes: snapshot.notes,
      phaseLabel: buildPhaseLabel(phase),
      supportingText: buildSupportingText(snapshot.item, phase, formattedDate, remainingSummary),
      ctaLink: buildCtaLink(snapshot.item)
    };
  }

  private resolveSourceLabel(config: ICountdownWebPartConfig): string {
    switch (config.sourceType) {
      case 'JsonUrl':
        return strings.JsonSourceLabel;
      case 'SharePointList':
        return strings.SharePointSourceLabel;
      default:
        return strings.StaticSourceLabel;
    }
  }
}
