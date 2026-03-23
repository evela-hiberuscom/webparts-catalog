import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import styles from './AutomaticWeeklySummary.module.scss';

interface IWeeklySummarySectionHeaderProps {
  title: string;
  subtitle: string;
  periodLabel: string;
}

export function WeeklySummarySectionHeader({
  title,
  subtitle,
  periodLabel
}: IWeeklySummarySectionHeaderProps): React.ReactElement {
  return (
    <header className={styles.header}>
      <div className={styles.headerCopy}>
        <span className={styles.accentLine} aria-hidden="true" />
        <Text variant="xLarge" as="h2" className={styles.title}>
          {title}
        </Text>
        <Text variant="medium" className={styles.subtitle}>
          {subtitle}
        </Text>
      </div>
      <div className={styles.periodPill} aria-label={`Periodo: ${periodLabel}`}>
        <Icon iconName="Calendar" />
        <span>{periodLabel}</span>
      </div>
    </header>
  );
}
