import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import styles from './CorporateResourcesSearch.module.scss';
import type { ICorporateResourceItem } from '../models/corporateResourcesSearchModels';
import { SearchResultCard } from './SearchResultCard';

export interface ISearchResultsListProps {
  items: ICorporateResourceItem[];
  featuredItems: ICorporateResourceItem[];
  query: string;
}

export function SearchResultsList(props: ISearchResultsListProps): React.ReactElement {
  const showFeatured = !props.query.trim() && props.featuredItems.length > 0;
  const visibleItems = showFeatured ? props.featuredItems : props.items;

  return (
    <div className={styles.resultsPanel}>
      {showFeatured ? (
        <div className={styles.featuredHeader}>
          <Text variant="large">Recursos destacados</Text>
          <Text variant="small">Disponibles para arrancar desde la portada o una página temática.</Text>
        </div>
      ) : null}

      <Stack tokens={{ childrenGap: 12 }}>
        {visibleItems.map((item) => (
          <SearchResultCard key={`${item.sourceType}-${item.id}-${item.openUrl ?? item.title}`} item={item} />
        ))}
      </Stack>
    </div>
  );
}

