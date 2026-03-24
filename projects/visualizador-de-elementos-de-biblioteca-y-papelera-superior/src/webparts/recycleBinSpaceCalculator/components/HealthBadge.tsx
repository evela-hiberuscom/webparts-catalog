import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import styles from './RecycleBinSpaceCalculator.module.scss';
import type { RecycleBinHealthLevel } from '../models/recycleBinSpaceCalculatorModels';

export interface IHealthBadgeProps {
  level: RecycleBinHealthLevel;
  reasons: string[];
}

const LEVEL_TO_ICON: Record<RecycleBinHealthLevel, string> = {
  ok: 'CheckMark',
  warning: 'Warning',
  critical: 'StatusErrorFull',
  unknown: 'Help'
};

const LEVEL_TO_CLASS: Record<RecycleBinHealthLevel, string> = {
  ok: styles.ok,
  warning: styles.warning,
  critical: styles.critical,
  unknown: styles.neutral
};

export function HealthBadge(props: IHealthBadgeProps): React.ReactElement {
  return (
    <div className={`${styles.healthBadge} ${LEVEL_TO_CLASS[props.level]}`}>
      <Icon iconName={LEVEL_TO_ICON[props.level]} aria-hidden="true" />
      <div>
        <Text variant="smallPlus" className={styles.healthLabel}>
          Estado
        </Text>
        <Text variant="medium" className={styles.healthValue}>
          {props.level.toUpperCase()}
        </Text>
        {props.reasons[0] ? (
          <Text variant="xSmall" className={styles.healthReason}>
            {props.reasons[0]}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
