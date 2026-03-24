import * as React from 'react';
import { MessageBar, MessageBarType, Stack, Text } from '@fluentui/react';
import styles from './KpiMiniCards.module.scss';
import type { IKpiMiniCardsProps } from './IKpiMiniCardsProps';
import KpiMiniCard from './KpiMiniCard';
import KpiSkeleton from './KpiSkeleton';
import KpiStatePanel from './KpiStatePanel';
import { KpiCatalogProvider } from '../contexts/KpiCatalogContext';
import { useKpiCatalog } from '../hooks/useKpiCatalog';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export function KpiMiniCardsContent(props: IKpiMiniCardsProps): React.ReactElement {
  const { items, sourceLabel, hasPartialData, notes, status, reload } = useKpiCatalog(props);
  const layoutClassName = props.layoutMode === 'compact' ? styles.compact : styles.standard;
  const visibleNotes = notes.filter(Boolean);

  return (
    <section className={joinClasses(styles.root, layoutClassName)} aria-label={props.title}>
      <Stack tokens={{ childrenGap: 16 }} className={styles.frame}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.title}
            </Text>
            <Text variant="medium" block className={styles.subtitle}>
              {props.subtitle}
            </Text>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{props.layoutMode}</span>
            <span className={styles.metaPill}>{props.sourceType}</span>
            <span className={styles.metaText}>{props.userDisplayName}</span>
          </div>
        </div>

        {visibleNotes.length > 0 ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.notice}>
            {visibleNotes.join(' ')}
          </MessageBar>
        ) : null}

        {status === 'loading' ? <KpiSkeleton count={Math.min(props.maxItems > 0 ? props.maxItems : 4, 4)} /> : null}

        {status === 'error' ? (
          <KpiStatePanel
            iconName="ErrorBadge"
            title="No se han podido cargar los KPIs"
            message="Revisa el origen configurado o vuelve a intentarlo."
            details={visibleNotes.join(' ')}
            actionLabel="Reintentar"
            onAction={reload}
          />
        ) : null}

        {status === 'empty' ? (
          <KpiStatePanel
            iconName="NumberedList"
            title="No hay KPIs configurados"
            message="Añade datos en la fuente seleccionada o revisa el JSON de configuración."
            actionLabel="Reintentar"
            onAction={reload}
          />
        ) : null}

        {status !== 'loading' && status !== 'error' && status !== 'empty' ? (
          <>
            {hasPartialData ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.notice}>
                Parte de la información del KPI está incompleta, pero el panel sigue siendo utilizable.
              </MessageBar>
            ) : null}

            <div className={styles.grid} role="list" aria-label="KPI mini-cards">
              {items.map((item) => (
                <KpiMiniCard key={item.id} item={item} showTrend={props.showTrend} />
              ))}
            </div>

            <div className={styles.footerLine}>
              <span className={styles.footerLabel}>Origen</span>
              <span className={styles.footerValue}>{sourceLabel}</span>
            </div>
          </>
        ) : null}
      </Stack>
    </section>
  );
}

export default function KpiMiniCards(props: IKpiMiniCardsProps): React.ReactElement {
  return (
    <KpiCatalogProvider>
      <KpiMiniCardsContent {...props} />
    </KpiCatalogProvider>
  );
}
