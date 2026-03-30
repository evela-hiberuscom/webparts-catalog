import * as React from 'react';
import { Toggle } from '@fluentui/react';

import * as strings from 'PlannedMaintenanceWebPartStrings';

import styles from './PlannedMaintenance.module.scss';

interface IMaintenanceFilterBarProps {
  hideCompleted: boolean;
  onHideCompletedChange: (checked: boolean) => void;
  inProgressCount: number;
  upcomingCount: number;
  completedCount: number;
}

export function MaintenanceFilterBar(props: IMaintenanceFilterBarProps): React.ReactElement {
  return (
    <div className={styles.filterBar}>
      <Toggle
        inlineLabel={true}
        label={strings.HideCompletedFieldLabel}
        checked={props.hideCompleted}
        onText={strings.ToggleOnLabel}
        offText={strings.ToggleOffLabel}
        onChange={(_, checked) => props.onHideCompletedChange(Boolean(checked))}
      />
      <div className={styles.summaryPills} aria-label={strings.SummarySectionAriaLabel}>
        <span className={`${styles.summaryPill} ${styles.summaryInProgress}`}>{strings.StatusInProgress}: {props.inProgressCount}</span>
        <span className={`${styles.summaryPill} ${styles.summaryUpcoming}`}>{strings.StatusUpcoming}: {props.upcomingCount}</span>
        <span className={`${styles.summaryPill} ${styles.summaryCompleted}`}>{strings.StatusCompleted}: {props.completedCount}</span>
      </div>
    </div>
  );
}
