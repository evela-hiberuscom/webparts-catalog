import * as React from 'react';
import { Dropdown, IDropdownOption, Stack, Text } from '@fluentui/react';
import styles from './CorporateResourcesSearch.module.scss';

export interface ISearchFiltersProps {
  resourceTypeOptions: IDropdownOption[];
  categoryOptions: IDropdownOption[];
  resourceType: string;
  category: string;
  sourceLabel: string;
  resultCount: number;
  onResourceTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function SearchFilters(props: ISearchFiltersProps): React.ReactElement {
  const hasFilters = props.resourceTypeOptions.length > 0 || props.categoryOptions.length > 0;

  if (!hasFilters) {
    return (
      <Stack horizontal horizontalAlign="space-between" className={styles.filtersSummary}>
        <Text variant="small">Fuente activa: {props.sourceLabel || 'Sin fuentes'}</Text>
        <Text variant="small">{props.resultCount} resultados</Text>
      </Stack>
    );
  }

  return (
    <div className={styles.filtersPanel}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="end" tokens={{ childrenGap: 16 }} wrap>
        <Dropdown
          className={styles.filterControl}
          label="Tipo de recurso"
          placeholder="Todos"
          selectedKey={props.resourceType || undefined}
          options={[{ key: '', text: 'Todos los tipos' }, ...props.resourceTypeOptions]}
          onChange={(_, option) => props.onResourceTypeChange(String(option?.key ?? ''))}
        />
        <Dropdown
          className={styles.filterControl}
          label="Categoría"
          placeholder="Todas"
          selectedKey={props.category || undefined}
          options={[{ key: '', text: 'Todas las categorías' }, ...props.categoryOptions]}
          onChange={(_, option) => props.onCategoryChange(String(option?.key ?? ''))}
        />
        <div className={styles.filtersSummary}>
          <Text variant="small">Fuente activa: {props.sourceLabel || 'Sin fuentes'}</Text>
          <Text variant="small">{props.resultCount} resultados</Text>
        </div>
      </Stack>
    </div>
  );
}
