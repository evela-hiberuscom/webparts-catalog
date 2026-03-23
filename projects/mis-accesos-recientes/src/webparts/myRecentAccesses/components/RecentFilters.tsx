import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import type { RecentResourceType } from '../models/recentAccesses.types';
import styles from './MyRecentAccesses.module.scss';

export interface IRecentFiltersProps {
  availableTypes: readonly RecentResourceType[];
  sourceLabel: string;
  isPartialData: boolean;
  dataSourceMode: string;
  resourceTypeFilter: string;
}

export function RecentFilters(props: IRecentFiltersProps): React.ReactElement<IRecentFiltersProps> {
  return (
    <Stack tokens={{ childrenGap: 12 }} className={styles.filterBar}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="smallPlus" className={styles.filterLabel}>
          Fuente: {props.sourceLabel}
        </Text>
        <Text variant="small" className={styles.filterLabel}>
          Modo: {props.dataSourceMode}
        </Text>
      </Stack>

      <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        {props.availableTypes.map((type) => (
          <span key={type} className={`${styles.filterPill} ${props.resourceTypeFilter === type ? styles.filterPillActive : ''}`}>
            {type}
          </span>
        ))}
      </Stack>

      {props.isPartialData ? (
        <Text variant="small" className={styles.partialHint}>
          Vista parcial: algunos datos se resuelven desde una fuente de respaldo.
        </Text>
      ) : null}
    </Stack>
  );
}
