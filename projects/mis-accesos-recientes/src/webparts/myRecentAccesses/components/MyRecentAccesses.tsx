import * as React from 'react';
import { MessageBarType, PrimaryButton, Stack, Text, initializeIcons } from '@fluentui/react';
import { RecentAccessesProvider, useRecentAccessesContext } from '../contexts/RecentAccessesContext';
import { recentAccessesCopy } from '../models/recentAccesses.constants';
import type { IMyRecentAccessesProps } from './IMyRecentAccessesProps';
import { RecentFilters } from './RecentFilters';
import { RecentResourceList } from './RecentResourceList';
import { RecentStateMessage } from './RecentStateMessage';
import styles from './MyRecentAccesses.module.scss';

initializeIcons();

function RecentAccessesContent(props: IMyRecentAccessesProps): React.ReactElement {
  const context = useRecentAccessesContext();

  return (
    <Stack tokens={{ childrenGap: 20 }} className={styles.myRecentAccesses}>
      <section className={styles.hero} aria-label={recentAccessesCopy.title}>
        <div className={styles.heroContent}>
          <div className={styles.topRow}>
            <div>
              <span className={styles.heroBadge}>{props.dataSourceMode}</span>
              <Text variant="xLarge" block className={styles.title}>
                {props.description || recentAccessesCopy.title}
              </Text>
              <Text variant="mediumPlus" block className={styles.subtitle}>
                {recentAccessesCopy.subtitle}
              </Text>
              <Text variant="small" block className={styles.environmentNote}>
                {props.environmentMessage}
              </Text>
            </div>
            <div className={styles.heroActions}>
              <PrimaryButton
                text="Actualizar"
                onClick={context.reload}
                className={styles.heroActionButton}
              />
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{context.totalCount}</span>
              <span className={styles.statLabel}>elementos cargados</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{context.availableTypes.length}</span>
              <span className={styles.statLabel}>tipos detectados</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{context.hasPartialData ? 'Parcial' : 'OK'}</span>
              <span className={styles.statLabel}>estado de calidad</span>
            </div>
          </div>
        </div>
      </section>

      <Stack tokens={{ childrenGap: 20 }} className={styles.contentShell}>
        {context.isLoading ? (
          <RecentStateMessage
            type={MessageBarType.info}
            title={recentAccessesCopy.loading}
            message="Se estan leyendo los accesos recientes."
          />
        ) : null}

        {!context.isLoading && context.errorMessage ? (
          <RecentStateMessage
            type={MessageBarType.error}
            title={recentAccessesCopy.error}
            message={context.errorMessage}
            actionLabel="Reintentar"
            onAction={context.reload}
          />
        ) : null}

        {!context.isLoading && !context.errorMessage && context.items.length === 0 ? (
          <RecentStateMessage
            type={MessageBarType.warning}
            title={recentAccessesCopy.empty}
            message="Revisa la fuente de datos o ajusta el filtro de tipo."
            actionLabel="Reintentar"
            onAction={context.reload}
          />
        ) : null}

        {!context.isLoading && !context.errorMessage && context.items.length > 0 ? (
          <>
            <RecentFilters
              availableTypes={context.availableTypes}
              sourceLabel={context.sourceLabel}
              isPartialData={context.hasPartialData}
              dataSourceMode={props.dataSourceMode}
              resourceTypeFilter={props.resourceTypeFilter}
            />
            <RecentResourceList items={context.items} />
          </>
        ) : null}
      </Stack>
    </Stack>
  );
}

export default function MyRecentAccesses(props: IMyRecentAccessesProps): React.ReactElement<IMyRecentAccessesProps> {
  return (
    <RecentAccessesProvider
      config={{
        description: props.description,
        dataSourceMode: props.dataSourceMode,
        recentItemsJsonUrl: props.recentItemsJsonUrl,
        maxItems: props.maxItems,
        resourceTypeFilter: props.resourceTypeFilter
      }}
    >
      <RecentAccessesContent {...props} />
    </RecentAccessesProvider>
  );
}
