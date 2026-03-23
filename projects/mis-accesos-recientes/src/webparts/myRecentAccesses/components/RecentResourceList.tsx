import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import type { IRecentResource } from '../models/recentAccesses.types';
import { RecentResourceCard } from './RecentResourceCard';
import styles from './MyRecentAccesses.module.scss';

export interface IRecentResourceListProps {
  items: readonly IRecentResource[];
}

export function RecentResourceList(props: IRecentResourceListProps): React.ReactElement<IRecentResourceListProps> {
  return (
    <Stack tokens={{ childrenGap: 16 }} className={styles.resourceList}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="large" className={styles.sectionTitle}>
          Recursos visibles
        </Text>
        <Text variant="small" className={styles.sectionHint}>
          {props.items.length} elemento{props.items.length === 1 ? '' : 's'}
        </Text>
      </Stack>

      <div className={styles.resourceGrid}>
        {props.items.map((item) => (
          <RecentResourceCard key={item.id} item={item} />
        ))}
      </div>
    </Stack>
  );
}
