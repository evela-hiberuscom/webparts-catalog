import * as React from 'react';
import { MessageBar, MessageBarType, Text } from '@fluentui/react';
import styles from './HighlightedIncidents.module.scss';
import type { IHighlightedIncidentsProps } from './IHighlightedIncidentsProps';
import { useHighlightedIncidents } from '../hooks/useHighlightedIncidents';
import HighlightedIncidentsState from './HighlightedIncidentsState';
import IncidentCard from './IncidentCard';

export default function HighlightedIncidents(props: IHighlightedIncidentsProps): React.ReactElement<IHighlightedIncidentsProps> {
  const { title, subtitle, webUrl, dataSourceType, listTitleOrUrl, showResolved, maxItems } = props;
  const { status, result, error, refresh } = useHighlightedIncidents({
    title,
    subtitle,
    webUrl,
    dataSourceType,
    listTitleOrUrl,
    showResolved,
    maxItems
  });

  const items = result?.items ?? [];

  return (
    <section className={styles.root} aria-label={title}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.accentLine} aria-hidden="true" />
            <Text variant="xLarge" className={styles.title} as="h2">
              {title}
            </Text>
            <Text variant="medium" className={styles.subtitle}>
              {subtitle}
            </Text>
          </div>

          <div className={styles.headerMeta} aria-label="Resumen de incidencias">
            <span className={styles.metaPill}>{result?.activeCount ?? 0} activas</span>
            <span className={styles.metaPill}>{result?.monitoringCount ?? 0} en monitorización</span>
            <span className={styles.metaPill}>{result?.sourceCount ?? 0} fuente(s)</span>
          </div>
        </header>

        {result?.hasPartialData ? (
          <MessageBar className={styles.partialNotice} messageBarType={MessageBarType.warning} isMultiline>
            Hay incidencias con datos parciales. El contenido disponible se muestra sin bloquear la vista.
          </MessageBar>
        ) : null}

        {status === 'loading' ? (
          <HighlightedIncidentsState
            state="loading"
            title="Cargando incidencias destacadas"
            message="Preparando el panel..."
          />
        ) : null}

        {status === 'error' ? (
          <HighlightedIncidentsState
            state="error"
            title="No hemos podido leer la fuente de incidencias"
            message={error ?? 'Revisa la configuración de la lista o del JSON de origen.'}
            retryLabel="Reintentar"
            onRetry={refresh}
          />
        ) : null}

        {status === 'empty' ? (
          <HighlightedIncidentsState
            state="empty"
            title="No hay incidencias destacadas"
            message="Cuando existan incidencias activas o en monitorización, aparecerán aquí con su severidad, impacto, workaround y ETA."
          />
        ) : null}

        {status !== 'loading' && status !== 'error' && status !== 'empty' ? (
          items.length > 0 ? (
            <div className={styles.cardGrid} role="list" aria-label="Lista de incidencias destacadas">
              {items.map((incident) => (
                <div className={styles.cardSlot} key={incident.id} role="listitem">
                  <IncidentCard incident={incident} webUrl={webUrl} />
                </div>
              ))}
            </div>
          ) : (
            <HighlightedIncidentsState
              state="empty"
              title="No hay incidencias destacadas"
              message="La fuente no ha devuelto elementos visibles para la configuración actual."
            />
          )
        ) : null}

        <footer className={styles.footer}>
          <Text variant="small" className={styles.footerText}>
            {result?.resolvedCount ?? 0} resueltas visibles
            {result?.hiddenResolvedCount ? ` · ${result.hiddenResolvedCount} resueltas ocultas por configuración` : ''}
            {showResolved ? ' · resolved activado' : ' · resolved oculto por defecto'}
            {maxItems ? ` · máximo ${maxItems}` : ''}
          </Text>
        </footer>
      </div>
    </section>
  );
}
