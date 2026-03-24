import * as React from 'react';
import { Shimmer, ShimmerElementType, Stack } from '@fluentui/react';
import styles from './EventCountdown.module.scss';

export default function CountdownSkeleton(): React.ReactElement {
  return (
    <Stack tokens={{ childrenGap: 16 }} className={styles.skeletonWrap}>
      <Shimmer
        shimmerElements={[
          { type: ShimmerElementType.line, height: 18, width: '32%' },
          { type: ShimmerElementType.gap, width: '100%' },
          { type: ShimmerElementType.line, height: 72, width: '84%' }
        ]}
      />
      <Shimmer
        shimmerElements={[
          { type: ShimmerElementType.line, height: 22, width: '18%' },
          { type: ShimmerElementType.gap, width: '4%' },
          { type: ShimmerElementType.line, height: 22, width: '18%' },
          { type: ShimmerElementType.gap, width: '4%' },
          { type: ShimmerElementType.line, height: 22, width: '18%' }
        ]}
      />
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 36, width: '28%' }]} />
    </Stack>
  );
}
