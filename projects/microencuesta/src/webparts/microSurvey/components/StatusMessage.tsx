import * as React from 'react';
import styles from './MicroSurvey.module.scss';

interface IStatusMessageProps {
  title: string;
  message: string;
  tone: 'info' | 'success' | 'error';
}

export function StatusMessage(props: IStatusMessageProps): React.ReactElement {
  const toneClassName =
    props.tone === 'success'
      ? styles.statusSuccess
      : props.tone === 'error'
        ? styles.statusError
        : styles.statusInfo;

  return (
    <div className={`${styles.statusMessage} ${toneClassName}`} role="status">
      <strong>{props.title}</strong>
      <span>{props.message}</span>
    </div>
  );
}
