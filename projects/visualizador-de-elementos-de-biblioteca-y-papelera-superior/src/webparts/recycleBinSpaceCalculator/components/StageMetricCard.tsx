import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import styles from './RecycleBinSpaceCalculator.module.scss';

export interface IStageMetricCardProps {
  title: string;
  value: string;
  caption: string;
  iconName: string;
  variant?: 'ok' | 'warning' | 'critical' | 'neutral';
}

const VARIANT_TO_CLASS: Record<NonNullable<IStageMetricCardProps['variant']>, string> = {
  ok: styles.ok,
  warning: styles.warning,
  critical: styles.critical,
  neutral: styles.neutral
};

export function StageMetricCard(props: IStageMetricCardProps): React.ReactElement {
  return (
    <article className={`${styles.metricCard} ${VARIANT_TO_CLASS[props.variant ?? 'neutral']}`}>
      <div className={styles.metricHeader}>
        <Icon iconName={props.iconName} aria-hidden="true" />
        <Text variant="smallPlus" className={styles.metricTitle}>
          {props.title}
        </Text>
      </div>
      <Text variant="xxLarge" className={styles.metricValue}>
        {props.value}
      </Text>
      <Text variant="small" className={styles.metricCaption}>
        {props.caption}
      </Text>
    </article>
  );
}
