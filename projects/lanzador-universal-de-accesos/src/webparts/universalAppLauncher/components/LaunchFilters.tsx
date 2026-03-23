import * as React from 'react';
import { DefaultButton, SearchBox, Text } from '@fluentui/react';
import styles from './UniversalAppLauncher.module.scss';

export interface ILaunchFiltersProps {
  query: string;
  selectedCategory: string;
  categories: string[];
  audienceTokens: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export default function LaunchFilters(props: ILaunchFiltersProps): React.ReactElement {
  return (
    <div className={styles.filters}>
      <SearchBox
        ariaLabel="Buscar accesos"
        placeholder="Buscar por nombre, categoría o descripción"
        value={props.query}
        onChange={(_, value) => props.onQueryChange(value ?? '')}
        className={styles.searchBox}
      />
      <div className={styles.filterRow}>
        <Text variant="small" className={styles.filterLabel}>
          Categorías
        </Text>
        <div className={styles.pillRow}>
          {props.categories.map((category) => (
            <DefaultButton
              key={category}
              text={category}
              onClick={() => props.onCategoryChange(category)}
              className={`${styles.filterPill} ${props.selectedCategory === category ? styles.filterPillActive : ''}`}
            />
          ))}
        </div>
        <DefaultButton text="Limpiar" onClick={props.onReset} className={styles.resetButton} />
      </div>
      <div className={styles.audienceSummary}>
        <Text variant="small" className={styles.filterLabel}>
          Audiencia
        </Text>
        <div className={styles.pillRow}>
          {props.audienceTokens.length > 0 ? props.audienceTokens.map((token) => (
            <span key={token} className={styles.audienceChip}>
              {token}
            </span>
          )) : <span className={styles.audienceChip}>General</span>}
        </div>
      </div>
    </div>
  );
}
