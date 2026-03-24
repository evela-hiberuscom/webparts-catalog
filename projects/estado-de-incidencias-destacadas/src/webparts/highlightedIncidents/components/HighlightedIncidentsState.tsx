import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, Shimmer, ShimmerElementType, Stack, Text } from '@fluentui/react';
import styles from './HighlightedIncidents.module.scss';

export interface IHighlightedIncidentsStateProps {
  state: 'loading' | 'empty' | 'error';
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

function renderLoadingRows(): React.ReactElement {
  return (
    <div className={styles.shimmerList} aria-label="Cargando incidencias destacadas">
      {Array.from({ length: 4 }).map((_, index) => (
        <Shimmer
          key={`incident-shimmer-${index}`}
          className={styles.shimmerCard}
          shimmerElements={[
            { type: ShimmerElementType.line, width: '28%' },
            { type: ShimmerElementType.gap, width: '4%' },
            { type: ShimmerElementType.line, width: '22%' },
            { type: ShimmerElementType.gap, width: '46%' }
          ]}
        />
      ))}
    </div>
  );
}

export default function HighlightedIncidentsState(props: IHighlightedIncidentsStateProps): React.ReactElement<IHighlightedIncidentsStateProps> {
  const { state, title, message, retryLabel, onRetry } = props;

  if (state === 'loading') {
    return renderLoadingRows();
  }

  const showRetry = state === 'error' && typeof onRetry === 'function';

  return (
    <Stack className={styles.statePanel} tokens={{ childrenGap: 14 }} horizontalAlign="center">
      <Text variant="mediumPlus" className={styles.stateTitle}>
        {title}
      </Text>
      {state === 'error' ? (
        <MessageBar messageBarType={MessageBarType.error} isMultiline />
      ) : (
        <Text variant="medium" className={styles.stateMessage}>
          {message}
        </Text>
      )}
      {state === 'error' ? (
        <Text variant="medium" className={styles.stateMessage}>
          {message}
        </Text>
      ) : null}
      {showRetry ? (
        <DefaultButton className={styles.retryButton} onClick={onRetry} text={retryLabel ?? 'Reintentar'} />
      ) : null}
    </Stack>
  );
}
