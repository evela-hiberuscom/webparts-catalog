import * as React from 'react';
import { DefaultButton, Stack, Text } from '@fluentui/react';
import styles from './QuickActionsCenter.module.scss';
import { ALL_CATEGORIES_LABEL } from '../utils/quickActionsUtils';

export interface IQuickActionsFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function QuickActionsFilterBar(props: IQuickActionsFilterBarProps): React.ReactElement {
  return (
    <div className={styles.filterBar}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <Text variant="mediumPlus">Filtrar por categoría</Text>
        <Text variant="small" className={styles.filterHint}>
          {props.categories.length ? `${props.categories.length} categorías` : 'Todas'}
        </Text>
      </Stack>
      <div className={styles.filterChips}>
        <DefaultButton
          text={ALL_CATEGORIES_LABEL}
          onClick={() => props.onCategoryChange(ALL_CATEGORIES_LABEL)}
          className={props.selectedCategory === ALL_CATEGORIES_LABEL ? styles.filterChipSelected : styles.filterChip}
        />
        {props.categories.map((category) => (
          <DefaultButton
            key={category}
            text={category}
            onClick={() => props.onCategoryChange(category)}
            className={props.selectedCategory.toLowerCase() === category.toLowerCase() ? styles.filterChipSelected : styles.filterChip}
          />
        ))}
      </div>
    </div>
  );
}
