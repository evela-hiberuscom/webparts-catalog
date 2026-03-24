import * as React from 'react';
import { DefaultButton, Icon, Spinner, Text } from '@fluentui/react';
import styles from './ProjectStatus.module.scss';

export interface IProjectStatusStateProps {
  title: string;
  message: string;
  status: 'loading' | 'empty' | 'error';
  onRetry: () => void;
}

export function ProjectStatusState({
  title,
  message,
  status,
  onRetry
}: IProjectStatusStateProps): React.ReactElement {
  if (status === 'loading') {
    return (
      <div className={styles.statePanel} role="status" aria-live="polite">
        <div className={styles.stateContent}>
          <Spinner label={message} />
        </div>
      </div>
    );
  }

  const iconName = status === 'error' ? 'Warning' : 'Info';

  return (
    <div className={styles.statePanel} role={status === 'error' ? 'alert' : 'status'}>
      <div className={styles.stateContent}>
        <Icon iconName={iconName} className={styles.stateIcon} />
        <Text variant="large" as="h3" className={styles.stateTitle}>
          {title}
        </Text>
        <Text variant="small" className={styles.stateMessage}>
          {message}
        </Text>
        <DefaultButton text="Reintentar" onClick={onRetry} className={styles.stateRetry} />
      </div>
    </div>
  );
}
