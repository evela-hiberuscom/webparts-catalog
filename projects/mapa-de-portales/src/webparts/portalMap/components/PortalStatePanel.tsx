import * as React from 'react';
import { MessageBar, MessageBarType, Shimmer, ShimmerElementType, Stack, Text } from '@fluentui/react';
import * as strings from 'PortalMapWebPartStrings';
import type { PortalMapState } from '../models/portalMapModels';
import styles from './PortalMap.module.scss';

interface IPortalStatePanelProps {
  state: PortalMapState;
  errorMessage?: string;
}

export function PortalStatePanel(props: IPortalStatePanelProps): React.ReactElement<IPortalStatePanelProps> {
  if (props.state === 'loading') {
    return (
      <div className={styles.statePanel}>
        <Text variant="large">{strings.StateLoadingTitle}</Text>
        <Text variant="small">{strings.StateLoadingMessage}</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '65%', height: 28 }]} />
          <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '90%', height: 18 }]} />
          <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '82%', height: 18 }]} />
        </Stack>
      </div>
    );
  }

  if (props.state === 'empty') {
    return (
      <div className={styles.statePanel}>
        <Text variant="large">{strings.StateEmptyTitle}</Text>
        <Text variant="small">{strings.StateEmptyMessage}</Text>
      </div>
    );
  }

  return (
    <div className={styles.statePanel}>
      <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
        <strong>{strings.StateErrorTitle}</strong>{' - '}{props.errorMessage ?? strings.StateErrorMessage}
      </MessageBar>
    </div>
  );
}
