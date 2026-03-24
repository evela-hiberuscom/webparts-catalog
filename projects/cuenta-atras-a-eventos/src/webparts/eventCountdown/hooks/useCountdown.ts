import * as React from 'react';
import type { ICountdownSnapshot, ICountdownViewModel, ICountdownWebPartConfig } from '../models/eventCountdownModels';
import { CountdownService } from '../services/countdownService';

function buildLoadingState(): ICountdownViewModel {
  return {
    state: 'loading',
    phase: 'unknown',
    item: null,
    remaining: null,
    sourceLabel: 'Cargando...',
    hasPartialData: false,
    notes: [],
    phaseLabel: 'Cargando',
    supportingText: 'Cargando la cuenta atrás.'
  };
}

export function useCountdownModel(config: ICountdownWebPartConfig, service?: CountdownService): ICountdownViewModel {
  const defaultServiceRef = React.useRef<CountdownService | null>(null);
  if (defaultServiceRef.current === null) {
    defaultServiceRef.current = new CountdownService();
  }

  const effectiveService = service ?? defaultServiceRef.current;
  const [snapshot, setSnapshot] = React.useState<ICountdownSnapshot | null>(null);
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    let disposed = false;

    async function loadSnapshot(): Promise<void> {
      setSnapshot(null);

      const nextSnapshot = await effectiveService.loadSnapshot(config);
      if (!disposed) {
        setSnapshot(nextSnapshot);
      }
    }

    loadSnapshot().catch((error) => {
      if (!disposed) {
        setSnapshot({
          item: null,
          sourceLabel: 'Cuenta atrás',
          hasPartialData: false,
          notes: [],
          errorMessage: (error as Error).message
        });
      }
    });

    return () => {
      disposed = true;
    };
  }, [
    config.detailUrl,
    config.detailUrlField,
    config.eventTitle,
    config.jsonUrl,
    config.listTitleOrUrl,
    config.refreshIntervalSeconds,
    config.showCompleted,
    config.sourceType,
    config.subtitle,
    config.subtitleField,
    config.targetDate,
    config.targetDateField,
    config.titleField,
    config.webUrl,
    effectiveService
  ]);

  React.useEffect(() => {
    const intervalSeconds = Math.max(15, Math.floor(config.refreshIntervalSeconds || 60));
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, intervalSeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [config.refreshIntervalSeconds]);

  if (!snapshot) {
    return buildLoadingState();
  }

  return effectiveService.buildViewModel(snapshot, config, now);
}
