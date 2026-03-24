import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react';
import styles from './BirthdaysAndAnniversaries.module.scss';

export interface ICelebrationsEmptyStateProps {
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

const MESSAGE_BAR_TYPE = {
  info: MessageBarType.info,
  warning: MessageBarType.warning,
  error: MessageBarType.error
} as const;

export default function CelebrationsEmptyState(props: ICelebrationsEmptyStateProps): React.ReactElement {
  return (
    <MessageBar messageBarType={MESSAGE_BAR_TYPE[props.variant]} isMultiline className={styles.messageBar}>
      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="large" as="strong" block>
          {props.title}
        </Text>
        <Text variant="medium" block>
          {props.message}
        </Text>
        {props.onAction && props.actionLabel ? (
          <PrimaryButton text={props.actionLabel} onClick={props.onAction} />
        ) : null}
      </Stack>
    </MessageBar>
  );
}

