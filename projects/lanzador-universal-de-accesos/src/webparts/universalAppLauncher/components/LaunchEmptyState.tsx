import * as React from 'react';
import { DefaultButton, Text } from '@fluentui/react';
import styles from './UniversalAppLauncher.module.scss';

export interface ILaunchEmptyStateProps {
  title: string;
  message: string;
  onReset?: () => void;
}

export default function LaunchEmptyState(props: ILaunchEmptyStateProps): React.ReactElement {
  return (
    <section className={styles.emptyState} aria-live="polite">
      <Text variant="xLarge" block className={styles.emptyTitle}>
        {props.title}
      </Text>
      <Text variant="medium" block className={styles.emptyMessage}>
        {props.message}
      </Text>
      {props.onReset ? <DefaultButton text="Volver a mostrar todo" onClick={props.onReset} className={styles.emptyAction} /> : null}
    </section>
  );
}
