import * as React from 'react';
import { DefaultButton, Icon, Text } from '@fluentui/react';
import styles from './GovernanceDashboard.module.scss';

export interface IGovernanceStatePanelProps {
  iconName: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function GovernanceStatePanel(props: IGovernanceStatePanelProps): React.ReactElement {
  return (
    <section className={styles.statePanel} aria-live="polite">
      <Icon iconName={props.iconName} aria-hidden="true" className={styles.stateIcon} />
      <Text as="h3" variant="xLarge" block className={styles.stateTitle}>
        {props.title}
      </Text>
      <Text variant="medium" block className={styles.stateMessage}>
        {props.message}
      </Text>
      {props.actionLabel && props.onAction ? (
        <DefaultButton text={props.actionLabel} onClick={props.onAction} className={styles.stateButton} />
      ) : null}
    </section>
  );
}
