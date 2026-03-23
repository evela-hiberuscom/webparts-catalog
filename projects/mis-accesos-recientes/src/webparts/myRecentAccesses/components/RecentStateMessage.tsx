import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react';
import styles from './MyRecentAccesses.module.scss';

export interface IRecentStateMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type: MessageBarType;
}

export function RecentStateMessage(props: IRecentStateMessageProps): React.ReactElement<IRecentStateMessageProps> {
  return (
    <Stack tokens={{ childrenGap: 12 }} className={styles.statePanel}>
      <MessageBar messageBarType={props.type}>{props.message}</MessageBar>
      <Text variant="mediumPlus" className={styles.stateTitle}>
        {props.title}
      </Text>
      {props.actionLabel && props.onAction ? (
        <PrimaryButton text={props.actionLabel} onClick={props.onAction} />
      ) : null}
    </Stack>
  );
}
