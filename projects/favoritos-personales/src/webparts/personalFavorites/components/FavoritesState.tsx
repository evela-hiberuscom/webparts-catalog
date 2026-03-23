import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';

import styles from './PersonalFavorites.module.scss';

export interface IFavoritesStateProps {
  state: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  title: string;
  description: string;
  sourceLabel: string;
  userDisplayName: string;
  warningMessages: string[];
  errorMessage?: string;
}

export function FavoritesState(props: IFavoritesStateProps): React.ReactElement {
  if (props.state === 'loading') {
    return (
      <div className={styles.loadingState}>
        <Spinner size={SpinnerSize.medium} label="Cargando favoritos..." />
      </div>
    );
  }

  if (props.state === 'error') {
    return (
      <MessageBar messageBarType={MessageBarType.error}>
        {props.errorMessage ?? 'No se pudieron cargar los favoritos.'}
      </MessageBar>
    );
  }

  if (props.state === 'empty') {
    return (
      <section className={styles.emptyState} aria-live="polite">
        <p className={styles.emptyEyebrow}>{props.title}</p>
        <h3 className={styles.emptyTitle}>No tienes favoritos visibles, {props.userDisplayName || 'usuario'}.</h3>
        <p className={styles.emptyText}>{props.description}</p>
        <p className={styles.emptyMeta}>Fuente: {props.sourceLabel}</p>
      </section>
    );
  }

  if (props.state === 'partialData') {
    return (
      <MessageBar messageBarType={MessageBarType.warning} isMultiline>
        <strong>Datos parciales.</strong>{' '}
        {props.warningMessages.length > 0
          ? props.warningMessages.join(' ')
          : 'Algunos favoritos no tienen toda la información necesaria.'}
      </MessageBar>
    );
  }

  return <></>;
}
