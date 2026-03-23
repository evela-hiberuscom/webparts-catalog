import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import styles from './AutomaticWeeklySummary.module.scss';
import { WeeklySummarySectionHeader } from './WeeklySummarySectionHeader';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { WeeklySummaryStateView } from './WeeklySummaryStateView';
import type { IAutomaticWeeklySummaryProps } from './IAutomaticWeeklySummaryProps';
import { useWeeklySummary } from '../hooks/useWeeklySummary';

export default function AutomaticWeeklySummary({
  title,
  subtitle,
  periodMode,
  maxItems,
  customRangeStart,
  customRangeEnd,
  service
}: IAutomaticWeeklySummaryProps): React.ReactElement {
  const { status, result, error, refresh } = useWeeklySummary(service, {
    periodMode,
    maxItems,
    customRangeStart,
    customRangeEnd
  });

  const sourceLegend = result?.items.reduce<string[]>((accumulator, item) => {
    if (accumulator.indexOf(item.sourceName) === -1) {
      accumulator.push(item.sourceName);
    }
    return accumulator;
  }, []) ?? [];

  return (
    <section className={styles.automaticWeeklySummary}>
      <WeeklySummarySectionHeader
        title={title}
        subtitle={subtitle}
        periodLabel={result?.periodLabel ?? 'Cargando periodo'}
      />

      {status === 'error' ? (
        <WeeklySummaryStateView
          status="error"
          title="No se ha podido construir el resumen"
          message={error ?? 'Revisa la fuente configurada e intenta de nuevo.'}
          onRetry={refresh}
        />
      ) : status === 'loading' ? (
        <WeeklySummaryStateView
          status="loading"
          title="Cargando resumen"
          message="Consultando las fuentes semanales y normalizando los elementos relevantes."
          onRetry={refresh}
        />
      ) : result?.items.length ? (
        <>
          <div className={styles.summaryMeta}>
            <span className={styles.metaChip}>
              <Icon iconName="Stack" />
              <span>{result.items.length} elementos destacados</span>
            </span>
            <span className={styles.metaChip}>
              <Icon iconName="Globe" />
              <span>{result.sourceCount} fuentes activas</span>
            </span>
            <span className={styles.metaChip}>
              <Icon iconName="CalendarWeek" />
              <span>{result.range.label}</span>
            </span>
          </div>

          {result.hasPartialData ? (
            <div className={styles.partialNotice} role="status">
              <Icon iconName="Info" />
              <span>Hay elementos parciales o sin enlace. Se muestran igualmente para no perder contexto.</span>
            </div>
          ) : null}

          <div className={styles.highlightGrid}>
            {result.items.map((item) => (
              <WeeklySummaryCard key={item.id} item={item} />
            ))}
          </div>

          <footer className={styles.legend} aria-label="Fuentes del resumen">
            {sourceLegend.map((source) => (
              <span key={source} className={styles.legendItem}>
                <Icon iconName="MiniLink" />
                <span>{source}</span>
              </span>
            ))}
          </footer>
        </>
      ) : (
        <WeeklySummaryStateView
          status="empty"
          title="No hay highlights para este periodo"
          message="No se han encontrado noticias, hitos o incidencias dentro del rango configurado."
          onRetry={refresh}
        />
      )}

      {status !== 'error' && result ? (
        <Text variant="small" block className={styles.stateMessage}>
          {result.status === 'partialData'
            ? 'El resumen se generó con datos parciales.'
            : 'El resumen se actualiza en base a las fuentes configuradas.'}
        </Text>
      ) : null}
    </section>
  );
}
