import * as React from 'react';
import { DefaultButton, SearchBox, Stack, Text } from '@fluentui/react';
import styles from './CorporateResourcesSearch.module.scss';
import type { ICorporateResourcesSearchProps } from './ICorporateResourcesSearchProps';
import { useCorporateResourcesSearch } from '../hooks/useCorporateResourcesSearch';
import { SearchFilters } from './SearchFilters';
import { SearchResultsList } from './SearchResultsList';
import { SearchStatePanel } from './SearchStatePanel';
import { parseDataSourceTypes, sanitizeMaxItems } from '../utils/corporateResourcesSearchUtils';

export default function CorporateResourcesSearch(props: ICorporateResourcesSearchProps): React.ReactElement {
  const request = React.useMemo(
    () => ({
      webUrl: props.webUrl,
      query: '',
      dataSourceTypes: parseDataSourceTypes(props.dataSourceTypesCsv),
      listTitleOrUrl: props.listTitleOrUrl,
      searchScopeUrl: props.searchScopeUrl,
      showFeaturedWhenEmpty: props.showFeaturedWhenEmpty,
      maxItems: sanitizeMaxItems(props.maxItems)
    }),
    [
      props.webUrl,
      props.dataSourceTypesCsv,
      props.listTitleOrUrl,
      props.searchScopeUrl,
      props.showFeaturedWhenEmpty,
      props.maxItems
    ]
  );

  const viewModel = useCorporateResourcesSearch(request);

  const resourceTypeOptions = React.useMemo(
    () => viewModel.facets.resourceTypes.map((facet) => ({ key: facet.value, text: `${facet.label} (${facet.count})` })),
    [viewModel.facets.resourceTypes]
  );

  const categoryOptions = React.useMemo(
    () => viewModel.facets.categories.map((facet) => ({ key: facet.value, text: `${facet.label} (${facet.count})` })),
    [viewModel.facets.categories]
  );

  return (
    <section className={`${styles.root} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.dark : ''}`}>
      <div className={styles.hero}>
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="xLargePlus" className={styles.title}>
            {props.title}
          </Text>
          <Text variant="medium" className={styles.subtitle}>
            {props.subtitle}
          </Text>
        </Stack>

        <div className={styles.heroMeta}>
          <Text variant="small">Usuario: {props.userDisplayName}</Text>
          <Text variant="small">Origen: {viewModel.sourceLabel || 'Sin origen activo'}</Text>
        </div>
      </div>

      <div className={styles.searchBar}>
        <SearchBox
          ariaLabel="Buscar recursos corporativos"
          placeholder="Buscar políticas, plantillas, procedimientos o manuales"
          value={viewModel.query}
          onChange={(_, value) => viewModel.setQuery(value ?? '')}
        />
        <DefaultButton text="Actualizar" onClick={viewModel.refresh} />
      </div>

      <SearchFilters
        resourceTypeOptions={resourceTypeOptions}
        categoryOptions={categoryOptions}
        resourceType={viewModel.filters.resourceType}
        category={viewModel.filters.category}
        sourceLabel={viewModel.sourceLabel}
        resultCount={viewModel.filteredItems.length}
        onResourceTypeChange={viewModel.setResourceType}
        onCategoryChange={viewModel.setCategory}
      />

      <SearchStatePanel
        status={viewModel.status}
        query={viewModel.query}
        resultCount={viewModel.filteredItems.length}
        errorMessage={viewModel.errorMessage}
        hasPartialData={viewModel.hasPartialData}
      />

      <SearchResultsList items={viewModel.filteredItems} featuredItems={viewModel.featuredItems} query={viewModel.query} />
    </section>
  );
}

