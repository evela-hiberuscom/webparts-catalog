import * as React from 'react';
import styles from './KpiMiniCards.module.scss';

export interface IKpiSkeletonProps {
  count?: number;
}

export default function KpiSkeleton(props: IKpiSkeletonProps): React.ReactElement {
  const items = Array.from({ length: props.count ?? 4 }, (_, index) => index);

  return (
    <div className={styles.skeletonGrid} aria-hidden="true">
      {items.map((item) => (
        <div key={item} className={styles.skeletonCard}>
          <span className={styles.skeletonLineShort} />
          <span className={styles.skeletonValue} />
          <span className={styles.skeletonLineMedium} />
          <span className={styles.skeletonLineLong} />
        </div>
      ))}
    </div>
  );
}

