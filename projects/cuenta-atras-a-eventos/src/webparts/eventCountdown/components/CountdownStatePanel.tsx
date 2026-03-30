import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import styles from './EventCountdown.module.scss';

export interface ICountdownStatePanelProps {
  title: string;
  message: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  warning?: boolean;
}

export default function CountdownStatePanel(props: ICountdownStatePanelProps): React.ReactElement {
  return (
    <Stack tokens={{ childrenGap: 16 }} className={styles.statePanel}>
      {props.loading ? <Spinner size={SpinnerSize.large} label={props.message} /> : undefined}
      <Text as="h3" variant="large" className={styles.stateTitle}>
        {props.title}
      </Text>
      <Text variant="medium" className={styles.stateMessage}>
        {props.message}
      </Text>
      {props.details ? (
        <MessageBar messageBarType={props.warning ? MessageBarType.warning : MessageBarType.info} isMultiline>
          {props.details}
        </MessageBar>
      ) : undefined}
      {props.actionLabel && props.onAction ? <PrimaryButton text={props.actionLabel} onClick={props.onAction} /> : undefined}
    </Stack>
  );
}
