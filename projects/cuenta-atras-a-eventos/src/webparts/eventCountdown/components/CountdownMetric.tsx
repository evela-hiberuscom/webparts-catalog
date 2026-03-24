import * as React from 'react';
import { Text } from '@fluentui/react';
import styles from './EventCountdown.module.scss';

export interface ICountdownMetricProps {
  value: string;
  label: string;
}

export default function CountdownMetric(props: ICountdownMetricProps): React.ReactElement {
  return (
    <div className={styles.metric} aria-label={`${props.value} ${props.label}`}>
      <Text as="strong" className={styles.metricValue}>
        {props.value}
      </Text>
      <Text as="span" className={styles.metricLabel}>
        {props.label}
      </Text>
    </div>
  );
}
