import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'HowDoIDoThisWebPartStrings';
import { ALL_CATEGORIES_LABEL } from '../utils/howDoIDoThisUtils';
import styles from './HowDoIDoThis.module.scss';

export interface IGuideCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function GuideCategoryFilter(props: IGuideCategoryFilterProps): React.ReactElement<IGuideCategoryFilterProps> {
  const options = [{ value: ALL_CATEGORIES_LABEL, label: strings.FilterAllLabel }, ...props.categories.map((category) => ({ value: category, label: category }))];

  return (
    <div className={styles.filterBar} role="toolbar" aria-label={strings.CategoryFilterLabel}>
      {options.map((option) => {
        const isSelected = props.selectedCategory.toLowerCase() === option.value.toLowerCase();

        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.filterButton} ${isSelected ? styles.filterButtonSelected : ''}`}
            aria-pressed={isSelected}
            onClick={() => props.onCategoryChange(option.value)}
          >
            {escape(option.label)}
          </button>
        );
      })}
    </div>
  );
}
