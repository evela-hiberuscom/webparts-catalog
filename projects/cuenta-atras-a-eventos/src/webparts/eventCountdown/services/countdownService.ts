import { createSafeExternalLink, classifyAsyncState } from '@paquete/spfx-common/utils';
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
    item: null,
    remaining: null,
    sourceLabel,
    hasPartialData: false,
    notes,
    phaseLabel: 'Sin evento',
    supportingText: reason,
    emptyReason: reason
  };
}

function buildErrorViewModel(sourceLabel: string, notes: string[], errorMessage: string): ICountdownViewModel {
  return {
    state: 'error',
    phase: 'unknown',
    item: null,
    remaining: null,
    sourceLabel,
    hasPartialData: false,
    notes,
    phaseLabel: 'Error',
    supportingText: errorMessage,
    errorMessage
  };
}

function buildSourceSnapshot(result: ICountdownRepositoryResult): ICountdownSnapshot {
  return {
    ...result
  };
}

function buildCtaLink(item: ICountdownItem) {
  return item.detailUrl ? createSafeExternalLink(item.detailUrl) : undefined;
}

function buildPhaseLabel(phase: ICountdownItem['state']): string {
  switch (phase) {
    case 'countdown':
      return 'Cuenta atrás';
    case 'live':
      return 'En curso';
    case 'completed':
      return 'Completado';
    default:
      return 'Sin estado';
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
        item: null,
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
      return buildEmptyViewModel(snapshot.sourceLabel, snapshot.notes, 'No hay evento configurado.');
    }

    const targetDate = parseCountdownDate(snapshot.item.targetDate);
    if (!targetDate) {
      return buildErrorViewModel(snapshot.sourceLabel, snapshot.notes, 'No se ha podido interpretar la fecha objetivo.');
    }

    const phase = deriveCountdownPhase(snapshot.item, now);
    if (phase === 'completed' && !config.showCompleted) {
      return buildEmptyViewModel(snapshot.sourceLabel, snapshot.notes, 'El evento ya ha finalizado y está oculto por configuración.');
    }

    const remaining = phase === 'countdown' ? calculateRemaining(targetDate, now) : null;
    const state = classifyAsyncState({
      hasData: Boolean(snapshot.item),
      hasError: false,
      isLoading: false,
      isPartial: snapshot.hasPartialData
    });

    return {
      state,
      phase,
      item: snapshot.item,
      remaining,
      sourceLabel: snapshot.sourceLabel,
      hasPartialData: snapshot.hasPartialData,
      notes: snapshot.notes,
      phaseLabel: buildPhaseLabel(phase),
      supportingText:
        phase === 'countdown'
          ? `Faltan ${formatRemainingSummary(remaining as NonNullable<typeof remaining>)} para ${snapshot.item.title}.`
          : phase === 'live'
            ? `El evento ${snapshot.item.title} está en curso desde ${formatEventDate(snapshot.item.targetDate)}.`
            : `El evento ${snapshot.item.title} finalizó el ${formatEventDate(snapshot.item.targetDate)}.`,
      ctaLink: buildCtaLink(snapshot.item)
    };
  }

  private resolveSourceLabel(config: ICountdownWebPartConfig): string {
    switch (config.sourceType) {
      case 'JsonUrl':
        return 'JSON URL';
      case 'SharePointList':
        return 'Lista de SharePoint';
      default:
        return 'Configuración estática';
    }
  }
}
