import * as React from 'react';

import styles from './AudienceQuickLinks.module.scss';

interface IAudienceFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function AudienceFilters(props: IAudienceFiltersProps): React.ReactElement {
  if (props.categories.length <= 1) {
    return <></>;
  }

  return (
    <div className={styles.filters} role="toolbar" aria-label="Filtrar accesos por categoría">
      {props.categories.map((category) => {
        const isSelected = category === props.selectedCategory;
        return (
          <button
            key={category}
            type="button"
            className={`${styles.filterButton} ${isSelected ? styles.filterButtonActive : ''}`}
            aria-pressed={isSelected}
            onClick={() => props.onSelectCategory(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
