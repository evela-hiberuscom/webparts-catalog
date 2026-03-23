import * as React from 'react';
import { DefaultButton, Icon, Spinner, Text } from '@fluentui/react';
import styles from './AutomaticWeeklySummary.module.scss';

interface IWeeklySummaryStateViewProps {
  status: 'loading' | 'empty' | 'error';
  title: string;
  message: string;
  onRetry: () => void;
}

export function WeeklySummaryStateView({
  status,
  title,
  message,
  onRetry
}: IWeeklySummaryStateViewProps): React.ReactElement {
  if (status === 'loading') {
    return (
      <div className={styles.statePanel} role="status" aria-live="polite">
        <Spinner label={message} />
      </div>
    );
  }

  return (
    <div className={styles.statePanel}>
      <Icon iconName={status === 'error' ? 'Warning' : 'Info'} className={styles.stateIcon} />
      <Text variant="large" as="h3" className={styles.stateTitle}>
        {title}
      </Text>
      <Text variant="small" className={styles.stateMessage}>
        {message}
      </Text>
      <DefaultButton text="Reintentar" onClick={onRetry} className={styles.retryButton} />
    </div>
  );
}
