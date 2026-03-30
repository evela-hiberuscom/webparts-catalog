import * as React from 'react';
import * as strings from 'StartARequestWebPartStrings';
import styles from './StartARequest.module.scss';

export interface IRequestCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onChange(category: string): void;
}

export function RequestCategoryFilter(props: IRequestCategoryFilterProps): React.ReactElement {
  const categories = props.categories.length > 0 ? props.categories : [];

  return (
    <div className={styles.filterBar} role="group" aria-label={strings.CategoryFilterAriaLabel}>
      <button
        type="button"
        aria-pressed={props.activeCategory === 'all'}
        onClick={() => props.onChange('all')}
        className={`${styles.filterButton} ${props.activeCategory === 'all' ? styles.filterButtonActive : ''}`}
      >
        {strings.AllCategoriesLabel}
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          aria-pressed={props.activeCategory.toLowerCase() === category.toLowerCase()}
          onClick={() => props.onChange(category)}
          className={`${styles.filterButton} ${props.activeCategory.toLowerCase() === category.toLowerCase() ? styles.filterButtonActive : ''}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
