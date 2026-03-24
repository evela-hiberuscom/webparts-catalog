import * as React from 'react';
import { DefaultButton, Icon, Text } from '@fluentui/react';
import styles from './KpiMiniCards.module.scss';

export interface IKpiStatePanelProps {
  iconName: string;
  title: string;
  message: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function KpiStatePanel(props: IKpiStatePanelProps): React.ReactElement {
  return (
    <section className={styles.statePanel} aria-live="polite">
      <Icon iconName={props.iconName} className={styles.stateIcon} aria-hidden="true" />
      <Text variant="xLarge" as="h3" block className={styles.stateTitle}>
        {props.title}
      </Text>
      <Text variant="medium" block className={styles.stateMessage}>
        {props.message}
      </Text>
      {props.details ? (
        <Text variant="small" block className={styles.stateDetails}>
          {props.details}
        </Text>
      ) : null}
      {props.onAction && props.actionLabel ? (
        <DefaultButton className={styles.stateButton} text={props.actionLabel} onClick={props.onAction} />
      ) : null}
    </section>
  );
}

