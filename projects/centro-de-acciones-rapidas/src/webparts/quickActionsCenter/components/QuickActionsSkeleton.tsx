import * as React from 'react';
import { Shimmer, ShimmerElementType, Stack } from '@fluentui/react';
import styles from './QuickActionsCenter.module.scss';

export default function QuickActionsSkeleton(): React.ReactElement {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <article className={styles.card} key={index}>
          <Stack tokens={{ childrenGap: 12 }}>
            <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 36 }]} />
            <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 18 }]} />
            <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 12 }]} />
            <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 12 }]} />
          </Stack>
        </article>
      ))}
    </div>
  );
}
