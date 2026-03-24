import * as React from 'react';
import { Icon, Shimmer, Spinner, SpinnerSize } from '@fluentui/react';
import * as strings from 'AudienceQuickLinksWebPartStrings';

import type { AudienceQuickLinksState } from '../models/audienceLinkModels';
import styles from './AudienceQuickLinks.module.scss';

interface IAudienceStatePanelProps {
  state: AudienceQuickLinksState;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function getStateClassName(state: AudienceQuickLinksState): string {
  if (state === 'partialData') {
    return styles.statePanelPartialData;
  }

  if (state === 'empty') {
    return styles.statePanelEmpty;
  }

  if (state === 'error') {
    return styles.statePanelError;
  }

  return '';
}

export function AudienceStatePanel(props: IAudienceStatePanelProps): React.ReactElement {
  if (props.state === 'loading') {
    return (
      <div className={styles.loadingPanel} aria-live="polite" aria-busy="true">
        <div className={styles.loadingHeader}>
          <Spinner size={SpinnerSize.small} label={strings.LoadingSpinnerLabel} />
        </div>
        <div className={styles.loadingGrid}>
          <Shimmer className={styles.loadingCard} />
          <Shimmer className={styles.loadingCard} />
          <Shimmer className={styles.loadingCard} />
          <Shimmer className={styles.loadingCard} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.statePanel} ${getStateClassName(props.state)}`}>
      <Icon iconName={props.state === 'error' ? 'Warning' : 'Info'} className={styles.stateIcon} aria-hidden="true" />
      <div className={styles.stateCopy}>
        <h3 className={styles.stateTitle}>{props.title}</h3>
        <p className={styles.stateMessage}>{props.message}</p>
      </div>
      {props.onAction && props.actionLabel ? (
        <button type="button" className={styles.retryButton} onClick={props.onAction}>
          {props.actionLabel}
        </button>
      ) : null}
    </div>
  );
}
