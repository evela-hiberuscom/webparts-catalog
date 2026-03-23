import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import styles from './UniversalAppLauncher.module.scss';
import type { IUniversalAppLauncherProps } from './IUniversalAppLauncherProps';
import LaunchCard from './LaunchCard';
import LaunchEmptyState from './LaunchEmptyState';
import LaunchFilters from './LaunchFilters';
import { LaunchCatalogProvider } from '../contexts/LaunchCatalogContext';
import { useLaunchCatalog } from '../hooks/useLaunchCatalog';
import { parseAudienceTokens } from '../utils/launchLink';

function AudienceQuickLinksContent(props: IUniversalAppLauncherProps): React.ReactElement {
  const { status, visibleItems, categories, query, selectedCategory, setQuery, setSelectedCategory, resetFilters, sourceLabel, hasPartialData, audienceTokens } =
    useLaunchCatalog({
      title: props.title,
      subtitle: props.subtitle,
      audienceMode: props.audienceMode,
      currentAudienceTokens: parseAudienceTokens(props.currentAudienceTokens),
      defaultCategory: props.defaultCategory,
      maxItems: props.maxItems,
      openInNewTab: props.openInNewTab,
      launchItemsJson: props.launchItemsJson
    });

  const content = (() => {
    if (status === 'loading') {
      return <Spinner size={SpinnerSize.medium} label="Cargando accesos" />;
    }

    if (status === 'error' || visibleItems.length === 0) {
      return (
        <LaunchEmptyState
          title={status === 'error' ? 'No se han podido cargar los accesos' : 'No hay accesos para esta audiencia'}
          message={status === 'error' ? 'Revisa la configuración del catálogo o vuelve a intentarlo.' : 'Ajusta la audiencia o limpia los filtros para mostrar contenido.'}
          onReset={resetFilters}
        />
      );
    }

    return (
      <div className={styles.grid} role="list" aria-label="Accesos segmentados">
        {visibleItems.map((item) => (
          <LaunchCard key={item.id} item={item} />
        ))}
      </div>
    );
  })();

  return (
    <section className={`${styles.root} ${props.isDarkTheme ? styles.dark : ''}`} aria-label={props.title}>
      <Stack tokens={{ childrenGap: 16 }}>
        <div className={styles.header}>
          <div>
            <Text variant="xLarge" as="h2" block className={styles.title}>
              {props.title}
            </Text>
            <Text variant="medium" block className={styles.subtitle}>
              {props.subtitle}
            </Text>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{props.audienceMode}</span>
            <span className={styles.metaText}>{props.userDisplayName}</span>
          </div>
        </div>

        <LaunchFilters
          query={query}
          selectedCategory={selectedCategory}
          categories={categories}
          audienceTokens={audienceTokens}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onReset={resetFilters}
        />

        {hasPartialData ? (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false} className={styles.notice}>
            Parte del catálogo se ha normalizado con datos incompletos. El web part sigue siendo utilizable.
          </MessageBar>
        ) : null}

        <div className={styles.sourceLine}>Origen: {sourceLabel}</div>
        {content}
      </Stack>

      <div className={styles.environmentLine}>{props.hasTeamsContext ? props.environmentMessage : 'SharePoint Online'}</div>
    </section>
  );
}

export default function UniversalAppLauncher(props: IUniversalAppLauncherProps): React.ReactElement {
  return (
    <LaunchCatalogProvider>
      <AudienceQuickLinksContent {...props} />
    </LaunchCatalogProvider>
  );
}

